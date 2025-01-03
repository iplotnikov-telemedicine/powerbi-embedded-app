from flask import Flask, request, jsonify
from flask_cors import CORS
from auth import generate_embed_token, get_access_token


app = Flask(__name__)
CORS(app, supports_credentials=True)


user_settings = {
    'isRecruitmentReportEnabled': True
}


@app.route('/api/user/settings', methods=['GET'])
def get_user_settings():
    return jsonify(user_settings)


@app.route('/api/embedded-tokens', methods=['GET'])
def get_embed_token():
    report_id = request.args.get('reportId')
    dataset_id = request.args.get('datasetId')
    
    if not report_id or not dataset_id:
        error_message = 'Both reportId and datasetId are required'
        print(f"Error: {error_message}")
        return jsonify({'error': error_message}), 400

    try:
        embed_token = generate_embed_token(report_id, dataset_id)
        return jsonify({'accessToken': embed_token}), 200
    except Exception as e:
        print(f"Error generating embed token: {str(e)}")
        return jsonify({'error': 'Internal Server Error'}), 500

    
# @app.route('/api/report-details/<string:report_id>', methods=['GET'])
# def get_report_details(report_id):
#     # Fetch report configuration by ID
#     report = REPORT_DETAILS.get(report_id)

#     if not report:
#         return jsonify({'message': 'Report not found'}), 404

#     # Generate an embed token for the report
#     embed_token = generate_embed_token(report['datasetId'])

#     # Respond with report details and embed token
#     return jsonify({
#         'reportId': report['reportId'],
#         'datasetId': report['datasetId'],
#         'embedUrl': report['embedUrl'],
#         'accessToken': embed_token
#     }), 200


if __name__ == '__main__':
    app.run(port=5000, debug=True)
