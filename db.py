"""
Database connection module for MongoDB operations.
Handles connection to MongoDB and provides database access utilities.
"""

import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError


class DatabaseManager:
    """Manages MongoDB connection and provides database access."""
    
    def __init__(self, connection_string=None, database_name="calorie_tracker"):
        """
        Initialize database connection.
        
        Args:
            connection_string (str): MongoDB connection string. 
                                   Defaults to localhost if not provided.
            database_name (str): Name of the database to use.
        """
        self.database_name = database_name
        
        # Use provided connection string or default to localhost
        if connection_string:
            self.connection_string = connection_string
        else:
            # Default local MongoDB connection
            self.connection_string = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
        
        self.client = None
        self.db = None
        self._connect()
    
    def _connect(self):
        """Establish connection to MongoDB."""
        try:
            self.client = MongoClient(
                self.connection_string,
                serverSelectionTimeoutMS=5000  # 5 second timeout
            )
            
            # Test the connection
            self.client.admin.command('ping')
            
            # Get database instance
            self.db = self.client[self.database_name]
            
            print(f"Successfully connected to MongoDB database: {self.database_name}")
            
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            print(f"Failed to connect to MongoDB: {e}")
            raise
    
    def get_collection(self, collection_name):
        """
        Get a collection from the database.
        
        Args:
            collection_name (str): Name of the collection.
            
        Returns:
            pymongo.collection.Collection: MongoDB collection object.
        """
        if not self.db:
            raise ConnectionError("Database connection not established")
        
        return self.db[collection_name]
    
    def close_connection(self):
        """Close the MongoDB connection."""
        if self.client:
            self.client.close()
            print("MongoDB connection closed")
    
    def is_connected(self):
        """
        Check if the database connection is active.
        
        Returns:
            bool: True if connected, False otherwise.
        """
        try:
            if self.client:
                self.client.admin.command('ping')
                return True
        except:
            pass
        return False


# Global database manager instance
db_manager = None


def get_db_manager():
    """
    Get the global database manager instance.
    Creates a new instance if one doesn't exist.
    
    Returns:
        DatabaseManager: Database manager instance.
    """
    global db_manager
    
    if db_manager is None:
        db_manager = DatabaseManager()
    
    return db_manager


def get_food_collection():
    """
    Get the food items collection.
    
    Returns:
        pymongo.collection.Collection: Food items collection.
    """
    db = get_db_manager()
    return db.get_collection('food_items')


# Initialize sample data if collection is empty
def initialize_sample_data():
    """Initialize sample food data if the collection is empty."""
    try:
        food_collection = get_food_collection()
        
        # Check if collection has any documents
        if food_collection.count_documents({}) == 0:
            sample_foods = [
                {"name": "Apple", "calories_per_100g": 52, "category": "fruit"},
                {"name": "Banana", "calories_per_100g": 89, "category": "fruit"},
                {"name": "Chicken Breast", "calories_per_100g": 165, "category": "protein"},
                {"name": "Eggs", "calories_per_100g": 155, "category": "protein"},
                {"name": "Rice", "calories_per_100g": 130, "category": "grain"},
                {"name": "Wheat Bread", "calories_per_100g": 247, "category": "grain"},
                {"name": "Milk", "calories_per_100g": 61, "category": "dairy"},
                {"name": "Salmon", "calories_per_100g": 208, "category": "protein"},
                {"name": "Cabbage", "calories_per_100g": 25, "category": "vegetable"},
                {"name": "Oats", "calories_per_100g": 389, "category": "grain"},
                {"name": "Broccoli", "calories_per_100g": 34, "category": "vegetable"},
                {"name": "Orange", "calories_per_100g": 47, "category": "fruit"},
                {"name": "Potato", "calories_per_100g": 77, "category": "vegetable"},
                {"name": "Yogurt", "calories_per_100g": 59, "category": "dairy"},
                {"name": "Almonds", "calories_per_100g": 579, "category": "nuts"}
            ]
            
            food_collection.insert_many(sample_foods)
            print(f"Initialized {len(sample_foods)} sample food items")
        
    except Exception as e:
        print(f"Error initializing sample data: {e}")


if __name__ == "__main__":
    # Test database connection
    try:
        db = get_db_manager()
        print("Database connection test successful!")
        
        # Initialize sample data
        initialize_sample_data()
        
        # Test collection access
        food_collection = get_food_collection()
        count = food_collection.count_documents({})
        print(f"Food collection contains {count} documents")
        
    except Exception as e:
        print(f"Database test failed: {e}")
    finally:
        if db_manager:
            db_manager.close_connection()
