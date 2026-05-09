import requests
import json
import datetime

def fetch_latest_models():
    try:
        response = requests.get("https://openrouter.ai/api/v1/models")
        data = response.json()
        models = data.get("data", [])
        
        # OpenRouter models often have 'created' timestamp. If not, we just sort by ID to find newest versions like Claude 3.5 or Llama 3.1
        # Let's filter some of the best known ones and the most recent ones.
        
        # Sort by created timestamp descending
        models_sorted = sorted([m for m in models if m.get("created")], key=lambda x: x["created"], reverse=True)
        
        print("LATEST MODELS ADDED TO OPENROUTER:")
        for m in models_sorted[:15]:
            created_date = datetime.datetime.fromtimestamp(m["created"]).strftime('%Y-%m-%d')
            print(f"- {m['id']} (Name: {m['name']}, Created: {created_date})")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fetch_latest_models()