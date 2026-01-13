from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import pandas as pd
import joblib

# --------------------
# CONFIG
# --------------------
APP_TITLE = "Medical Cost Prediction API"
MODEL_PATH = "best_pipeline.pkl"
FEATURES = ["age", "sex", "bmi", "children", "smoker", "region"]

# --------------------
# INIT APP
# --------------------
app = FastAPI(title=APP_TITLE)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ou l'URL exacte de ton site
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------
# LOAD MODEL
# --------------------
try:
    pipeline = joblib.load(MODEL_PATH)
except Exception as e:
    pipeline = None
    load_error = str(e)

# --------------------
# MODELS
# --------------------
class PredictRequest(BaseModel):
    data: Dict[str, Any]

# --------------------
# ROUTES
# --------------------
@app.get("/")
def root():
    return {"status": "ok", "message": "API is running"}

@app.get("/health")
def health():
    if pipeline is None:
        return {"status": "error", "detail": f"Model not loaded: {load_error}"}
    return {"status": "ok", "model_loaded": True}

# --------------------
# SINGLE PREDICTION
# --------------------
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

# --------------------
# BATCH PREDICTION CSV
# --------------------
@app.post("/predict_batch")
async def predict_batch(file: UploadFile = File(...)):
    if pipeline is None:
        raise HTTPException(status_code=500, detail=f"Model not loaded: {load_error}")

    # Lecture CSV
    try:
        df = pd.read_csv(file.file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read CSV: {e}")

    # Check missing columns
    missing_cols = [f for f in FEATURES if f not in df.columns]
    if missing_cols:
        raise HTTPException(
            status_code=422,
            detail={"error": "Missing columns in CSV", "missing": missing_cols}
        )

    # Optional: reorder columns
    df = df[FEATURES]

    # Predict
    try:
        preds = pipeline.predict(df)
        df["predicted_cost"] = preds
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

    # Return CSV
    csv_output = df.to_csv(index=False)
    return Response(
        content=csv_output,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=predictions.csv"
        }
    )
