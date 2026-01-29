import { getConfig, getQueuedMessages, updateConfig, updateMessageStatus } from '@app/lib/storage';
import { NextResponse } from 'next/server';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3001';

/**
 * Queue Processor - Processes messages from the FIFO queue
 * GET /api/queue/process - Manually trigger queue processing
 */
export async function GET() {
  try {
    const config = getConfig();
    const queuedMessages = getQueuedMessages();

    if (queuedMessages.length === 0) {
      return NextResponse.json({
        processed: 0,
        message: 'No messages in queue',
      });
    }

    // Check if we should process based on rate limit (messages per hour)
    const now = new Date();
    const lastProcessed = config.lastProcessedAt ? new Date(config.lastProcessedAt) : null;

    if (lastProcessed) {
      const hoursSinceLastProcess =
        (now.getTime() - lastProcessed.getTime()) / (1000 * 60 * 60);
      const minInterval = 1 / config.messagesPerHour; // Hours between messages

      if (hoursSinceLastProcess < minInterval) {
        const waitTime = Math.ceil((minInterval - hoursSinceLastProcess) * 60); // Minutes to wait
        return NextResponse.json({
          processed: 0,
          message: `Rate limit: wait ${waitTime} minutes before next message`,
          nextProcessAt: new Date(
            lastProcessed.getTime() + minInterval * 60 * 60 * 1000
          ).toISOString(),
        });
      }
    }

    // Get the next message (FIFO - already sorted by scheduledAt in getQueuedMessages)
    const nextMessage = queuedMessages[0];

    // Update status to ACCEPTED
    updateMessageStatus(nextMessage.id, 'ACCEPTED');

    // Try to send via gateway
    try {
      const response = await fetch(`${GATEWAY_URL}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: nextMessage.phoneNumber,
          message: nextMessage.message,
        }),
      });

      if (response.ok) {
        updateMessageStatus(nextMessage.id, 'SENT');
        updateConfig({
          lastProcessedAt: now.toISOString(),
          isProcessing: false,
        });

        return NextResponse.json({
          processed: 1,
          message: 'Message sent successfully',
          messageId: nextMessage.id,
          sentAt: now.toISOString(),
        });
      } else {
        const error = await response.json();
        updateMessageStatus(nextMessage.id, 'FAILED', error.error || 'Gateway error');

        return NextResponse.json(
          {
            processed: 0,
            error: 'Failed to send message',
            details: error,
          },
          { status: 500 }
        );
      }
    } catch (gatewayError) {
      // Gateway is not reachable
      updateMessageStatus(
        nextMessage.id,
        'FAILED',
        'Gateway not reachable. Make sure it is running.'
      );

      return NextResponse.json(
        {
          processed: 0,
          error: 'Gateway not reachable',
          details: gatewayError instanceof Error ? gatewayError.message : 'Unknown error',
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error processing queue:', error);
    return NextResponse.json(
      {
        error: 'Failed to process queue',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
