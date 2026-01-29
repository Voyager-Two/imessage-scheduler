import express from 'express';
import cors from 'cors';
import { sendIMessage, checkMessagesApp, getIMessageAccounts } from './imessage';

const app = express();
const PORT = process.env.GATEWAY_PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Check if Messages.app is available
app.get('/status', async (req, res) => {
  try {
    const isRunning = await checkMessagesApp();
    const accounts = isRunning ? await getIMessageAccounts() : [];

    res.json({
      messagesAppRunning: isRunning,
      accounts,
      ready: isRunning && accounts.length > 0,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to check status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Send an iMessage
app.post('/send', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and message are required',
      });
    }

    // Check if Messages.app is ready
    const isReady = await checkMessagesApp();
    if (!isReady) {
      return res.status(503).json({
        success: false,
        error: 'Messages.app is not running or not accessible',
      });
    }

    // Send the message
    const result = await sendIMessage(phoneNumber, message);

    if (result.success) {
      res.json({
        success: true,
        phoneNumber,
        sentAt: new Date().toISOString(),
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to send message',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 iMessage Gateway running on http://localhost:${PORT}`);
  console.log(`📱 Make sure Messages.app is open and signed in to iMessage`);
});
