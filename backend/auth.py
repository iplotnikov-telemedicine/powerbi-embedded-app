import requests
from config import CLIENT_ID, CLIENT_SECRET, AUTHORITY_URL, GENERATE_EMBED_URL


def get_access_token():
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    body = {
        'grant_type': 'client_credentials',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'scope': 'https://analysis.windows.net/powerbi/api/.default offline_access'
    }
    response = requests.post(AUTHORITY_URL, data=body, headers=headers)
    if not response.status_code == '200':
        print(response.status_code)
    access_token = response.json().get('access_token')
    return access_token


def generate_embed_token(report_id, dataset_id):
    access_token = get_access_token()
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    embed_token_request_body = {
        "datasets": 
            [
                {
                    "id": dataset_id, 
                    "xmlaPermissions": "ReadOnly"
                }
            ],
        "reports": 
            [
                {
                    "id": report_id
                }
            ],
        "identities": 
            [
                {
                "username": "13026",
                "roles": ["Admin"],
                "datasets": 
                    [
                        dataset_id
                    ]
                }
            ] 
    }
    response = requests.post(GENERATE_EMBED_URL, headers=headers, json=embed_token_request_body)
    if not response.status_code == '200':
        print(response.status_code)
    embed_token = response.json().get('token')
    return embed_token


if __name__ == '__main__':
    generate_embed_token("c2a5cf8c-a33b-4759-b90d-68405d6d3d47", "afe11b3f-5fc7-4ffb-968e-602a710010c1")
    generate_embed_token("48befd00-dc1b-4dcb-b6d1-b2a96fdbf20b", "7e26e446-b580-4363-9e4c-a28c58f0824e")