from flask import Blueprint
from services.model_service import features

health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
def health():

    return {
        "status": "ok",
        "message": "PhisSafe API is running",
        "model_loaded": True,
        "expected_features": len(features)
    }