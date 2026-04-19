from flask import Blueprint, request, jsonify, current_app
import uuid
import time
from models.product_model import create_product_object
from services.BlockchainService import verify_on_chain, register_on_chain
import hashlib
from services.BlockchainService import transfer_ownership
import datetime


product_routes = Blueprint("product_routes", __name__)


# ================= REGISTER PRODUCT =================
from flask import request, jsonify, current_app
from services.BlockchainService import register_on_chain



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
    manufacturer = db.users.find_one({"email": data.get("email")})

    if not manufacturer:
        return jsonify({"error": "Manufacturer not found"}), 404

    wallet = manufacturer.get("wallet")

    if not wallet:
        return jsonify({"error": "Manufacturer has no wallet"}), 400

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
        "to": wallet,
        "txHash": "GENESIS",
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

    # 🔥 GET USER FROM QUERY PARAM (frontend sends it)
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

    product = db.products.find_one(
        {"productId": product_id},
        {"_id": 0}
    )

    # ❌ CASE 1: Not in DB
    if not product:
        log_verification(False, "Product not found")
        return jsonify({
            "authentic": False,
            "reason": "Product not found in database",
            "fraudScore": 95
        })

    # 🔗 BLOCKCHAIN CHECK
    try:
        is_on_chain = verify_on_chain(product_id)
    except:
        return jsonify({
            "authentic": False,
            "reason": "Blockchain verification failed",
            "fraudScore": 80
        })

    # ❌ CASE 2: Not on blockchain
    if not is_on_chain:
        log_verification(False, "Not on blockchain")
        return jsonify({
            "authentic": False,
            "product": product,
            "reason": "Product not registered on blockchain",
            "fraudScore": 85
        })

    # 🔐 HASH CHECK
    expected_hash = hashlib.sha256(
        f"{product['productId']}{product['name']}{product['serial']}".encode()
    ).hexdigest()
    log_verification(True, "Verified via blockchain")

    # 🔥 STORE VERIFICATION LOG (ONLY IF USER EXISTS)
    # if user_email:
    #     existing = db.verification_logs.find_one({
    #         "productId": product_id,
    #         "user": user_email
    #     })

    #     if not existing:
    #         db.verification_logs.insert_one({
    #             "productId": product_id,
    #             "user": user_email,
    #             "timestamp": int(time.time()),
    #             "authentic": True
    #         })

    return jsonify({
        "authentic": True,
        "product": product,
        "reason": "Verified via blockchain",
        "fraudScore": 5,
        "hash": expected_hash
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


# ================= GET ALL PRODUCTS =================
@product_routes.route("/", methods=["GET"])
def get_all_products():
    db = current_app.config["DB"]

    products = list(db.products.find({}, {"_id": 0}))

    return jsonify(products)

# ================= VERIFIED PRODUCTS =================
@product_routes.route("/verified", methods=["GET"])
def get_verified_products():
    db = current_app.config["DB"]

    products = list(db.products.find({}, {"_id": 0}))

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

    products = list(db.products.find({}, {"_id": 0}))

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

    products = list(db.products.find({}, {"_id": 0}))

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
    products = list(db.products.find({}, {"_id": 0}))

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

    products = list(db.products.find({}, {"_id": 0}))

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

# ================= TRANSFER OWNERSHIP =================

@product_routes.route("/transfer", methods=["POST"])
def transfer_product():
    data = request.json
    db = current_app.config["DB"]

    product_id = data.get("productId")
    new_owner = data.get("newOwner")

    if not product_id or not new_owner:
        return jsonify({"error": "Missing fields"}), 400

    product = db.products.find_one({"productId": product_id})

    if not product:
        return jsonify({"error": "Product not found"}), 404

    old_owner = product.get("owner")

    if old_owner == new_owner:
        return jsonify({"error": "Already owned by this user"}), 400

    if not new_owner.startswith("0x"):
        return jsonify({"error": "Invalid wallet address"}), 400

    try:
        receipt = transfer_ownership(product_id, new_owner)

        tx_hash = (
            receipt.transactionHash.hex()
            if receipt and receipt.transactionHash
            else "N/A"
        )

        db.products.update_one(
            {"productId": product_id},
            {"$set": {"owner": new_owner}}
        )

        db.ownership_history.insert_one({
            "productId": product_id,
            "from": old_owner,
            "to": new_owner,
            "txHash": tx_hash,
            "timestamp": int(time.time())
        })

        return jsonify({
            "message": "Ownership transferred",
            "txHash": tx_hash
        })

    except Exception as e:
        print("TRANSFER ERROR:", str(e))  # 🔥 DEBUG
        return jsonify({"error": str(e)}), 500
    
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
        "name": 1
    }))

    return jsonify(products)

# ================= VERIFIED PRODUCTS FOR USER =================
@product_routes.route("/verified/user/<email>", methods=["GET"])
def get_user_verified(email):
    db = current_app.config["DB"]

    # 🔥 get logs for this user
    logs = list(db.verification_logs.find(
        {"user": email, "authentic": True},
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