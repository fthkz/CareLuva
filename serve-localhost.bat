@echo off
echo Starting HTTP server on localhost:3000...
echo Open your browser and go to: http://localhost:3000/index.html
echo Press Ctrl+C to stop the server
python -m http.server 3000 --bind localhost
