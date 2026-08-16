import uvicorn

if __name__ == "__main__":
    # Runs the FastAPI application using Uvicorn
    # Defaults to port 8000, binding to all interfaces (0.0.0.0)
    # Reload is set to False because we load the Hugging Face model on startup, 
    # and reloading would trigger slow model reloading cycles on code edits.
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False
    )
