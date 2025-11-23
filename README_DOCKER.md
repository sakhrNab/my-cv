# Docker Setup for Sakhr's CV

This guide explains how to run the CV application using Docker Compose.

## Prerequisites

- Docker installed on your system
- Docker Compose installed (usually comes with Docker Desktop)
- OpenAI API key

## Quick Start

1. **Create a `.env` file** in the root directory:
   ```env
   OPENAPI_KEY=your_openai_api_key_here
   PORT=3000
   ```
   
   **Note:** Make sure to replace `your_openai_api_key_here` with your actual OpenAI API key.

2. **Build and start the containers**:
   ```bash
   docker-compose up -d
   ```

3. **Access the application**:
   Open your browser and navigate to `http://localhost:3000`

## Commands

### Start the application
```bash
docker-compose up -d
```

### Stop the application
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
```

### Rebuild after changes
```bash
docker-compose up -d --build
```

### Check container status
```bash
docker-compose ps
```

### Access container shell
```bash
docker-compose exec cv-app sh
```

## Environment Variables

The following environment variables can be set in your `.env` file:

- `OPENAPI_KEY` (required): Your OpenAI API key for the AI chat functionality
- `PORT` (optional): Port to run the server on (default: 3000)

## File Structure

```
.
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile           # Docker image definition
├── .dockerignore        # Files to exclude from Docker build
├── .env                 # Environment variables (create this)
├── server.js            # Express server
├── index.html           # Main CV HTML file
├── package.json         # Node.js dependencies
└── assets/             # Static assets (images, etc.)
```

## Troubleshooting

### Port already in use
If port 3000 is already in use, change it in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Use port 3001 on host
```

### API key not working
- Ensure your `.env` file is in the root directory
- Check that `OPENAPI_KEY` is set correctly
- Restart the container: `docker-compose restart`

### Container won't start
- Check logs: `docker-compose logs cv-app`
- Verify Docker is running: `docker ps`
- Rebuild: `docker-compose up -d --build`

## Production Deployment

For production deployment:

1. Use a reverse proxy (nginx) in front of the container
2. Set up SSL/TLS certificates
3. Use environment variables from your hosting platform
4. Consider using Docker secrets for sensitive data
5. Set up proper logging and monitoring

## Health Check

The container includes a health check that verifies the server is responding. Check health status:

```bash
docker-compose ps
```

The status should show as "healthy" when running correctly.

