# AI Chat Integration Setup

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your .env file:**
   Create a `.env` file in the root directory with:
   ```
   OPENAPI_KEY=your_openai_api_key_here
   PORT=3000
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Access the CV:**
   Open `http://localhost:3000` in your browser

## Features

- ✅ OpenAI GPT-4o-mini integration
- ✅ Professional system prompt about Sakhr
- ✅ Chat history context (last 10 messages)
- ✅ Typing indicators
- ✅ Fallback responses if API fails
- ✅ Enhanced chat UI with animations

## API Endpoint

The chat uses `/api/chat` endpoint which:
- Accepts POST requests with `{ message: string, history: array }`
- Returns `{ response: string, usage: object }`

## Deployment

For production, deploy the `server.js` file to:
- Vercel (serverless function)
- Netlify Functions
- AWS Lambda
- Any Node.js hosting (Heroku, Railway, etc.)

Make sure to set the `OPENAPI_KEY` environment variable in your hosting platform.




