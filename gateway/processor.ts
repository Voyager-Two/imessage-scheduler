import cron from 'node-cron';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

console.log('🔄 Starting Queue Processor...');
console.log(`📡 Backend URL: ${BACKEND_URL}`);
console.log('⏰ Schedule: Every minute');
console.log('');

// Process queue every minute
cron.schedule('* * * * *', async () => {
  const timestamp = new Date().toLocaleString();
  console.log(`[${timestamp}] Processing queue...`);

  try {
    const response = await fetch(`${BACKEND_URL}/api/queue/process`);
    const data = await response.json();

    if (data.processed > 0) {
      console.log(`✅ [${timestamp}] ${data.message || 'Message processed'}`);
    } else if (data.nextProcessAt) {
      const waitTime = Math.ceil(
        (new Date(data.nextProcessAt).getTime() - Date.now()) / 60000
      );
      console.log(`⏳ [${timestamp}] Rate limited - wait ${waitTime} minute(s)`);
    } else {
      console.log(`ℹ️  [${timestamp}] ${data.message || 'No messages in queue'}`);
    }
  } catch (error) {
    console.error(`❌ [${timestamp}] Error:`, error instanceof Error ? error.message : error);
  }
});

console.log('✅ Queue Processor is running');
console.log('   Press Ctrl+C to stop');
console.log('');

// Keep the process running
process.on('SIGINT', () => {
  console.log('\n👋 Stopping Queue Processor...');
  process.exit(0);
});
