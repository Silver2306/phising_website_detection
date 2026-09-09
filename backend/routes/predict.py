from flask import Blueprint, request, jsonify
from services.model_service import predict_url, features

predict_bp = Blueprint("predict", __name__)


@predict_bp.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()

    if "features" not in data:
        return jsonify({
            "error": "Features are required"
        }), 400

    input_features = data["features"]

    if len(input_features) != len(features):
        return jsonify({
            "error": f"Expected {len(features)} features"
        }), 400

    result = predict_url(input_features)

    return jsonify({
        "prediction": result
    })