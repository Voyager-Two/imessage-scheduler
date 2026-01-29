import fs from 'fs';
import path from 'path';
import type { MessageStatus, ScheduledMessage } from '@features/Scheduler/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
if (!fs.existsSync(MESSAGES_FILE)) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2));
}

if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(
    CONFIG_FILE,
    JSON.stringify({ messagesPerHour: 1, isProcessing: false, lastProcessedAt: null }, null, 2)
  );
}

export interface QueueConfig {
  messagesPerHour: number;
  isProcessing: boolean;
  lastProcessedAt: string | null;
}

// Messages storage
export const getMessages = (): ScheduledMessage[] => {
  const data = fs.readFileSync(MESSAGES_FILE, 'utf-8');
  return JSON.parse(data);
};

export const saveMessages = (messages: ScheduledMessage[]): void => {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
};

export const addMessage = (message: ScheduledMessage): ScheduledMessage => {
  const messages = getMessages();
  messages.push(message);
  saveMessages(messages);
  return message;
};

export const updateMessageStatus = (
  id: string,
  status: MessageStatus,
  error?: string
): ScheduledMessage | null => {
  const messages = getMessages();
  const message = messages.find((m) => m.id === id);
  if (message) {
    message.status = status;
    message.updatedAt = new Date().toISOString();
    if (error) {
      message.error = error;
    }
    saveMessages(messages);
    return message;
  }
  return null;
};

export const deleteMessage = (id: string): boolean => {
  const messages = getMessages();
  const filtered = messages.filter((m) => m.id !== id);
  if (filtered.length !== messages.length) {
    saveMessages(filtered);
    return true;
  }
  return false;
};

export const getQueuedMessages = (): ScheduledMessage[] => {
  return getMessages()
    .filter((m) => m.status === 'QUEUED')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
};

// Queue configuration storage
export const getConfig = (): QueueConfig => {
  const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
  return JSON.parse(data);
};

export const saveConfig = (config: QueueConfig): void => {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
};

export const updateConfig = (updates: Partial<QueueConfig>): QueueConfig => {
  const config = getConfig();
  const newConfig = { ...config, ...updates };
  saveConfig(newConfig);
  return newConfig;
};
