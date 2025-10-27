#!/bin/bash

# Start Ollama server in background
ollama serve &

# Wait for server to start
sleep 10

# Pull the model
echo "Pulling llama3.1:8b model..."
ollama pull llama3.1:8b

echo "Ollama server is ready!"

# Keep the container running
wait