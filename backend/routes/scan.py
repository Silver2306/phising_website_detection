from flask import Blueprint, request, jsonify
from urllib.parse import urlparse

from services.feature_extractor import extract_basic_features

from services.model_service import predict_url
from services.rdap_service import get_rdap_info


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
    print("MODEL 2 FEATURES:", extracted_features)
    #Send features as a dataframe, or else an error occurs, not sure if its the root cause tho, multiple patches applied
    #input_data = pd.DataFrame(
     #   [[extracted_features[feature] for feature in features]],
      #  columns=features
    #)

    #prediction = model.predict(input_data)
    #probabilities = model.predict_proba(input_data)

    prediction = predict_url(extracted_features)
    #above with the extracted features

    rdap_info = get_rdap_info(url)

    #if prediction[0] == 0:
     #   result = "phishing"
    #else:
     #   result = "legitimate"
    # i commented out the above code because our prediction is returning a string, so if prediction is "legitimate" then prediction[0] is 'l' which ==0 is always false that is why i was getting legitimate again and again 

    result = prediction

    return jsonify({
        "url": url,
        "features": extracted_features,
        "prediction": result,
        "domain_info": rdap_info
    })