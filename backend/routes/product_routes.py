from flask import Blueprint, request, jsonify, current_app
import uuid
import time
from models.product_model import create_product_object
from services.BlockchainService import verify_on_chain, register_on_chain
import hashlib


product_routes = Blueprint("product_routes", __name__)


# ================= REGISTER PRODUCT =================
@product_routes.route("/register", methods=["POST"])
def register():
    db = current_app.config["DB"]
    data = request.json

    # Generate product ID
    product_id = str(uuid.uuid4())

    # Create product object
    product = create_product_object(data, product_id)

    # Store in MongoDB
    db.products.insert_one(product)

    try:
        # 🔥 Register on blockchain
        tx_hash = register_on_chain(product)
    except Exception as e:
        return jsonify({
            "error": "Blockchain registration failed",
            "details": str(e)
        }), 500

    return jsonify({
        "message": "Product Registered Successfully",
        "productId": product_id,
        "txHash": tx_hash
    })


# ================= VERIFY PRODUCT =================

@product_routes.route("/verify/<product_id>", methods=["GET"])
def verify(product_id):
    db = current_app.config["DB"]

    product = db.products.find_one(
        {"productId": product_id},
        {"_id": 0}
    )

    # ❌ CASE 1: Not in DB
    if not product:
        return jsonify({
            "authentic": False,
            "reason": "Product not found in database",
            "fraudScore": 95
        })

    # 🔗 Check blockchain
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
        return jsonify({
            "authentic": False,
            "product": product,
            "reason": "Product not registered on blockchain",
            "fraudScore": 85
        })

    # 🔐 OPTIONAL: HASH CHECK (anti-tampering)
    expected_hash = hashlib.sha256(
        f"{product['productId']}{product['name']}{product['serial']}".encode()
    ).hexdigest()

    # (In future: compare with stored hash on-chain)

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
        recent.append({
            "event": "Verified" if is_valid else "Flagged",
            "product": p["name"],
            "time": p.get("createdAt", 0)
        })

    return jsonify({
        "total": total,
        "verified": verified,
        "fake": fake,
        "timeline": timeline,
        "recent": sorted(recent, key=lambda x: x["time"], reverse=True)[:5]
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