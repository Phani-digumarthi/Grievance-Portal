CivicConnect: AI-Powered Public Grievance Platform
CivicConnect is a smart grievance redressal system that uses Hybrid AI (Computer Vision + NLP) to prioritize public complaints based on urgency. It features a Next.js frontend, Node.js backend, and a Python-based AI Engine using OpenAI CLIP and Transformers.

🛠️ Prerequisites (External System Requirements)
Before setting up the project, ensure you have the following installed globally on your machine:

Node.js (v18 or higher) - Download Here

Python (v3.9 or higher) - Download Here

MongoDB (Local or Atlas) - Download Here

Git - Download Here

⚙️ Installation Guide
Since dependencies and large AI models are excluded from the repository, follow these steps to set up the environment locally.

1. Clone the Repository
Bash
git clone https://github.com/Phani-digumarthi/public-grievance-platform.git
cd civic-connect
2. Backend Setup (Node.js)
The backend handles API requests and database connections.

Navigate to the server directory:

Bash
cd server
Install dependencies (restores node_modules):

Bash
npm install
Create Environment File: Create a file named .env inside the server/ folder and add:

Code snippet
PORT=5000
MONGO_URI=mongodb://localhost:27017/civic_connect_db
Start the Server:

Bash
node index.js
You should see: ✅ Server running on port 5000 & ✅ MongoDB Connected

3. Frontend Setup (Next.js)
The web portal for Admins and Citizens.

Open a new terminal and navigate to the web portal:

Bash
cd web-portal
Install dependencies:

Bash
npm install
Start the Development Server:

Bash
npm run dev
Access the app at: http://localhost:3000

4. AI Engine Setup (Python) 🧠
This is the most critical step. The AI models (CLIP, Whisper, Scikit-learn) are heavy and were not uploaded. We need to reinstall the libraries.

Open a new terminal and navigate to the AI engine:

Bash
cd ai-engine
Create a Virtual Environment (Recommended):

Bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
Install Python Dependencies: Run this command to install all required AI libraries:

Bash
pip install fastapi uvicorn python-multipart torch transformers pillow scikit-learn pandas numpy textblob openai-whisper
Generate Training Data (First Time Only): We need to retrain the text classification models locally.

Bash
python generate_data.py
Start the AI Server:

Bash
uvicorn main:app --reload --port 8000
⚠️ Note on First Run: When you start the AI server for the first time, it will automatically download the OpenAI CLIP Model (~500MB) and Whisper Model. This may take a few minutes depending on your internet speed.

🏃‍♂️ How to Run the Full App
You need 3 Terminals running simultaneously:

Backend: localhost:5000 (Database & API)

AI Engine: localhost:8000 (Image & Text Analysis)

Frontend: localhost:3000 (User Interface)

📂 Project Structure
civic-connect/
├── ai-engine/         # Python FastAPI (ML Models)
│   ├── main.py        # AI Logic (CLIP, Safety Overrides)
│   └── dataset.csv    # Training data (Generated locally)
├── server/            # Node.js Express
│   ├── models/        # MongoDB Schemas
│   └── index.js       # API Routes
└── web-portal/        # Next.js 13+ (App Router)
    ├── app/           # Pages (Admin Dashboard, Lodge Grievance)
    └── components/    # Reusable UI (Map, Forms)
🔒 Security Note
This project uses .env files to manage configuration. These files are listed in .gitignore and must not be committed to GitHub. Always create them manually on a new machine.
