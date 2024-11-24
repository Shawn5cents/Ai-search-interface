# AI Search Interface v1.0.0-beta

A modern, responsive AI-powered search application with advanced features and robust infrastructure.

## Features

- Modern React-based frontend with Tailwind CSS
- Full-stack implementation with Node.js backend
- Integration with Mixtral-8x7B AI model
- Progressive Web App (PWA) capabilities
- Advanced error handling and logging
- Rate limiting and security features

## Tech Stack

### Frontend
- React 18
- Tailwind CSS
- Progressive Web App features
- Local Storage caching

### Backend
- Express.js
- Winston (logging)
- Morgan (HTTP logging)
- Node-fetch
- Helmet (security)
- Compression

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install frontend dependencies
   npm install

   # Install backend dependencies
   cd server
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the server directory with:
   ```
   PORT=5000
   NODE_ENV=development
   OPENAI_API_KEY=your_api_key
   OPENAI_API_URL=https://glhf.chat/api/openai/v1
   REDIS_URL=redis://localhost:6379
   CORS_ORIGIN=http://localhost:3000
   ```

4. Start the development servers:
   ```bash
   # Start backend server (from server directory)
   npm run dev

   # Start frontend development server (from root directory)
   npm start
   ```

## API Documentation

### Search Endpoint
- URL: `/api/search`
- Method: `POST`
- Body:
  ```json
  {
    "query": "Your search query here"
  }
  ```
- Response:
  ```json
  {
    "result": "AI-generated response",
    "duration": 1234,
    "timestamp": "2024-11-24T10:18:07.000Z"
  }
  ```

## Error Handling

The application implements comprehensive error handling:
- Frontend service retries
- Backend request validation
- Detailed error logging
- User-friendly error messages

## Security Features

- Rate limiting
- Content Security Policy
- CORS configuration
- Error message sanitization
- Secure logging practices

## Development

### Code Style
- ESLint configuration
- Prettier formatting
- Jest testing framework

### Testing
Run tests with:
```bash
npm test
```

## Version History

### v1.0.0-beta
- Initial beta release
- Integrated Mixtral-8x7B AI model
- Implemented comprehensive error handling
- Added detailed logging system
- Enhanced security features

## License

MIT License - see LICENSE file for details
