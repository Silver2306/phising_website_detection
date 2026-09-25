import joblib
import pandas as pd
from services.extractor_cp import extract_features, SELECTED_FEATURES

model = joblib.load(
    "backend/models/phissafe_random_forest_comp_phish.joblib"
)

features = joblib.load(
    "backend/models/phissafe_features_13_comp_phish.joblib"
)
print("MODEL FEATURES:")
print(features)
# def predict_url(input_features):
 #   model_input = {}

  #  for feature in features:

   #     if feature == "SpacialCharRatioInURL":
    #        model_input[feature] = input_features["SpecialCharRatioInURL"]
     #   else:
      #     model_input[feature] = input_features[feature]

    #input_data = pd.DataFrame(
     #   [[model_input[feature] for feature in features]],
      #  columns=features
    #)

    #prediction = model.predict(input_data)
    #probability = model.predict_proba(input_data)

    #print("Prediction:", prediction[0])
    #print("Probabilities:", probability[0])

    #if prediction[0] == 0:
     #   return "phishing"

    #return "legitimate"

    
def predict_url(url, html): 
    # Extract the 13 features 
    extracted = extract_features( url, html ) 
    
    # Create model input in the exact feature order
    input_data = pd.DataFrame( [[extracted[feature] for feature in SELECTED_FEATURES]], columns=SELECTED_FEATURES ) 
     
     # Make prediction
    prediction_cls = int(model.predict(input_data)[0]) 
    
    # Get probability 
    probability = model.predict_proba(input_data)[0] 
    confidence_val = float(probability[prediction_cls])
    confidence_score = round(confidence_val, 4)

    print("Extracted Features:", extracted) 
    print("Prediction:", prediction_cls) 
    print("Probabilities:", probability) 
    
    # CompPhish labels: 0 = Legitimate, 1 = Phishing 
    prediction_str = "phishing" if prediction_cls == 1 else "legitimate"

    return {
        "prediction": prediction_str,
        "confidence": confidence_score,
        "model_version": "CompPhish RF v1.0",
        "extracted_features": extracted
    }


