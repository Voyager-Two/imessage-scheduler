'use client';

import { Iconify } from '@app/common/UI/iconify';
import { schedulerApi } from '@app/lib/api';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MessageCard } from './components/MessageCard';
import { SettingsModal } from './components/SettingsModal';
import styles from './css/Scheduler.module.css';
import {
  clearForm,
  selectForm,
  selectMessages,
  setMessage,
  setMessagesPerHour,
  setPhoneNumber,
  syncMessages,
} from './schedulerSlice';

type TabType = 'all' | 'queued' | 'sent' | 'failed';

export default function Scheduler() {
  const dispatch = useDispatch();
  const form = useSelector(selectForm);
  const messages = useSelector(selectMessages);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processMessage, setProcessMessage] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  // Fetch messages and config on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [messagesRes, configRes] = await Promise.all([
          schedulerApi.getMessages(),
          schedulerApi.getConfig(),
        ]);

        if (messagesRes.messages) {
          dispatch(syncMessages(messagesRes.messages));
        }

        if (configRes.config) {
          dispatch(setMessagesPerHour(configRes.config.messagesPerHour));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleSchedule = async () => {
    if (!form.phoneNumber.trim() || !form.message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await schedulerApi.createMessage(
        form.phoneNumber,
        form.message,
        new Date().toISOString()
      );

      if (response.message) {
        dispatch(syncMessages([...messages, response.message]));
        dispatch(clearForm());
      }
    } catch (error) {
      console.error('Error scheduling message:', error);
      alert('Failed to schedule message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessQueue = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setProcessMessage(null);

    try {
      const response = await schedulerApi.processQueue();

      if (response.processed > 0) {
        setProcessMessage(`✅ ${response.message || 'Message processed successfully'}`);
        // Refresh messages after processing
        setTimeout(async () => {
          const messagesRes = await schedulerApi.getMessages();
          if (messagesRes.messages) {
            dispatch(syncMessages(messagesRes.messages));
          }
        }, 500);
      } else if (response.nextProcessAt) {
        const waitTime = Math.ceil(
          (new Date(response.nextProcessAt).getTime() - Date.now()) / 60000
        );
        setProcessMessage(`⏳ ${response.message || `Wait ${waitTime} minutes`}`);
      } else {
        setProcessMessage(`ℹ️ ${response.message || 'No messages to process'}`);
      }
    } catch (error) {
      console.error('Error processing queue:', error);
      setProcessMessage('❌ Failed to process queue. Check gateway is running.');
    } finally {
      setIsProcessing(false);
      // Clear message after 5 seconds
      setTimeout(() => setProcessMessage(null), 5000);
    }
  };

  const handleClearQueue = async () => {
    const queuedCount = messages.filter((m) => m.status === 'QUEUED').length;

    if (queuedCount === 0) {
      alert('No queued messages to clear');
      return;
    }

    if (!confirm(`Cancel ${queuedCount} queued message${queuedCount > 1 ? 's' : ''}?`)) {
      return;
    }

    setIsClearing(true);
    try {
      const queuedIds = messages.filter((m) => m.status === 'QUEUED').map((m) => m.id);

      // Mark all queued messages as CANCELLED
      await Promise.all(
        queuedIds.map((id) => schedulerApi.updateMessageStatus(id, 'CANCELLED'))
      );

      // Refresh messages
      const messagesRes = await schedulerApi.getMessages();
      if (messagesRes.messages) {
        dispatch(syncMessages(messagesRes.messages));
      }

      setProcessMessage(`✅ Cancelled ${queuedCount} message${queuedCount > 1 ? 's' : ''}`);
      setTimeout(() => setProcessMessage(null), 5000);
    } catch (error) {
      console.error('Error clearing queue:', error);
      alert('Failed to clear queue. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const isFormValid = form.phoneNumber.trim() && form.message.trim();

  // Calculate counts for tabs
  const queuedCount = messages.filter((m) => m.status === 'QUEUED' || m.status === 'ACCEPTED')
    .length;
  const sentCount = messages.filter((m) => ['SENT', 'DELIVERED', 'RECEIVED'].includes(m.status))
    .length;
  const failedCount = messages.filter(
    (m) => m.status === 'FAILED' || m.status === 'CANCELLED'
  ).length;

  // Filter messages based on active tab
  const filteredMessages = messages.filter((m) => {
    switch (activeTab) {
      case 'queued':
        return m.status === 'QUEUED' || m.status === 'ACCEPTED';
      case 'sent':
        return ['SENT', 'DELIVERED', 'RECEIVED'].includes(m.status);
      case 'failed':
        return m.status === 'FAILED' || m.status === 'CANCELLED';
      default:
        return true;
    }
  });

  // Sort messages by scheduledAt (newest first for display)
  const sortedMessages = [...filteredMessages].sort(
    (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
  );

  // Get queue positions for QUEUED messages (FIFO - oldest first)
  const queuedMessages = messages
    .filter((m) => m.status === 'QUEUED')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const getQueuePosition = (messageId: string): number | null => {
    const index = queuedMessages.findIndex((m) => m.id === messageId);
    return index >= 0 ? index + 1 : null;
  };

  return (
    <>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      <div className={styles.container}>
        <div className={styles.content}>
          {/* Header */}
          <header className={styles.header}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <Iconify icon="solar:chat-round-call-bold" width={24} />
              </div>
              <span className={styles.logoText}>Scheduler</span>
            </div>

            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.processButton}
                onClick={handleProcessQueue}
                disabled={isProcessing || queuedCount === 0}
                title={queuedCount === 0 ? 'No messages in queue' : 'Process next message'}
              >
                <Iconify
                  icon={isProcessing ? 'solar:refresh-linear' : 'solar:play-bold'}
                  width={18}
                />
                {isProcessing ? 'Processing...' : 'Process queue'}
              </button>
              <button
                type="button"
                className={styles.clearQueueButton}
                onClick={handleClearQueue}
                disabled={isClearing || queuedCount === 0}
                title="Cancel all queued messages"
              >
                <Iconify icon="solar:close-circle-linear" width={18} />
                {isClearing ? 'Cancelling...' : 'Cancel queue'}
              </button>
              <button
                type="button"
                className={styles.settingsButton}
                onClick={() => setShowSettings(true)}
              >
                <Iconify icon="solar:settings-linear" width={18} />
                Settings
              </button>
            </div>
          </header>

          {/* Process Message Feedback */}
          {processMessage && (
            <div className={styles.processMessageAlert}>{processMessage}</div>
          )}

          {/* Form Card */}
          <div className={styles.formCard}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Phone Number</label>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => dispatch(setPhoneNumber(e.target.value))}
                placeholder="+1 (555) 000-0000"
                className={styles.textInput}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Message</label>
              <textarea
                value={form.message}
                onChange={(e) => dispatch(setMessage(e.target.value))}
                placeholder="Enter your message here..."
                className={`${styles.textInput} ${styles.textArea}`}
              />
            </div>

            <button
              type="button"
              className={styles.scheduleButton}
              onClick={handleSchedule}
              disabled={!isFormValid || isSubmitting}
            >
              <Iconify icon="solar:plain-bold" width={20} />
              {isSubmitting ? 'Scheduling...' : 'Schedule Message'}
            </button>
          </div>

          {/* Messages Section */}
          <div className={styles.messagesSection}>
            {/* Tabs with Counts */}
            <div className={styles.tabs}>
              <button
                type="button"
                className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All
                <span className={styles.tabCount}>{messages.length}</span>
              </button>
              <button
                type="button"
                className={`${styles.tab} ${activeTab === 'queued' ? styles.active : ''}`}
                onClick={() => setActiveTab('queued')}
              >
                Queued
                <span className={`${styles.tabCount} ${styles.queuedBadge}`}>{queuedCount}</span>
              </button>
              <button
                type="button"
                className={`${styles.tab} ${activeTab === 'sent' ? styles.active : ''}`}
                onClick={() => setActiveTab('sent')}
              >
                Sent
                <span className={`${styles.tabCount} ${styles.sentBadge}`}>{sentCount}</span>
              </button>
              <button
                type="button"
                className={`${styles.tab} ${activeTab === 'failed' ? styles.active : ''}`}
                onClick={() => setActiveTab('failed')}
              >
                Failed
                <span className={`${styles.tabCount} ${styles.failedBadge}`}>{failedCount}</span>
              </button>
            </div>

            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <span className={styles.sectionDot} />
                Scheduled Messages
              </div>
              <span className={styles.messageCount}>({sortedMessages.length})</span>
            </div>

            {sortedMessages.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <Iconify icon="solar:inbox-line-linear" width={32} />
                </div>
                <h3 className={styles.emptyTitle}>No messages yet</h3>
                <p className={styles.emptyText}>
                  Schedule your first message using the form above
                </p>
              </div>
            ) : (
              <div className={styles.messagesList}>
                {sortedMessages.map((message) => (
                  <MessageCard
                    key={message.id}
                    message={message}
                    queuePosition={getQueuePosition(message.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

