from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import pandas as pd
import joblib
from fastapi.middleware.cors import CORSMiddleware



APP_TITLE = "Medical Cost Prediction API"
MODEL_PATH = "best_pipeline.pkl"

FEATURES = ["age", "sex", "bmi", "children", "smoker", "region"]

app = FastAPI(title=APP_TITLE)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ou mets l'URL exacte de ton site au lieu de *
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Load pipeline once at startup
try:
    pipeline = joblib.load(MODEL_PATH)
except Exception as e:
    pipeline = None
    load_error = str(e)


class PredictRequest(BaseModel):
    data: Dict[str, Any]


@app.get("/")
def root():
    return {"status": "ok", "message": "API is running"}


@app.get("/health")
def health():
    if pipeline is None:
        return {"status": "error", "detail": f"Model not loaded: {load_error}"}
    return {"status": "ok", "model_loaded": True}


@app.post("/predict")
def predict(req: PredictRequest):
    if pipeline is None:
        raise HTTPException(status_code=500, detail=f"Model not loaded: {load_error}")

    # Check missing features
    missing = [f for f in FEATURES if f not in req.data]
    if missing:
        raise HTTPException(
            status_code=422,
            detail={"error": "Missing features", "missing": missing}
        )

    # Build one-row DataFrame in correct order
    X_one = pd.DataFrame([[req.data[f] for f in FEATURES]], columns=FEATURES)

    # Predict
    try:
        y_pred = pipeline.predict(X_one)
        pred_value = float(y_pred[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

    return {"prediction": pred_value}

