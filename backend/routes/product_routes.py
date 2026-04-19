

from flask import Blueprint, request, jsonify, current_app
import uuid
import time

from more_itertools import last
from models.product_model import create_product_object
from services.BlockchainService import verify_on_chain, register_on_chain
import hashlib
import datetime


product_routes = Blueprint("product_routes", __name__)



@product_routes.route("/register", methods=["POST"])
def register_product():
    data = request.json
    db = current_app.config["DB"]

    # ✅ VALIDATION
    if not data.get("name") or not data.get("serial"):
        return jsonify({"error": "Missing required fields"}), 400

    if not data.get("email"):
        return jsonify({"error": "Email required"}), 400

    # 🔥 GENERATE PRODUCT ID
    product_id = str(uuid.uuid4())[:8]

    # 🔥 FIND MANUFACTURER
    manufacturer = db.users.find_one({
    "email": data.get("email").lower()
    })

    if not manufacturer:
        return jsonify({"error": "Manufacturer not found"}), 404


    # 🔥 BLOCKCHAIN REGISTRATION
    try:
        register_on_chain(product_id, data.get("name"), data.get("serial"))
    except Exception as e:
        return jsonify({"error": "Blockchain error: " + str(e)}), 500

    # 🔥 PRODUCT OBJECT
    product = create_product_object(data, product_id, manufacturer)

    db.products.insert_one(product)

    # 🔥 OPTIONAL: INITIAL OWNERSHIP LOG
    db.ownership_history.insert_one({
    "productId": product_id,
    "from": None,
    "to": None,
    "type": "GENESIS",
    "timestamp": int(datetime.datetime.utcnow().timestamp())
    })

    return jsonify({
        "message": "Product registered successfully",
        "productId": product_id
    })

# ================= VERIFY PRODUCT =================


