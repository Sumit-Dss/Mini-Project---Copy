# db.py
from pymongo import MongoClient

MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "food_calories"
COLLECTION_NAME = "user_food"

_client = None
_db = None

def get_db():
    global _client, _db
    if _db is None:
        _client = MongoClient(MONGO_URI)
        _db = _client[DB_NAME]
    return _db

def get_food_collection():
    return get_db()[COLLECTION_NAME]


def initialize_sample_data():
    collection = get_food_collection()
    if collection.count_documents({}) == 0:
        sample_foods = [
            {"name": "Apple", "calories_per_100g": 52, "category": "fruit"},
            {"name": "Banana", "calories_per_100g": 89, "category": "fruit"},
            {"name": "Rice", "calories_per_100g": 130, "category": "grain"},
            {"name": "Egg", "calories_per_100g": 155, "category": "protein"},
        ]
        collection.insert_many(sample_foods)
        print(f"Inserted {len(sample_foods)} sample food items.")
    print_all_documents()

def print_all_documents():
    collection = get_food_collection()
    for document in collection.find():
        print(document.keys())
        print(document)
