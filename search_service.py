# search_service.py
import re
from db import get_food_collection

class SearchService:
    def __init__(self):
        self.collection = get_food_collection()

    def search_foods(self, query, limit=20):
        """
        Search for food items in MongoDB using a case-insensitive regex.
        Returns a list of matching documents (as dictionaries).
        """
        if not query:
            return []

        regex = re.compile(f".*{re.escape(query)}.*", re.IGNORECASE)
        print(f"Searching with regex: {regex}")
        cursor = self.collection.find({"Dish Name": regex}).limit(limit)

        results = []
        for doc in cursor:
            print(f"Found document: {doc}")
            results.append({
                "_id": str(doc["_id"]),
                "name": doc.get("Dish Name", ""),
                "calories_per_100g": doc.get("Calories (kcal)", 0),
                "category": doc.get("Protein (g)", "")
            })
        print(f"Search results: {results}")
        return results


# Singleton pattern to avoid reconnecting on every request
_search_service = None

def get_search_service():
    global _search_service
    if _search_service is None:
        _search_service = SearchService()
    return _search_service
