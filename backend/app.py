from flask import Flask

from routes.health import health_bp
from routes.predict import predict_bp
from routes.scan import scan_bp


app = Flask(__name__)

app.register_blueprint(health_bp)
app.register_blueprint(predict_bp)
app.register_blueprint(scan_bp)


if __name__ == "__main__":
    app.run(debug=True, port=5000)