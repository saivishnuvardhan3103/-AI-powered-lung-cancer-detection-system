# LungSense AI - Lung Cancer Detection MVP

LungSense AI is an end-to-end medical imaging analysis platform designed to detect pulmonary nodules and assess malignancy risk from 3D CT scans.

Features
- **3D CT Scan Support**: Processes DICOM, NIfTI, and MHD formats.
- **Deep Learning Pipeline**:
  - **Detection**: 3D U-Net for nodule localization.
  - **Classification**: 3D CNN for malignancy risk assessment.
- **Interactive Dashboard**:
  - **Slice Viewer**: Scroll through 128+ slices of 3D volumes.
  - **Real-time Overlays**: Bounding boxes and confidence scores.
  - **Analysis Report**: Detailed breakdown of every detected nodule.
- **Demo Mode**: Fallback to synthetic data for demonstrating UI/UX without medical datasets.

---

Tech Stack
- **Backend**: FastAPI, PyTorch, SimpleITK, NumPy.
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Environment**: Isolated Python Virtual Environment (venv).

---

Getting Started

### 1. Prerequisites
- Python 3.9+
- Node.js 16+
- PowerShell (on Windows)

### 2. Setup Virtual Environment
```powershell
# Create and activate venv
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install backend dependencies
pip install -r backend/requirements.txt
```

### 3. Install Frontend Dependencies
```powershell
cd frontend
npm install
cd ..
```

---

Running the Application

### Start Backend (Terminal 1)
```powershell
.\venv\Scripts\Activate.ps1
python -m uvicorn backend.main:app --port 8000 --reload
```

### Start Frontend (Terminal 2)
```powershell
cd frontend
npm run dev
```
Navigate to **http://localhost:5173** to view the application.

---

Project Structure
- `backend/`: FastAPI application, models, and preprocessing logic.
- `frontend/`: React application and UI components.
- `uploads/`: Temporary storage for uploaded scans.
- `venv/`: Python virtual environment.

---

Testing with Demo Mode
If you don't have a `.mhd` or `.dcm` file, simply upload any small file (like a `.png` or `.txt`) to the dashboard. The system will automatically trigger **Simulated Results** with randomized 3D volumes and nodules to demonstrate the full analysis terminal.

---

## 📝 License
MVP version for educational and demonstration purposes.
