# PartSelect Chat Agent - Backend

AI-powered chat agent for PartSelect refrigerator and dishwasher parts support.

## Overview

This is the backend API for the PartSelect Chat Agent. It provides a conversational interface for customers to:
- Search for refrigerator and dishwasher parts
- Check part compatibility with their appliance models
- Get installation instructions
- Troubleshoot appliance issues
- Get order support

## Phase 1: Current Implementation

This is **Phase 1** of the backend development. It includes:
- ✅ Express server setup with middleware
- ✅ Request validation and sanitization
- ✅ Session management (in-memory)
- ✅ Message preprocessing pipeline
- ✅ Scope detection (rule-based keyword matching)
- ✅ Intent classification (6 categories)
- ✅ Agent orchestrator with mock responses
- ✅ Error handling framework
- ✅ CORS configuration for frontend
- ✅ Tool registry framework (ready for Phase 3)

Ready for integration with frontend! ✅

## Prerequisites

- Node.js 14+
- npm or yarn

## Installation

1. **Clone or download** this backend folder
2. **Navigate** to the backend directory:
   ```bash
   cd backend
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Create `.env` file** from template:
   ```bash
   cp .env.example .env
   ```

5. **Review `.env`** and update values if needed (port, frontend URL, etc.)

## Development

### Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000` with auto-reload on file changes.

### Start Production Server

```bash
npm start
```

### Run Tests

```bash
npm test
```

Watch mode:
```bash
npm run test:watch
```

With coverage:
```bash
npm run test:coverage
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=info

# Session Management
SESSION_EXPIRY_MINUTES=30
SESSION_SECRET=your-secret-key

# LLM (for later integration)
DEEPSEEK_API_KEY=your_api_key
DEEPSEEK_MODEL=deepseek-chat

# Database (for later integration)
DATABASE_URL=postgres://...
REDIS_URL=redis://...
```

## API Endpoints

### Chat Endpoint

**POST** `/api/chat`

Send a message and get a response from the chat agent.

**Request Body:**
```json
{
  "message": "How can I install part number PS11752778?",
  "sessionId": "optional-uuid" 
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "uuid",
  "messageId": "msg-uuid",
  "response": {
    "type": "installation_guide",
    "content": "Here are installation instructions...",
    "data": { ... }
  },
  "metadata": {
    "processingTime": 245,
    "intent": "installation_guide",
    "inScope": true,
    "toolsUsed": ["installationTool (mock)"],
    "confidence": 0.92
  }
}
```

**Response Types:**
- `text` - General text response
- `product_results` - Product search results
- `installation_guide` - Installation steps
- `troubleshooting` - Troubleshooting guidance
- `out_of_scope` - Message is outside domain
- `error` - An error occurred

### Health Check Endpoint

**GET** `/api/health`

Returns server status.

## Architecture

### Directory Structure

```
src/
├── config/              # Configuration files
│   ├── environment.js   # Environment variables
│   ├── logger.js        # Logging setup
│   └── constants.js     # App constants
├── middleware/          # Express middleware
│   ├── corsHandler.js   # CORS configuration
│   ├── requestLogger.js # Request logging
│   └── errorHandler.js  # Error handling
├── routes/              # Route definitions
│   └── chat.routes.js   # Chat endpoint
├── controllers/         # Request handlers
│   └── chatController.js
├── services/            # Business logic
│   ├── messageService.js          # Message preprocessing
│   ├── sessionService.js          # Session management
│   ├── scopeDetectionService.js   # Scope detection
│   ├── intentClassificationService.js
│   └── agentOrchestrator.js       # Main orchestrator
├── tools/               # Tool framework
│   ├── toolRegistry.js  # Tool registry
│   └── baseTool.js      # Base tool class
├── utils/               # Utility functions
│   ├── validators.js    # Input validation
│   ├── sanitizers.js    # Input sanitization
│   ├── responseFormatter.js
│   └── helpers.js
└── index.js             # Server entry point
```

### Message Processing Pipeline

```
User Input (Frontend)
  ↓
Request Handler & Validation
  ↓
Message Preprocessing (sanitization, tokenization, entity extraction)
  ↓
Scope Detection (is it about parts?)
  ↓
Intent Classification (what does user want?)
  ↓
Agent Orchestrator (route to handler)
  ↓
Mock Response Generation (Phase 1)
  ↓
Response Formatting
  ↓
Response (Frontend)
```

## Intent Classification

The agent classifies user intent into 6 categories:

1. **product_search** - User is looking for a part
   - Keywords: "need", "looking for", "find", "have"
   
2. **compatibility_check** - User checks if part fits their model
   - Keywords: "compatible", "fit", "work with"
   
3. **installation_guide** - User wants installation instructions
   - Keywords: "install", "how to", "setup", "assemble"
   
