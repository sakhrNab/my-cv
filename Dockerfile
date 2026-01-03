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

# Start the application
# Server binds to 0.0.0.0 and uses PORT env var (set by Coolify)
CMD ["node", "server.js"]

