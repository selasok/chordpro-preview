@echo off

REM Database project folder
cd /d C:\Users\Sela\PycharmProjects\music-db

REM Activate the virtual environment
call .venv\Scripts\activate.bat

REM Start FastAPI server in a new command window and keep it open
start cmd /k uvicorn main:app

REM Wait a moment to ensure the server starts
timeout /t 3 > nul

REM Open index.html in the default browser
start "" "D:\Projects\chord-pro-preview\index.html"

exit