import os
import torch
import numpy as np
from .preprocessing import load_scan, get_sitk_array, normalize_hu, resample_scan, extract_patch, generate_dummy_scan
from .model_detection import get_model as get_detection_model
from .model_classification import get_model as get_classification_model

# Setup paths
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Global model pointers (lazy loading)
detection_model = None
classification_model = None

def get_models():
    global detection_model, classification_model
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    if detection_model is None:
        detection_model = get_detection_model().to(device)
        detection_model.eval()
        # In a real app, load weights here: detection_model.load_state_dict(torch.load("detection_weights.pth", map_location=device))
        
    if classification_model is None:
        classification_model = get_classification_model().to(device)
        classification_model.eval()
        # In a real app, load weights here: classification_model.load_state_dict(torch.load("classification_weights.pth", map_location=device))
        
    return detection_model, classification_model, device

import hashlib

def run_detection_pipeline(file_path, dummy=False):
    """
    Full pipeline: Load -> Preprocess -> Detect -> Return results.
    """
    if dummy:
        image_array = generate_dummy_scan()
        filename = os.path.basename(file_path)
        
        # Use filename hash to seed randomness for consistent but unique dummy results
        seed = int(hashlib.md5(filename.encode()).hexdigest(), 16) % 10000
        np.random.seed(seed)
        
        num_nodules = np.random.randint(1, 4)
        detections = []
        for _ in range(num_nodules):
            detections.append({
                "center": [
                    np.random.randint(30, 100), 
                    np.random.randint(30, 100), 
                    np.random.randint(30, 100)
                ],
                "score": round(np.random.uniform(0.7, 0.98), 2),
                "radius": np.random.randint(3, 8)
            })
            
        return image_array, detections

    # Real pipeline
    image = load_scan(file_path)
    image_resampled = resample_scan(image)
    image_array = get_sitk_array(image_resampled)
    image_norm = normalize_hu(image_array)
    
    det_model, _, device = get_models()
    
    # Simple sliding window or downsampled inference for detection (placeholder)
    # Full 3D U-Net inference can be memory intensive on CPU.
    # In an MVP, we'll return a heatmap or use a lightweight version.
    
    # Mocking real detection for now as we don't have weights
    z, y, x = image_norm.shape
    detections = [
        {"center": [z//2, y//2, x//2], "score": 0.88, "radius": 4}
    ]
    
    return image_norm, detections

def run_classification_pipeline(patch_array, is_demo=False):
    """
    Run classification on a single 3D patch.
    """
    if is_demo:
        # Generate a wide variety of scores for demonstration purposes
        prob = np.random.uniform(0.1, 0.95)
    else:
        _, clf_model, device = get_models()
        patch_tensor = torch.from_numpy(patch_array).unsqueeze(0).unsqueeze(0).to(device, dtype=torch.float32)
        
        with torch.no_grad():
            prob = clf_model(patch_tensor).item()
        
    risk_level = "low"
    if prob > 0.7:
        risk_level = "high"
    elif prob > 0.4:
        risk_level = "medium"
        
    return prob, risk_level

def save_upload(file_contents, filename):
    path = os.path.join(UPLOAD_DIR, filename)
    with open(path, "wb") as f:
        f.write(file_contents)
    return path