@product_routes.route("/verify/<product_id>", methods=["GET"])
def verify(product_id):
    db = current_app.config["DB"]

    user_email = request.args.get("email", "").lower()

    def log_verification(authentic, reason):
        if user_email:
            db.verification_logs.insert_one({
                "productId": product_id,
                "user": user_email,
                "timestamp": int(time.time()),
                "authentic": authentic,
                "reason": reason
            })

    # 🔍 FETCH PRODUCT
    product = db.products.find_one(
        {"productId": product_id},
        {"_id": 0}
    )

    # ❌ NOT FOUND
    if not product:
        log_verification(False, "Product not found")
        return jsonify({
            "authentic": False,
            "reason": "Product not found in database",
            "fraudScore": 95,
            "owner": None
        })

    # 🔗 BLOCKCHAIN CHECK
    try:
        is_on_chain = verify_on_chain(product_id)
    except:
        log_verification(False, "Blockchain error")
        return jsonify({
            "authentic": False,
            "reason": "Blockchain verification failed",
            "fraudScore": 80,
            "owner": product.get("owner")
        })

    if not is_on_chain:
        log_verification(False, "Not on blockchain")
        return jsonify({
            "authentic": False,
            "product": product,
            "reason": "Product not registered on blockchain",
            "fraudScore": 85,
            "owner": product.get("owner")
        })

    # 🔐 HASH
    expected_hash = hashlib.sha256(
        f"{product['productId']}{product['name']}{product['serial']}".encode()
    ).hexdigest()

    # 🔥 GET USER
    user = db.users.find_one({"email": user_email}) if user_email else None
    if not user or not user.get("wallet"):
        log_verification(False, "Invalid user wallet")
        return jsonify({
        "authentic": False,
        "product": product,
        "reason": "Invalid user or wallet not found",
        "fraudScore": 70,
        "hash": expected_hash,
        "status": "invalid_user",
        "owner": product.get("owner")
    })
    user_wallet = user.get("wallet") if user else None

    current_owner = product.get("owner")
    # 🔥 COOLDOWN CHECK
   
    last = db.ownership_history.find_one(
    {"productId": product_id},
    sort=[("timestamp", -1)]
    )
    if last and time.time() - last.get("timestamp", 0) < 5:
        return jsonify({
            "error": "Action too fast. Try again."
        }), 429

    

    # 🚨 CASE 1: PRODUCT NOT OWNED → CLAIM
    if not current_owner and user_wallet:

    # 🔥 COOLDOWN ONLY FOR CLAIM
        last = db.ownership_history.find_one(
        {"productId": product_id},
        sort=[("timestamp", -1)]
    )

        if last and time.time() - last.get("timestamp", 0) < 2:
             return jsonify({"error": "Action too fast"}), 429

        result = db.products.update_one(
             {
                 "productId": product_id,
                 "owner": None
             },
             {
                 "$set": {"owner": user_wallet}
             }
         )    

        if result.modified_count == 0:
            updated = db.products.find_one({"productId": product_id}, {"_id": 0})
            return jsonify({
                "authentic": True,
                "product": updated,
                "reason": "Product just got claimed by another user",
                "status": "locked",
                "fraudScore": 60,
                "hash": expected_hash,
                "owner": updated.get("owner")
            })
    
        db.ownership_history.insert_one({
            "productId": product_id,
            "from": None,
            "to": user_wallet,
            "type": "CLAIM",
            "timestamp": int(time.time())
        })

        product["owner"] = user_wallet

        log_verification(True, "Claimed ownership")

        return jsonify({
            "authentic": True,
            "product": product,
            "reason": "Product verified and ownership claimed",
            "fraudScore": 5,
            "hash": expected_hash,
            "status": "claimed",
            "owner": product.get("owner")
        })

    # 🚨 CASE 2: SAME USER (OWNER REVERIFY)
    if current_owner and user_wallet == current_owner:

        log_verification(True, "Owner re-verified")

        return jsonify({
            "authentic": True,
            "product": product,
            "reason": "You are the owner",
            "fraudScore": 5,
            "hash": expected_hash,
            "status": "owner",
            "owner": product.get("owner")
        })

    # 🚨 CASE 3: DIFFERENT USER → BLOCK
    if current_owner and user_wallet != current_owner:

        log_verification(False, "Already owned by another user")

        return jsonify({
            "authentic": True,
            "product": product,
            "reason": "Product already owned by another user",
            "fraudScore": 60,
            "status": "locked",
            "owner": product.get("owner")
        })

    # 🧩 FALLBACK (NO USER)
    log_verification(True, "Verified without user")

    return jsonify({
        "authentic": True,
        "product": product,
        "reason": "Verified successfully",
        "fraudScore": 5,
        "hash": expected_hash,
        "status": "verified",
        "owner": product.get("owner")
    })


# ================= GET SINGLE PRODUCT =================
@product_routes.route("/<product_id>", methods=["GET"])
def get_product(product_id):
    db = current_app.config["DB"]

    product = db.products.find_one(
        {"productId": product_id},
        {"_id": 0}
    )

    if not product:
        return jsonify({
            "error": "Product not found"
        }), 404

    return jsonify(product)



# ================= VERIFIED PRODUCTS =================
@product_routes.route("/verified", methods=["GET"])
def get_verified_products():
    db = current_app.config["DB"]

    products = list(db.products.find({}, {
    "_id": 0,
    "productId": 1,
    "name": 1,
    "serial": 1,
    "owner": 1
}))

    verified_list = []

    for product in products:
        try:
            is_valid = verify_on_chain(product["productId"])
        except:
            is_valid = False

        verified_list.append({
            **product,
            "authentic": is_valid
        })

    return jsonify(verified_list)


import hashlib

