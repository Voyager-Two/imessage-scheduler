# iMessage Scheduler

A fullstack message scheduling application with real iMessage integration using AppleScript. This monorepo contains three separate components as required: Frontend UI, Backend API & Queue Processor, and iMessage Gateway.

<img width="2020" height="1730" alt="image" src="https://github.com/user-attachments/assets/e5efccdf-7c0a-4cc0-ada1-1125461b8f4c" />

## AI usage notice
I've used AI extensively via Cursor editor. The code patterns and style are based on my personal taste and are based on my many years of experience both professionally and based on projects. AI needs good guidance from an experienced engineer, otherwise it can use bad patterns without complaining. So in essence, AI is only good (in scale) as good as the engineer guiding it. Without good guidance and prompting, AI-generated code can become very hard to maintain and scale.

AI allows me to move and test features faster. It has been a game changer for me and I enjoy web development a lot more while using it. This is because it reduces time wasted on mundane repetitive actions and allows me to focus more on the fun parts of coding, building, and engineering.

## 🏗️ Monorepo Structure

This project follows a monorepo architecture with clear separation of concerns:

```
demo-scheduler/
│
├── src/                          # (1) FRONTEND + (2) BACKEND
│   ├── features/Scheduler/       # → Frontend: React UI components
│   │   ├── index.tsx             #    - Schedule message form
│   │   ├── components/           #    - Dashboard with stats
│   │   │   ├── MessageCard.tsx   #    - Message list views
│   │   │   ├── StatsBar.tsx      #    - Settings modal
│   │   │   └── SettingsModal.tsx
│   │   ├── schedulerSlice.ts     #    - Redux state management
│   │   └── css/                  #    - Styling
│   │
│   ├── app/api/                  # → Backend: API Routes & Queue
│   │   ├── messages/             #    - Message CRUD endpoints
│   │   ├── config/               #    - Queue configuration
│   │   └── queue/                #    - Queue processor (FIFO)
│   │
│   └── lib/
│       ├── storage.ts            #    - Persistent storage layer
│       └── api.ts                #    - Frontend API client
│
├── gateway/                      # (3) iMESSAGE AUTOMATION
│   ├── server.ts                 # → Express server (port 3001)
│   ├── imessage.ts               # → AppleScript integration
│   ├── processor.ts              # → Queue processor (node-cron)
│   ├── package.json              # → Separate dependencies
│   ├── yarn.lock                 # → Independent project
│   ├── .env.example              # → Environment template
│   └── scripts/                  # → Setup & test scripts
│       ├── setup.sh
│       └── test.sh
│
└── data/                         # Auto-generated storage
    ├── messages.json             # Queued messages
    └── config.json               # Queue configuration
```

## 📦 Three Components Explained

### 1. Frontend (Scheduling UI)
- **Location**: `src/features/Scheduler/`
- **Tech**: Next.js 15, React 19, Redux Toolkit, CSS Modules
- **Purpose**: Web UI for scheduling messages and monitoring queue
- **Features**:
  - Schedule message form (phone + message)
  - Real-time dashboard with statistics
  - Message list with filtering (All, Queued, Sent, Failed)
  - Settings for queue configuration

### 2. Backend (Delivery System)
- **Location**: `src/app/api/` + `src/lib/storage.ts`
- **Tech**: Next.js API Routes, Node.js File System
- **Purpose**: Message queue processor with FIFO ordering and rate limiting
- **Features**:
  - RESTful API for message operations
  - FIFO queue processing (oldest first)
  - Configurable rate limiting (messages per hour)
  - Persistent JSON storage
  - Status tracking (QUEUED → ACCEPTED → SENT → DELIVERED)

### 3. Gateway (iMessage Automation)
- **Location**: `gateway/`
- **Tech**: Express.js, AppleScript, node-cron, macOS Messages.app
- **Purpose**: Send actual iMessages + Automated queue processing
- **Features**:
  - **Gateway Server** (`server.ts`) - HTTP API for sending iMessages
  - **Queue Processor** (`processor.ts`) - Automated cron job
  - Real iMessage sending through Messages.app
  - Automatic queue processing every minute
  - Health checks and status monitoring
  - Two independent processes in one folder

## Tech Stack

- **Frontend**: Next.js 15, React 19, Redux Toolkit, CSS Modules
- **Backend**: Next.js API Routes, Node.js
- **Gateway**: Express.js, AppleScript
- **Storage**: File-based JSON
- **Language**: TypeScript throughout

## Prerequisites

- **macOS** (required for iMessage functionality)
- **Node.js** 22.x or higher
- **Yarn** 4.7.0 or higher
- **Messages.app** signed in with Apple ID and iMessage enabled

## 🚀 Quick Start

### Installation

```bash
# Run the setup script (installs all dependencies)
./gateway/scripts/setup.sh
```

Or manually:

```bash
# 1. Install frontend + backend dependencies
yarn install

# 2. Install gateway dependencies
cd gateway
yarn install
cd ..

# 3. Create data directory
mkdir -p data

# 4. Copy environment variables (optional)
cp .env.example .env.local
```

## 🏃 Running the Application

The application consists of **three independent services**:

### Terminal 1: Frontend + Backend
```bash
yarn dev
```
Starts the Next.js app on **http://localhost:3000**
- Frontend UI
- Backend API routes
- Queue processor endpoints

