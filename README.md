# Eyefred

**Eyefred** is a cross-platform desktop application that uses hand-gesture recognition (via MediaPipe) to control media playback, volume, keyboard shortcuts, and launching applications. The application consists of two main components:

1. **Backend (Python Service)**

   * Captures video from the user’s webcam using OpenCV.
   * Runs Google’s MediaPipe Hands model to detect and classify gestures.
   * Exposes a local WebSocket/HTTP interface for emitting gesture events.

2. **Frontend (Electron App)**

   * Provides a user interface for:

     * Viewing live camera feed and detected landmarks.
     * Configuring gesture-to-action bindings.
     * Packaging the application for Windows and macOS.
   * Communicates with the Python backend to receive real-time gesture events.

---

## Features

* Real-time hand-gesture detection with MediaPipe
* Customizable gesture-to-action bindings:

  * Media controls (play/pause, volume up/down, next/prev track)
  * Keyboard shortcuts
  * Launching user-selected applications
* System-tray/menu-bar integration for easy access
* Self-hosted installers with auto-update support via Electron

## Getting Started

### 1. Clone the Repository

```bash
git clone git@github.com:yourusername/eyefred.git
cd eyefred
```

### 2. Backend Setup

```bash
# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# .\venv\Scripts\Activate.ps1  # Windows PowerShell

# Install dependencies
pip install -r backend/requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Running in Development

* **Backend**:

  ```bash
  cd backend
  uvicorn server:app --reload
  ```
* **Frontend**:

  ```bash
  cd frontend
  npm start
  ```

## Project Structure

```
eyefred/
├── backend/
│   ├── server.py         # MediaPipe gesture service
│   ├── gestures.py       # Gesture detection logic
│   ├── actions.py        # Action dispatch functions
│   └── requirements.txt  # Python dependencies
├── frontend/
│   ├── src/              # Electron + React UI code
│   ├── package.json      # Electron build config
│   └── ...
├── .gitignore
└── README.md
```

## License

MIT License. See [LICENSE](LICENSE) for details.