@product_routes.route("/ledger", methods=["GET"])
def get_ledger():
    db = current_app.config["DB"]

    products = list(db.products.find({}, {
    "_id": 0,
    "productId": 1,
    "name": 1,
    "serial": 1,
    "owner": 1
}))

    ledger = []

    for i, p in enumerate(products):
        try:
            is_valid = verify_on_chain(p["productId"])
        except:
            is_valid = False

        # 🔥 Generate pseudo tx hash (can replace with real later)
        raw = f"{p['productId']}{p['serial']}{p.get('createdAt',0)}"
        tx_hash = hashlib.sha256(raw.encode()).hexdigest()

        ledger.append({
            "index": i + 1,
            "productId": p["productId"],
            "name": p["name"],
            "manufacturer": p.get("manufacturer", "-"),
            "timestamp": p.get("createdAt", 0),
            "authentic": is_valid,
            "hash": tx_hash
        })

    ledger = sorted(ledger, key=lambda x: x["timestamp"], reverse=True)

    return jsonify(ledger)

# ================= DASHBOARD ANALYTICS =================
@product_routes.route("/analytics", methods=["GET"])
def get_analytics():
    db = current_app.config["DB"]

    products = list(db.products.find({}, {
    "_id": 0,
    "productId": 1,
    "name": 1,
    "serial": 1,
    "owner": 1
}))

    total = len(products)
    verified = 0
    fake = 0

    timeline = {}

    recent = []

    for p in products:
        try:
            is_valid = verify_on_chain(p["productId"])
        except:
            is_valid = False

        if is_valid:
            verified += 1
        else:
            fake += 1

        # timeline aggregation
        date = p.get("createdAt", 0)
        if date:
            key = str(date)[:5]
            timeline[key] = timeline.get(key, 0) + 1

        # recent activity

        raw_time = p.get("createdAt", 0)

        # 🔥 NORMALIZE TIME
        if isinstance(raw_time, datetime.datetime):
            raw_time = int(raw_time.timestamp())

        elif isinstance(raw_time, str):
            try:
                raw_time = int(datetime.datetime.fromisoformat(raw_time).timestamp())
            except:
                raw_time = 0

        elif not isinstance(raw_time, int):
            raw_time = 0

        recent.append({
            "event": "Verified" if is_valid else "Flagged",
            "product": p.get("name", "Unknown"),
            "time": raw_time
        })

    return jsonify({
        "total": total,
        "verified": verified,
        "fake": fake,
        "timeline": timeline,
        "recent": sorted(
            recent,
            key=lambda x: x.get("time", 0),
            reverse=True
        )[:5]
        })

# ================= SERVICE CENTER =================
@product_routes.route("/service/analytics", methods=["GET"])
def service_analytics():
    db = current_app.config["DB"]

    repairs = list(db.repairs.find({}, {"_id": 0}))
    products = list(db.products.find({}, {
    "_id": 0,
    "productId": 1,
    "name": 1,
    "serial": 1,
    "owner": 1
}))

    total_repairs = len(repairs)
    completed = len([r for r in repairs if r.get("status") == "completed"])
    pending = total_repairs - completed

    recent = sorted(repairs, key=lambda x: x.get("timestamp", 0), reverse=True)[:5]

    return jsonify({
        "total_repairs": total_repairs,
        "completed": completed,
        "pending": pending,
        "recent": recent
    })

# ================= SMART WARRANTY =================

