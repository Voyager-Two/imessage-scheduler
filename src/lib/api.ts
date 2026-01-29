/**
 * API client for interacting with the scheduler backend
 */

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

const API_BASE = '/api';

export const schedulerApi = {
  // Messages
  async getMessages() {
    const response = await fetch(`${API_BASE}/messages`);
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  },

  async createMessage(phoneNumber: string, message: string, scheduledAt?: string) {
    const response = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, message, scheduledAt }),
    });
    if (!response.ok) throw new Error('Failed to create message');
    return response.json();
  },

  async deleteMessage(id: string) {
    const response = await fetch(`${API_BASE}/messages?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete message');
    return response.json();
  },

  async updateMessageStatus(id: string, status: string, error?: string) {
    const response = await fetch(`${API_BASE}/messages/status?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, error }),
    });
    if (!response.ok) throw new Error('Failed to update message status');
    return response.json();
  },

  // Configuration
  async getConfig() {
    const response = await fetch(`${API_BASE}/config`);
    if (!response.ok) throw new Error('Failed to fetch config');
    return response.json();
  },

  async updateConfig(updates: { messagesPerHour?: number }) {
    const response = await fetch(`${API_BASE}/config`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update config');
    return response.json();
  },

  // Queue processing
  async processQueue() {
    const response = await fetch(`${API_BASE}/queue/process`);
    if (!response.ok) throw new Error('Failed to process queue');
    return response.json();
  },

  async getQueueStatus() {
    const response = await fetch(`${API_BASE}/queue/status`);
    if (!response.ok) throw new Error('Failed to fetch queue status');
    return response.json();
  },
};
