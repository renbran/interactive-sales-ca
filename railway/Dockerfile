# Railway Ollama Deployment
FROM ollama/ollama:latest

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV OLLAMA_HOST=0.0.0.0
ENV OLLAMA_ORIGINS=*
ENV OLLAMA_MODELS=/app/models

# Create directory for models
RUN mkdir -p /app/models

# Copy startup script
COPY start-ollama.sh /start-ollama.sh
RUN chmod +x /start-ollama.sh

# Expose port
EXPOSE 11434

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:11434/api/tags || exit 1

# Start Ollama
CMD ["/start-ollama.sh"]