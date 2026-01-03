# Use Node.js 20+ LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy application files
COPY . .

# Expose port (Coolify will handle port mapping automatically)
EXPOSE 3011

# Health check (uses PORT env var, defaults to 3011)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "const port = process.env.PORT || 3011; require('http').get(`http://localhost:${port}/health`, (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"

# Start the application
# Server binds to 0.0.0.0 and uses PORT env var (set by Coolify)
CMD ["node", "server.js"]

