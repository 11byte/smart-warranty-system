from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import time
import datetime
from flask import Blueprint, jsonify, current_app
import random
import datetime
from flask import request, jsonify, current_app

auth_routes = Blueprint("auth_routes", __name__)

SECRET = "SUPER_SECRET_KEY"


user_routes = Blueprint("user_routes", __name__)

@user_routes.route("/list", methods=["GET"])
def get_users():
    db = current_app.config["DB"]

    users = list(db.users.find(
        {"wallet": {"$exists": True}},  # 🔥 only valid users
        {
            "_id": 0,
            "name": 1,
            "wallet": 1
        }
    ))

    return jsonify(users)


# ================= REGISTER =================


# 🔥 WALLET GENERATOR
def generate_wallet():
    return "0x" + ''.join(random.choices("abcdef0123456789", k=40))


@auth_routes.route("/register", methods=["POST"])
def register():
    data = request.json
    db = current_app.config["DB"]

    # ✅ CHECK EXISTING USER
    existing = db.users.find_one({"email": data["email"]})
    if existing:
        return jsonify({"error": "User already exists"}), 400

    # ✅ HASH PASSWORD
    hashed_password = generate_password_hash(data["password"])

    # 🔥 GENERATE WALLET
    wallet = generate_wallet()

    # ✅ CREATE USER
    user = {
        "name": data["name"],
        "email": data["email"],
        "password": hashed_password,
        "role": data["role"],  # user / manufacturer
        "company": data.get("company", ""),
        "wallet": wallet,  # 🔥 NEW FIELD
        "createdAt": int(time.time())
    }

    db.users.insert_one(user)

    return jsonify({
        "message": "User registered successfully",
        "wallet": wallet  # optional (useful for UI/debug)
    })


# ================= LOGIN =================
@auth_routes.route("/login", methods=["POST"])
def login():
    data = request.json
    db = current_app.config["DB"]

    user = db.users.find_one({"email": data["email"]})

    if not user:
        return jsonify({"error": "User not found"}), 404

    # ✅ PASSWORD CHECK
    if not check_password_hash(user["password"], data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    # 🔥 ROLE CHECK (IMPORTANT)
    if user["role"] != data.get("role"):
        return jsonify({"error": "Role mismatch"}), 403

    token = jwt.encode({
        "userId": str(user["_id"]),
        "role": user["role"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }, SECRET, algorithm="HS256")

    return jsonify({
        "token": token,
        "role": user["role"],
        "name": user["name"],
        "email": user["email"]  
    })