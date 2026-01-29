import { addMessage, deleteMessage, getMessages } from '@app/lib/storage';
import { createScheduledMessage } from '@features/Scheduler/types';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/messages - Get all messages
export async function GET() {
  try {
    const messages = getMessages();
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/messages - Create a new scheduled message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, message, scheduledAt } = body;

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    const newMessage = createScheduledMessage(
      phoneNumber,
      message,
      scheduledAt || new Date().toISOString()
    );

    const savedMessage = addMessage(newMessage);
    return NextResponse.json({ message: savedMessage }, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}

// DELETE /api/messages?id=xxx - Delete a message
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    const deleted = deleteMessage(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
