from flask import Blueprint, request, jsonify
from urllib.parse import urlparse

import requests

from services.model_service import predict_url
from services.rdap_service import get_rdap_info


scan_cp_bp = Blueprint("scan_cp", __name__)


@scan_cp_bp.route("/scan-cp", methods=["POST"])
def scan_cp():

    data = request.get_json()

    if "url" not in data:
        return jsonify({
            "error": "URL is required"
        }), 400

    url = data["url"]

    # Validate URL
    parsed_url = urlparse(url)

    if (
        parsed_url.scheme not in ["http", "https"]
        or not parsed_url.netloc
    ):
        return jsonify({
            "error": "Invalid URL. Please include the protocol scheme (http:// or https://)."
        }), 400

    try:

        # Get webpage HTML
        response = requests.get(
            url,
            timeout=10,
            headers={
                "User-Agent": "Mozilla/5.0"
            }
        )

        html = response.text

        # Predict using CompPhish model
        scan_result = predict_url(
            url,
            html
        )

        # Get domain information
        rdap_info = get_rdap_info(url)

        return jsonify({
            "url": url,
            "prediction": scan_result["prediction"],
            "confidence": scan_result["confidence"],
            "model_version": scan_result["model_version"],
            "features": scan_result["extracted_features"],
            "domain_info": rdap_info
            })

    except requests.RequestException as e:

        return jsonify({
            "error": "Could not access the website",
            "details": str(e)
        }), 400

    except Exception as e:
        print("SCAN ERROR:", repr(e))
        return jsonify({
            "error": "An error occurred while scanning the URL",
            "details": str(e)
        }), 500