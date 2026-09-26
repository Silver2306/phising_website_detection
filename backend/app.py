from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from routes.health import health_bp
from routes.scan_cp import scan_cp_bp

app = Flask(__name__)

CORS(app)

app.register_blueprint(health_bp)
app.register_blueprint(scan_cp_bp)

if __name__ == "__main__":
    app.run(debug=True, port=5000)