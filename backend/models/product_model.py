def create_product_object(data, product_id, manufacturer):
    import time

    return {
        "productId": product_id,
        "name": data.get("name"),
        "serial": data.get("serial"),

        # 🔥 REAL LINKAGE
        "manufacturer": manufacturer.get("name"),
        "owner": manufacturer.get("wallet"),

        # 🔥 CONSISTENT TIME
        "createdAt": int(time.time()),
        "warrantyExpiry": int(time.time()) + int(data.get("warranty", 0)) * 86400,

        "history": []
    }