### Terminal 2: Gateway (iMessage Automation)
```bash
cd gateway
yarn dev
```
Starts the gateway service on **http://localhost:3001**
- iMessage sending via AppleScript
- Messages.app integration

### Terminal 3: Queue Processor (Auto-processing)
```bash
cd gateway
yarn processor
```
Starts the automated queue processor
- Processes queue every minute
- Respects rate limiting configuration
- Shows processing logs in real-time

### ⚠️ Important
- **Keep all three terminals running** for full automation
- **Messages.app must be open** and signed in to iMessage
- **Test the system** with `./gateway/scripts/test.sh`

### Alternative: Manual Processing
If you don't want automatic processing, skip Terminal 3 and use the "Process Queue" button in the UI or run:
```bash
curl http://localhost:3000/api/queue/process
```

## 📖 How to Use

### Step 1: Schedule a Message

1. Open **http://localhost:3000** in your browser
2. Enter a phone number (e.g., `+1 (555) 123-4567`)
3. Type your message
4. Click **"Schedule Message"**
   - Message is added to the queue with `QUEUED` status
   - Visible in the dashboard immediately

### Step 2: Configure Queue Settings (Optional)

1. Click **"Settings"** button in the header
2. Adjust **"Messages per Hour"** (default: 1)
   - This controls the rate limiting
   - Example: 2 = one message every 30 minutes
3. Click **"Save Changes"**

### Step 3: Process the Queue

The queue can be processed in three ways:

#### Option A: Automated Queue Processor (Recommended)
```bash
# Start the queue processor (Terminal 3)
cd gateway
yarn processor
```
- Automatically processes queue every minute
- Shows real-time logs
- Respects rate limiting

#### Option B: UI Button (Manual)
- Click **"Process Queue"** button in the web interface
- Good for testing and demos
- Immediate feedback

#### Option C: System Cron (Background)
```bash
# Set up cron to process every minute
crontab -e

# Add this line:
* * * * * curl http://localhost:3000/api/queue/process > /dev/null 2>&1
```

### Message Status Flow

Messages progress through these statuses:

```
QUEUED → ACCEPTED → SENT → (DELIVERED) → (RECEIVED)
  ↓         ↓         ↓
FAILED ← FAILED ← FAILED
```

- **QUEUED**: Waiting in queue
- **ACCEPTED**: Being processed by queue processor
- **SENT**: Successfully sent via gateway
- **DELIVERED**: Delivered to recipient (future feature)
- **FAILED**: Error occurred (check error message)

> **Note:** With the current AppleScript gateway, only QUEUED → ACCEPTED → SENT (and FAILED/CANCELLED) are set automatically. DELIVERED and RECEIVED are part of the iMessage protocol but are not exposed by the standard Messages.app AppleScript interface, so they cannot be detected or set by this gateway.

## API Endpoints

### Messages

- `GET /api/messages` - Get all messages
- `POST /api/messages` - Create a new scheduled message
- `DELETE /api/messages?id={id}` - Delete a message

### Configuration

- `GET /api/config` - Get queue configuration
- `PATCH /api/config` - Update queue configuration

### Queue

- `GET /api/queue/process` - Process next message in queue
- `GET /api/queue/status` - Get queue status

### Gateway

- `GET http://localhost:3001/health` - Health check
- `GET http://localhost:3001/status` - Check Messages.app status
- `POST http://localhost:3001/send` - Send an iMessage

## 🧪 Testing the System

Run the test script to verify everything is working:

```bash
./gateway/scripts/test.sh
```

This checks:
- ✅ Frontend is running
- ✅ Gateway is accessible
- ✅ Messages.app is ready
- ✅ API endpoints are responding
- ✅ Data storage is set up

### Manual Testing

```bash
# Check gateway status
curl http://localhost:3001/status

# Check queue status
curl http://localhost:3000/api/queue/status

# Get all messages
curl http://localhost:3000/api/messages

# Process queue manually
curl http://localhost:3000/api/queue/process
```

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Gateway URL (default: http://localhost:3001)
GATEWAY_URL=http://localhost:3001

# Gateway port (default: 3001)
GATEWAY_PORT=3001
```

## Troubleshooting

### Gateway not reachable

- Ensure the gateway is running (`cd gateway && yarn dev`)
- Check that Messages.app is open and signed in
- Verify the gateway URL in settings

### Messages not sending

1. Check Messages.app is running:
   ```bash
   curl http://localhost:3001/status
   ```

2. Verify iMessage is enabled in Messages.app preferences
3. Check the gateway logs for errors
4. Ensure you have an active internet connection

### "Rate limit" error

The queue enforces your "messages per hour" setting. Wait for the specified interval before the next message is processed.

## Architecture Notes

### Queue Processing Logic

1. Fetches all QUEUED messages
2. Sorts by `scheduledAt` (FIFO)
3. Checks rate limit based on `messagesPerHour` config
4. Processes next message if rate limit allows
5. Updates status based on gateway response

### Storage

Messages and configuration are stored in JSON files in the `data/` directory:
- `data/messages.json` - All scheduled messages
- `data/config.json` - Queue configuration

## 🚀 Production Considerations

- More proper phone number formatting w/ a library and international coverage
- Replace JSON storage with PostgreSQL/MongoDB
- Add authentication and authorization
- Deploy frontend to Vercel
- Run gateway as a background service
- Add monitoring and alerting
- Implement actual DELIVERED/RECEIVED status detection
- Add message templates and scheduling for future dates
- Support group messages and attachments
