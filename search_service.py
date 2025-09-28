"""
Search service module for food item search functionality.
Handles MongoDB queries for food item search operations.
"""

import re
from typing import List, Dict, Optional
from pymongo.collection import Collection
from db import get_food_collection


class FoodSearchService:
    """Service class for handling food item search operations."""
    
    def __init__(self, collection: Optional[Collection] = None):
        """
        Initialize the search service.
        
        Args:
            collection (Collection, optional): MongoDB collection to search.
                                            Defaults to food_items collection.
        """
        self.collection = collection or get_food_collection()
    
    def search_foods(self, query: str, limit: int = 20) -> List[Dict]:
        """
        Search for food items by name using case-insensitive partial matching.
        
        Args:
            query (str): Search query string.
            limit (int): Maximum number of results to return.
            
        Returns:
            List[Dict]: List of matching food items.
        """
        if not query or not query.strip():
            return []
        
        try:
            # Create case-insensitive regex pattern for partial matching
            # Escape special regex characters in the query
            escaped_query = re.escape(query.strip())
            regex_pattern = re.compile(escaped_query, re.IGNORECASE)
            
            # Search for documents where name field matches the pattern
            cursor = self.collection.find(
                {"name": {"$regex": regex_pattern}},
                {"_id": 0}  # Exclude MongoDB _id field from results
            ).limit(limit)
            
            # Convert cursor to list
            results = list(cursor)
            
            return results
            
        except Exception as e:
            print(f"Error searching foods: {e}")
            return []
    
    def search_foods_by_category(self, query: str, category: str, limit: int = 20) -> List[Dict]:
        """
        Search for food items by name within a specific category.
        
        Args:
            query (str): Search query string.
            category (str): Food category to filter by.
            limit (int): Maximum number of results to return.
            
        Returns:
            List[Dict]: List of matching food items in the specified category.
        """
        if not query or not query.strip():
            return []
        
        try:
            # Create case-insensitive regex pattern for partial matching
            escaped_query = re.escape(query.strip())
            regex_pattern = re.compile(escaped_query, re.IGNORECASE)
            
            # Search for documents where name matches pattern AND category matches
            cursor = self.collection.find(
                {
                    "name": {"$regex": regex_pattern},
                    "category": {"$regex": re.compile(category, re.IGNORECASE)}
                },
                {"_id": 0}  # Exclude MongoDB _id field from results
            ).limit(limit)
            
            results = list(cursor)
            return results
            
        except Exception as e:
            print(f"Error searching foods by category: {e}")
            return []
    
    def get_all_categories(self) -> List[str]:
        """
        Get all unique food categories from the database.
        
        Returns:
            List[str]: List of unique category names.
        """
        try:
            categories = self.collection.distinct("category")
            return sorted(categories)
        except Exception as e:
            print(f"Error getting categories: {e}")
            return []
    
    def get_food_by_id(self, food_id: str) -> Optional[Dict]:
        """
        Get a specific food item by its ID.
        
        Args:
            food_id (str): MongoDB ObjectId as string.
            
        Returns:
            Optional[Dict]: Food item data or None if not found.
        """
        try:
            from bson import ObjectId
            food_item = self.collection.find_one(
                {"_id": ObjectId(food_id)},
                {"_id": 0}
            )
            return food_item
        except Exception as e:
            print(f"Error getting food by ID: {e}")
            return None
    
    def get_popular_foods(self, limit: int = 10) -> List[Dict]:
        """
        Get popular food items (can be extended with usage tracking).
        Currently returns random food items.
        
        Args:
            limit (int): Maximum number of results to return.
            
        Returns:
            List[Dict]: List of popular food items.
        """
        try:
            import random
            
            # Get all food items
            all_foods = list(self.collection.find({}, {"_id": 0}))
            
            # Return random selection (in a real app, this would be based on usage)
            if len(all_foods) <= limit:
                return all_foods
            
            return random.sample(all_foods, limit)
            
        except Exception as e:
            print(f"Error getting popular foods: {e}")
            return []


# Global search service instance
_search_service = None


def get_search_service() -> FoodSearchService:
    """
    Get the global search service instance.
    Creates a new instance if one doesn't exist.
    
    Returns:
        FoodSearchService: Search service instance.
    """
    global _search_service
    
    if _search_service is None:
        _search_service = FoodSearchService()
    
    return _search_service


def search_foods(query: str, limit: int = 20) -> List[Dict]:
    """
    Convenience function to search for food items.
    
    Args:
        query (str): Search query string.
        limit (int): Maximum number of results to return.
        
    Returns:
        List[Dict]: List of matching food items.
    """
    service = get_search_service()
    return service.search_foods(query, limit)


if __name__ == "__main__":
    # Test search functionality
    try:
        service = get_search_service()
        
        # Test basic search
        print("Testing search functionality...")
        
        # Search for "apple"
        results = service.search_foods("apple")
        print(f"Search for 'apple': {len(results)} results")
        for result in results[:3]:  # Show first 3 results
            print(f"  - {result['name']}: {result['calories_per_100g']} cal/100g")
        
        # Search for "chicken"
        results = service.search_foods("chicken")
        print(f"\nSearch for 'chicken': {len(results)} results")
        for result in results[:3]:
            print(f"  - {result['name']}: {result['calories_per_100g']} cal/100g")
        
        # Test category search
        results = service.search_foods_by_category("a", "fruit")
        print(f"\nSearch for 'a' in fruit category: {len(results)} results")
        for result in results[:3]:
            print(f"  - {result['name']}: {result['calories_per_100g']} cal/100g")
        
        # Get all categories
        categories = service.get_all_categories()
        print(f"\nAvailable categories: {categories}")
        
    except Exception as e:
        print(f"Search test failed: {e}")
