from services.feature_extractor import extract_basic_features
import pandas as pd

df = pd.read_csv("../data/data.csv")

url = "https://www.southbankmosaics.com"

features = [
    "IsHTTPS",
    "LetterRatioInURL",
    "SpacialCharRatioInURL",
    "DegitRatioInURL",
    "NoOfSubDomain",
    "DomainLength",
    "CharContinuationRate"
]

row = df[df["URL"] == url].iloc[0]

extracted = extract_basic_features(url)

print("URL:", url)

for feature in features:
    print(
        feature,
        "| dataset =", row[feature],
        "| extracted =", extracted[feature]
    )