import uuid
from models.product_model import create_product_object
from utils.qr_generator import generate_qr
import hashlib
import time

def register_product(db, data):
    product_id = str(uuid.uuid4())

    product = create_product_object(data, product_id)

    db.products.insert_one(product)

    qr_path = generate_qr(product_id)

    return {
        "productId": product_id,
        "qrPath": qr_path
    }


def get_product(db, product_id):
    product = db.products.find_one({"productId": product_id}, {"_id": 0})

    return product


def generate_blockchain_record(product):
    data_string = f"{product['productId']}{product['name']}{product['serial']}{product['createdAt']}"
    
    block_hash = hashlib.sha256(data_string.encode()).hexdigest()

    return {
        "blockHash": block_hash,
        "timestamp": int(time.time()),
        "network": "Polygon Testnet",
        "status": "confirmed"
    }