@product_routes.route("/smart-warranty/<product_id>", methods=["GET"])
def smart_warranty(product_id):
    db = current_app.config["DB"]

    product = db.products.find_one({"productId": product_id}, {"_id": 0})
    if not product:
        return jsonify({"error": "Product not found"}), 404

    repairs = list(db.repairs.find({"productId": product_id}, {"_id": 0}))

    try:
        authentic = verify_on_chain(product_id)
    except:
        authentic = False

    current = int(time.time())
    expiry = product.get("warrantyExpiry", 0)
    created = product.get("createdAt", 0)

    remaining_days = max(0, (expiry - current) // 86400)
    total_days = max(1, (expiry - created) // 86400)

    status = "valid" if current < expiry else "expired"

    # AI risk logic
    risk_score = 20
    if not authentic:
        risk_score = 90
    elif len(repairs) > 3:
        risk_score = 60

    # blockchain hash
    raw = f"{product['productId']}{product['serial']}{created}"
    tx_hash = hashlib.sha256(raw.encode()).hexdigest()

    return jsonify({
        "product": product,
        "repairs": repairs,
        "authentic": authentic,
        "warrantyStatus": status,
        "remainingDays": remaining_days,
        "totalDays": total_days,
        "riskScore": risk_score,
        "txHash": tx_hash,
        "createdAt": created,
        "expiry": expiry
    })

# ================= SMART WARRANTY LIST =================
@product_routes.route("/smart-warranty", methods=["GET"])
def smart_warranty_list():
    db = current_app.config["DB"]

    products = list(db.products.find({}, {
    "_id": 0,
    "productId": 1,
    "name": 1,
    "serial": 1,
    "owner": 1
}))

    result = []

    for p in products:
        try:
            authentic = verify_on_chain(p["productId"])
        except:
            authentic = False

        expiry = p.get("warrantyExpiry", 0)
        current = int(time.time())

        status = "valid" if current < expiry else "expired"

        result.append({
            "productId": p["productId"],
            "name": p["name"],
            "manufacturer": p.get("manufacturer", "-"),
            "warrantyStatus": status,
            "authentic": authentic,
            "expiry": expiry
        })

    return jsonify(result)

    
# ================= OWNERSHIP HISTORY =================
@product_routes.route("/ownership/<product_id>", methods=["GET"])
def get_ownership(product_id):
    db = current_app.config["DB"]

    history = list(
        db.ownership_history.find(
            {"productId": product_id},
            {"_id": 0}
        ).sort("timestamp", 1)
    )

    return jsonify(history)

# ================= PRODUCT LIST =================
@product_routes.route("/list", methods=["GET"])
def get_products():
    db = current_app.config["DB"]

    products = list(db.products.find({}, {
    "_id": 0,
    "productId": 1,
    "name": 1,
    "serial": 1,
    "owner": 1   # 🔥 CRITICAL
}))

    return jsonify(products)

# ================= VERIFIED PRODUCTS FOR USER =================
@product_routes.route("/verified/user/<email>", methods=["GET"])
def get_user_verified(email):
    db = current_app.config["DB"]

    # 🔥 get logs for this user
    logs = list(db.verification_logs.find(
        {"user": email.lower(), "authentic": True},
        {"_id": 0}
    ))

    if not logs:
        return jsonify([])

    product_ids = list(set([log["productId"] for log in logs]))

    # 🔥 fetch products
    products = list(db.products.find(
        {"productId": {"$in": product_ids}},
        {"_id": 0}
    ))

    # 🔥 attach authenticity (optional)
    result = []
    for p in products:
        try:
            is_valid = verify_on_chain(p["productId"])
        except:
            is_valid = False

        result.append({
            **p,
            "authentic": is_valid
        })

    return jsonify(result)

@product_routes.route("/disown", methods=["POST"])
def disown_product():
    data = request.json
    db = current_app.config["DB"]

    product_id = data.get("productId")
    email = data.get("email")


    user = db.users.find_one({"email": email.lower()})
    product = db.products.find_one({"productId": product_id})

    if not product:
        return jsonify({"error": "Product not found"}), 404

    if not user:
        return jsonify({"error": "User not found"}), 404

    last = db.ownership_history.find_one(
    {"productId": product_id},
    sort=[("timestamp", -1)]
    )

    if last and time.time() - last.get("timestamp", 0) < 2:
        return jsonify({"error": "Too many actions"}), 429

    if product.get("owner") != user.get("wallet"):
        return jsonify({"error": "Not owner"}), 403

    db.products.update_one(
        {"productId": product_id},
        {"$set": {"owner": None}}
    )

    db.ownership_history.insert_one({
        "productId": product_id,
        "from": user.get("wallet"),
        "to": None,
        "type": "DISOWN",
        "timestamp": int(time.time())
    })

    return jsonify({"message": "Ownership released"})

