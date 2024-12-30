import requests
from flask import Flask, jsonify
from flask_cors import CORS  # Enable CORS for cross-origin requests
import requests
from config import CLIENT_ID, CLIENT_SECRET, AUTHORITY_URL, GENERATE_EMBED_URL, REPORT_ID, WORKSPACE_ID


app = Flask(__name__)
CORS(app, supports_credentials=True)  # Enable CORS


@app.route('/api/report-details', methods=['GET'])
def get_access_token():
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    body = {
        'grant_type': 'client_credentials',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'scope': 'https://analysis.windows.net/powerbi/api/.default'
    }

    response = requests.post(AUTHORITY_URL, data=body, headers=headers)
    access_token = response.json().get('access_token')

    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    # Fetch the embed token
    embed_token_request_body = {
        "accessLevel": "view",
        "datasets": ["7e26e446-b580-4363-9e4c-a28c58f0824e"],
        "identities": [
            {
                "username": "13026",
                "roles": ["Admin"],
                "datasets": ["7e26e446-b580-4363-9e4c-a28c58f0824e"]
            }
        ]
    }
    response = requests.post(GENERATE_EMBED_URL, headers=headers, json=embed_token_request_body)
    print(response)
    embed_token = response.json().get('token')

    if access_token:
        # Return the required JSON structure
        return jsonify({
            'reportId': REPORT_ID,
            'embedUrl': f"https://app.powerbi.com/reportEmbed?reportId={REPORT_ID}&groupId={WORKSPACE_ID}",
            # https://app.powerbi.com/reportEmbed?reportId=48befd00-dc1b-4dcb-b6d1-b2a96fdbf20b&groupId=b623a39a-8d15-4f17-9ce0-fe96de2d0c37&w=2&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLVVLLVNPVVRILUMtUFJJTUFSWS1yZWRpcmVjdC5hbmFseXNpcy53aW5kb3dzLm5ldCIsImVtYmVkRmVhdHVyZXMiOnsidXNhZ2VNZXRyaWNzVk5leHQiOnRydWV9fQ%3d%3d
            'accessToken': embed_token
        }), 200
    else:
        # Log the raw response for debugging
        print("Response status:", response.status_code)
        print("Response text:", response.text)
        return jsonify({
            'error': 'Failed to fetch token',
            'status': response.status_code,
            'details': response.text
        }), response.status_code



if __name__ == '__main__':
    app.run(debug=True)