4. **troubleshooting** - User is having issues
   - Keywords: "broken", "not working", "fix", "repair"
   
5. **order_support** - User has order/pricing questions
   - Keywords: "price", "cost", "order", "buy"
   
6. **general_inquiry** - Other questions about parts
   - Default fallback

## Scope Detection

The agent stays focused on the domain using keyword-based scope detection:

**In-scope topics:**
- Refrigerator and dishwasher parts
- Installation and repair
- Product compatibility
- Troubleshooting
- Orders and pricing

**Out-of-scope topics:**
- General knowledge questions
- Weather, news, recipes, etc.
- Other product categories
- Unrelated topics

Friendly deflection for out-of-scope: "I'm specifically designed to help with Refrigerator and Dishwasher parts..."

## Phase 1 Mock Responses

Currently, the agent returns mock responses for all intents:

- **Product Search**: Returns 2 sample products
- **Compatibility Check**: Assumes compatibility and suggests next steps
- **Installation Guide**: Returns mock installation steps
- **Troubleshooting**: Returns mock causes and solutions
- **Order Support**: Explains future capabilities
- **General Inquiry**: Guides user on what agent can help with

Replace with real tool implementations in Phase 6.

## Integration with Frontend

The backend expects requests from frontend React app at:
- **Development**: `http://localhost:3000`
- **Production**: Configure in `.env`

The frontend should:
1. Send POST to `/api/chat` with message
2. Store `sessionId` from response
3. Send `sessionId` with next message for conversation context
4. Handle response types and render accordingly

### Example Frontend Code

```javascript
// Send message to backend
const response = await fetch('http://localhost:5000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userInput,
    sessionId: currentSessionId // From previous response
  })
});

const data = await response.json();

// Check response type
if (data.response.type === 'product_results') {
  // Render products
} else if (data.response.type === 'installation_guide') {
  // Render steps
} else {
  // Render text
}

// Save session for next message
currentSessionId = data.sessionId;
```

## Local Development Setup

1. **Start Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   
2. **Start Frontend** (in another terminal):
   ```bash
   cd frontend
   npm install
   npm start
   ```
   
3. **Test**:
   - Open `http://localhost:3000` in browser
   - Try sending messages to the backend
   - Check `http://localhost:5000/api/health` to verify backend

## Testing the Agent

### Try These Queries

**In-Scope (should work):**
- "I need a water valve"
- "Is this compatible with my WDT780SAEM1?"
- "How do I install PS11752778?"
- "My ice maker isn't working"
- "What parts do you have?"

**Out-of-Scope (should deflect):**
- "What's the weather?"
- "Tell me a joke"
- "How do I cook chicken?"
- "What are stock prices?"

## Key Features

✅ **Scope Detection** - Stays focused on parts domain
✅ **Intent Classification** - Understands user needs
✅ **Message Preprocessing** - Sanitization and entity extraction
✅ **Session Management** - Multi-turn conversations
✅ **Error Handling** - Graceful error responses
✅ **CORS Ready** - Configured for frontend
✅ **Logging** - Structured logging for debugging
✅ **Extensible** - Ready for tool integration

## Future Phases

- **Phase 2** (already included): Message processing services
- **Phase 3**: Tool registry and framework
- **Phase 4**: Agent orchestrator (included, needs enhancement)
- **Phase 5**: Response formatting (included)
- **Phase 6**: Real tool implementations (productSearchTool, etc.)
- **Phase 7**: Deepseek LLM integration
- **Phase 8**: Testing, optimization, and deployment

## Debugging

### Enable Debug Logging

Set environment variable:
```bash
LOG_LEVEL=debug npm run dev
```

### Check Logs

All requests and responses are logged with:
- Request method, path, and body
- Processing time
- Intent and scope detection results
- Tool execution details

### Common Issues

**CORS Error**: Check that `FRONTEND_URL` in `.env` matches your frontend URL

**Session not persisting**: Sessions are in-memory in Phase 1. Will use database in later phases.

**Mock responses**: Phase 1 returns mock data. Real tools added in Phase 6.

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in `.env`
2. Set `SESSION_SECRET` to a secure random value
3. Remove `LOG_LEVEL=debug`
4. Set up external database and Redis (Phase 7-8)
5. Configure proper error handling and monitoring
6. Deploy to: Heroku, AWS, DigitalOcean, etc.

## Contributing

When adding new features:
1. Follow the modular service architecture
2. Add proper error handling
3. Log debug information
4. Add JSDoc comments
5. Test with both in-scope and out-of-scope queries

## License

MIT

## Support

For issues or questions, check the logs or review the code structure above.

---

**Status**: ✅ Phase 1 Complete - Ready for Frontend Integration
