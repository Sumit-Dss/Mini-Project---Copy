from flask import Flask, render_template, request, jsonify
from search_service import get_search_service
from db import initialize_sample_data

app = Flask(__name__)

@app.route('/')
def login():
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    """Render the dashboard page."""
    return render_template('index.html')

@app.route('/dashboard/search')
def search_foods():
    """
    Search endpoint for food items.
    Returns JSON results for AJAX requests.
    """
    try:
        # Get query parameter
        query = request.args.get('q', '').strip()
        
        # Get optional limit parameter
        limit = request.args.get('limit', 20, type=int)
        
        # Validate limit
        if limit > 100:
            limit = 100
        elif limit < 1:
            limit = 20
        
        # Perform search
        search_service = get_search_service()
        results = search_service.search_foods(query, limit)
        
        # Return JSON response
        return jsonify({
            'success': True,
            'query': query,
            'results': results,
            'count': len(results)
        })
        
    except Exception as e:
        # Return error response
        return jsonify({
            'success': False,
            'error': str(e),
            'query': request.args.get('q', ''),
            'results': [],
            'count': 0
        }), 500

@app.route('/signup')
def signin():
    return render_template('sign-in.html')

if __name__ == "__main__":
    app.run(debug=True)