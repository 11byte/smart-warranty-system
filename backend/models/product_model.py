def create_product_object(data, product_id, manufacturer):
    import time

    return {
        "productId": product_id,
        "name": data.get("name"),
        "serial": data.get("serial"),

        "manufacturer": manufacturer.get("name"),

        # 🔥 FIX: NO OWNER INITIALLY
        "owner": None,

        "createdAt": int(time.time()),
        "warrantyExpiry": int(time.time()) + int(data.get("warranty", 0)) * 86400,

        "history": []
    }