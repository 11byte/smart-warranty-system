def create_product_object(data, product_id):
    import time

    return {
        "productId": product_id,
        "name": data.get("name"),
        "serial": data.get("serial"),
        "manufacturer": "Demo Manufacturer",
        "createdAt": int(time.time()),
        "warrantyExpiry": int(time.time()) + int(data.get("warranty", 0)) * 86400,
        "owner": "manufacturer",
        "history": []
    }