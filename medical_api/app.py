from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib
import os

# Charger le modèle
model = joblib.load("best_model.pkl")

app = FastAPI(title="Medical Cost Prediction API")

class InputData(BaseModel):
    age: int
    sex: str
    bmi: float
    children: int
    smoker: str
    region: str

@app.get("/")
def home():
    return {"status": "API is running"}

@app.post("/predict")
def predict(data: InputData):
    df = pd.DataFrame([data.dict()])
    pred = model.predict(df)
    return {"prediction": float(pred[0])}
