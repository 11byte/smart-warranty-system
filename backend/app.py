from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
from config import MONGO_URI, DB_NAME
from routes.product_routes import product_routes
from routes.auth_routes import auth_routes
from routes.auth_routes import user_routes



app = Flask(__name__)
CORS(app)

# MongoDB Connection
client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Attach DB to app
app.config["DB"] = db

# Register routes
app.register_blueprint(product_routes, url_prefix="/api/product")
app.register_blueprint(auth_routes, url_prefix="/api/auth")

app.register_blueprint(user_routes, url_prefix="/api/users")


if __name__ == "__main__":
    app.run(debug=True)