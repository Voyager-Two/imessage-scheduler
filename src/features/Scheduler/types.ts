// Message Status Types
export type MessageStatus = 'QUEUED' | 'ACCEPTED' | 'SENT' | 'DELIVERED' | 'RECEIVED' | 'FAILED';

// Scheduled Message
export interface ScheduledMessage {
  id: string;
  phoneNumber: string;
  message: string;
  scheduledAt: string;
  createdAt: string;
  status: MessageStatus;
  updatedAt: string;
  error?: string;
}

// Queue Configuration
export interface QueueConfig {
  messagesPerHour: number;
  isProcessing: boolean;
  lastProcessedAt: string | null;
}

// Scheduler State
export interface SchedulerState {
  messages: ScheduledMessage[];
  queueConfig: QueueConfig;
  form: {
    phoneNumber: string;
    message: string;
  };
}

// Helper function to generate unique IDs
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Create a new scheduled message
export const createScheduledMessage = (
  phoneNumber: string,
  message: string,
  scheduledAt: string
): ScheduledMessage => ({
  id: generateId(),
  phoneNumber,
  message,
  scheduledAt,
  createdAt: new Date().toISOString(),
  status: 'QUEUED',
  updatedAt: new Date().toISOString(),
});

// Default queue configuration
export const defaultQueueConfig: QueueConfig = {
  messagesPerHour: 1,
  isProcessing: false,
  lastProcessedAt: null,
};

// Status color mapping
export const statusColors: Record<MessageStatus, { bg: string; text: string; label: string }> = {
  QUEUED: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', label: 'Queued' },
  ACCEPTED: { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7', label: 'Accepted' },
  SENT: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', label: 'Sent' },
  DELIVERED: { bg: 'rgba(34, 197, 94, 0.15)', text: '#16a34a', label: 'Delivered' },
  RECEIVED: { bg: 'rgba(20, 184, 166, 0.1)', text: '#14b8a6', label: 'Received' },
  FAILED: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', label: 'Failed' },
};

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};


