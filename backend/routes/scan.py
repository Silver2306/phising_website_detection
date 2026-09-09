from flask import Blueprint, request, jsonify
from urllib.parse import urlparse

from services.feature_extractor import extract_basic_features
from services.model_service import model, features

import pandas as pd
scan_bp = Blueprint("scan", __name__)


@scan_bp.route("/scan", methods=["POST"])
def scan():

    data = request.get_json()

    if "url" not in data:
        return jsonify({
            "error": "URL is required"
        }), 400

    url = data["url"]

    parsed_url = urlparse(url)

    if (
        parsed_url.scheme not in ["http", "https"]
        or not parsed_url.netloc
    ):
        return jsonify({
            "error": "Invalid URL"
        }), 400

    extracted_features = extract_basic_features(url)

    # Arrange features in the exact order
    # expected by the trained model
    input_features = [
        extracted_features[feature]
        for feature in features
    ]

    #Send features as a dataframe, or else an error occurs, not sure if its the root cause tho, multiple patches applied
    input_data = pd.DataFrame(
        [[extracted_features[feature] for feature in features]],
        columns=features
    )
    

    prediction = model.predict(input_data)
    probabilities = model.predict_proba(input_data)


    if prediction[0] == 0:
        result = "phishing"
    else:
        result = "legitimate"

    return jsonify({
        "url": url,
        "features": extracted_features,
        "prediction": result
    })