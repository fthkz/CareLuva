@echo off
echo Starting simple HTTP server on port 3000...
echo Open your browser and go to: http://127.0.0.1:3000/index.html
echo Press Ctrl+C to stop the server
python -m http.server 3000

