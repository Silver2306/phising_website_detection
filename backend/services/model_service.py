import joblib

model = joblib.load(
    "backend/models/phissafe_random_forest_v2.joblib"
)

features = joblib.load(
    "backend/models/phissafe_features_seven_v2.joblib"
)


def predict_url(input_features):

    prediction = model.predict([input_features])

    if prediction[0] == 0:
        return "phishing"

    return "legitimate"