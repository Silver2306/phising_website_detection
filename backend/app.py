from flask import Flask, request, jsonify
import joblib
from urllib.parse import urlparse

app = Flask(__name__)

model = joblib.load("backend/models/phissafe_random_forest.joblib")
features = joblib.load("backend/models/phissafe_features.joblib")

@app.route("/health", methods=["GET"])
def health():
    return {
        "status": "ok",
        "message": "PhisSafe API is running",
        "model_loaded": True,
        "expected_features": len(features)
    }

@app.route("/predict", methods=["POST"])
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

    prediction = model.predict([input_features])

    if prediction[0] == 0:
        result = "phishing"
    else:
        result = "legitimate"

    return jsonify({
        "prediction": result
    })

@app.route("/scan", methods=["POST"])
def scan():
    data = request.get_json()

    if "url" not in data:
        return jsonify({
            "error": "URL is required"
        }), 400

    url = data["url"]

    parsed_url = urlparse(url)

    if parsed_url.scheme not in ["http", "https"] or not parsed_url.netloc:
        return jsonify({
            "error": "Invalid URL"
        }), 400

    return jsonify({
        "message": "Valid URL received",
        "url": url
    })

if __name__ == "__main__":
    app.run(debug=True)