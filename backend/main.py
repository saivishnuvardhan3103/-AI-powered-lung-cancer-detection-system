from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .utils import save_upload, run_detection_pipeline, run_classification_pipeline, extract_patch
import os
import numpy as np

app = FastAPI(title="Lung Cancer Detection API")

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global in-memory cache for processed scans (for MVP)
processed_scans = {}

@app.get("/")
def home():
    return {"message": "Lung Cancer Detection API is running", "status": "online"}

@app.post("/upload")
async def upload_scan(file: UploadFile = File(...)):
    if not file.filename.endswith(('.raw', '.mhd', '.dcm', '.nii', '.gz')):
        # Allow it for testing purposes even if not standard
        pass
    
    contents = await file.read()
    path = save_upload(contents, file.filename)
    
    # Run initial detection
    try:
        image_array, detections = run_detection_pipeline(path)
        is_demo = False
        processed_scans[file.filename] = {
            "path": path,
            "data": image_array,
            "detections": detections,
            "is_demo": False
        }
    except Exception as e:
        # Fallback to dummy data for demo if real processing fails
        image_array, detections = run_detection_pipeline(path, dummy=True)
        is_demo = True
        processed_scans[file.filename] = {
            "path": path,
            "data": image_array,
            "detections": detections,
            "is_demo": True
        }
    
    return {
        "filename": file.filename,
        "num_slices": image_array.shape[0],
        "detections": detections,
        "is_demo": is_demo
    }

@app.get("/slice/{filename}/{slice_idx}")
async def get_slice(filename: str, slice_idx: int):
    if filename not in processed_scans:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    scan_data = processed_scans[filename]["data"]
    if slice_idx < 0 or slice_idx >= scan_data.shape[0]:
        raise HTTPException(status_code=400, detail="Invalid slice index")
    
    slice_data = scan_data[slice_idx]
    # Convert to list for JSON response (base64 or direct image would be better for performance)
    return {
        "slice": slice_data.tolist()
    }

@app.post("/predict_nodule")
async def predict_nodule(filename: str, z: int, y: int, x: int):
    if filename not in processed_scans:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    scan_info = processed_scans[filename]
    scan_data = scan_info["data"]
    is_demo = scan_info.get("is_demo", False)
    
    patch = extract_patch(scan_data, center_coords=(z, y, x))
    prob, risk_level = run_classification_pipeline(patch, is_demo=is_demo)
    
    return {
        "malignancy_score": round(prob, 4),
        "risk_level": risk_level
    }

@app.get("/full-analysis/{filename}")
async def full_analysis(filename: str):
    if filename not in processed_scans:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    scan_info = processed_scans[filename]
    scan_data = scan_info["data"]
    detections = scan_info["detections"]
    is_demo = scan_info.get("is_demo", False)
    
    results = []
    for det in detections:
        patch = extract_patch(scan_data, det["center"])
        prob, risk_level = run_classification_pipeline(patch, is_demo=is_demo)
        results.append({
            "center": det["center"],
            "score": det["score"],
            "radius": det["radius"],
            "malignancy_score": round(prob, 4),
            "risk_level": risk_level
        })
        
    return {
        "filename": filename,
        "analysis_results": results
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
