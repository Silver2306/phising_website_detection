import joblib
import pandas as pd

model = joblib.load(
    "backend/models/url_model.joblib"
)

features = joblib.load(
    "backend/models/url_features.joblib"
)


def predict_url(input_features):

    model_input = {}

    for feature in features:

        if feature == "SpacialCharRatioInURL":
            model_input[feature] = input_features["SpecialCharRatioInURL"]
        else:
            model_input[feature] = input_features[feature]

    input_data = pd.DataFrame(
        [[model_input[feature] for feature in features]],
        columns=features
    )

    prediction = model.predict(input_data)

    if prediction[0] == 0:
        return "phishing"

    return "legitimate"



