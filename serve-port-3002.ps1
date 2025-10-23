# Simple HTTP Server for CareLuva on Port 3002
$port = 3002
$path = Get-Location

Write-Host "Starting HTTP server on port $port..."
Write-Host "Serving files from: $path"
Write-Host "Open your browser and go to: http://localhost:$port/index.html"
Write-Host "Press Ctrl+C to stop the server"

try {
    # Create HTTP listener
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$port/")
    $listener.Start()
    
    Write-Host "Server started successfully!"
    
    while ($listener.IsListening) {
        try {
            # Wait for a request
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            
            # Get the requested file path
            $requestPath = $request.Url.LocalPath.TrimStart('/')
            if ($requestPath -eq "") {
                $requestPath = "index.html"
            }
            
            $filePath = Join-Path $path $requestPath
            
            # Check if file exists
            if (Test-Path $filePath -PathType Leaf) {
                # Read and serve the file
                $content = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentLength64 = $content.Length
                
                # Set content type based on file extension
                $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
                switch ($extension) {
                    ".html" { $response.ContentType = "text/html; charset=utf-8" }
                    ".css" { $response.ContentType = "text/css; charset=utf-8" }
                    ".js" { $response.ContentType = "application/javascript; charset=utf-8" }
                    ".json" { $response.ContentType = "application/json; charset=utf-8" }
                    ".png" { $response.ContentType = "image/png" }
                    ".jpg" { $response.ContentType = "image/jpeg" }
                    ".jpeg" { $response.ContentType = "image/jpeg" }
                    ".gif" { $response.ContentType = "image/gif" }
                    ".svg" { $response.ContentType = "image/svg+xml" }
                    default { $response.ContentType = "text/plain; charset=utf-8" }
                }
                
                $response.OutputStream.Write($content, 0, $content.Length)
                Write-Host "Served: $requestPath"
            } else {
                # File not found
                $response.StatusCode = 404
                $errorMessage = "File not found: $requestPath"
                $errorBytes = [System.Text.Encoding]::UTF8.GetBytes($errorMessage)
                $response.ContentLength64 = $errorBytes.Length
                $response.ContentType = "text/plain; charset=utf-8"
                $response.OutputStream.Write($errorBytes, 0, $errorBytes.Length)
                Write-Host "404: $requestPath"
            }
            
            $response.Close()
        } catch {
            Write-Host "Error processing request: $($_.Exception.Message)"
        }
    }
} catch {
    Write-Host "Error starting server: $($_.Exception.Message)"
} finally {
    if ($listener -and $listener.IsListening) {
        $listener.Stop()
        Write-Host "Server stopped."
    }
}



