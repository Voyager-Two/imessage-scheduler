import type { RootState } from '@app/common/state/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  createScheduledMessage,
  defaultQueueConfig,
  MessageStatus,
  ScheduledMessage,
  SchedulerState,
} from './types';

const initialState: SchedulerState = {
  messages: [],
  queueConfig: defaultQueueConfig,
  form: {
    phoneNumber: '',
    message: '',
  },
};

export const schedulerSlice = createSlice({
  name: 'scheduler',
  initialState,
  reducers: {
    // Sync with backend
    syncMessages: (state, action: PayloadAction<ScheduledMessage[]>) => {
      state.messages = action.payload;
    },

    // Form actions
    setPhoneNumber: (state, action: PayloadAction<string>) => {
      state.form.phoneNumber = action.payload;
    },
    setMessage: (state, action: PayloadAction<string>) => {
      state.form.message = action.payload;
    },
    clearForm: (state) => {
      state.form.phoneNumber = '';
      state.form.message = '';
    },

    // Message actions
    scheduleMessage: (
      state,
      action: PayloadAction<{ phoneNumber: string; message: string; scheduledAt?: string }>
    ) => {
      const { phoneNumber, message, scheduledAt } = action.payload;
      const newMessage = createScheduledMessage(
        phoneNumber,
        message,
        scheduledAt || new Date().toISOString()
      );
      state.messages.push(newMessage);
      // Clear form after scheduling
      state.form.phoneNumber = '';
      state.form.message = '';
    },

    removeMessage: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter((m) => m.id !== action.payload);
    },

    updateMessageStatus: (
      state,
      action: PayloadAction<{ id: string; status: MessageStatus; error?: string }>
    ) => {
      const message = state.messages.find((m) => m.id === action.payload.id);
      if (message) {
        message.status = action.payload.status;
        message.updatedAt = new Date().toISOString();
        if (action.payload.error) {
          message.error = action.payload.error;
        }
      }
    },

    // Queue configuration
    setMessagesPerHour: (state, action: PayloadAction<number>) => {
      state.queueConfig.messagesPerHour = Math.max(1, action.payload);
    },

    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.queueConfig.isProcessing = action.payload;
      if (action.payload) {
        state.queueConfig.lastProcessedAt = new Date().toISOString();
      }
    },

    // Process next message in queue (FIFO)
    processNextMessage: (state) => {
      const queuedMessages = state.messages.filter((m) => m.status === 'QUEUED');
      if (queuedMessages.length > 0) {
        // Sort by scheduledAt to get FIFO order
        queuedMessages.sort(
          (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
        );
        const nextMessage = queuedMessages[0];
        const message = state.messages.find((m) => m.id === nextMessage.id);
        if (message) {
          message.status = 'ACCEPTED';
          message.updatedAt = new Date().toISOString();
        }
        state.queueConfig.lastProcessedAt = new Date().toISOString();
      }
    },

    // Clear all messages
    clearAllMessages: (state) => {
      state.messages = [];
    },
  },
});

export const {
  syncMessages,
  setPhoneNumber,
  setMessage,
  clearForm,
  scheduleMessage,
  removeMessage,
  updateMessageStatus,
  setMessagesPerHour,
  setProcessing,
  processNextMessage,
  clearAllMessages,
} = schedulerSlice.actions;

// Selectors
export const selectMessages = (state: RootState) => state.scheduler.messages;
export const selectQueuedMessages = (state: RootState) =>
  state.scheduler.messages.filter((m) => m.status === 'QUEUED');
export const selectSentMessages = (state: RootState) =>
  state.scheduler.messages.filter((m) => ['SENT', 'DELIVERED', 'RECEIVED'].includes(m.status));
export const selectFailedMessages = (state: RootState) =>
  state.scheduler.messages.filter((m) => m.status === 'FAILED');
export const selectQueueConfig = (state: RootState) => state.scheduler.queueConfig;
export const selectForm = (state: RootState) => state.scheduler.form;

export default schedulerSlice.reducer;

