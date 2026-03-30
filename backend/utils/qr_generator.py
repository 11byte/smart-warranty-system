import qrcode
import os

def generate_qr(product_id):
    qr = qrcode.make(product_id)

    folder = "qr_codes"
    if not os.path.exists(folder):
        os.makedirs(folder)

    file_path = f"{folder}/{product_id}.png"
    qr.save(file_path)

    return file_path