FROM ollama/ollama:latest

# Set environment variables for Railway
ENV OLLAMA_HOST=0.0.0.0
ENV OLLAMA_ORIGINS=*

# Expose the port
EXPOSE 11434

# Create startup script inline
RUN echo '#!/bin/bash\n\
# Start ollama in background\n\
ollama serve &\n\
# Wait for server to be ready\n\
sleep 15\n\
# Pull a smaller, faster model for Railway\n\
ollama pull llama3.2:3b\n\
# Keep container running\n\
wait' > /start.sh && chmod +x /start.sh

# Start the service
CMD ["/start.sh"]