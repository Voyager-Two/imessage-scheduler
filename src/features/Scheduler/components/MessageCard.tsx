'use client';

import { Iconify } from '@app/common/UI/iconify';
import { schedulerApi } from '@app/lib/api';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import styles from '../css/Scheduler.module.css';
import { selectMessages, syncMessages } from '../schedulerSlice';
import { formatPhoneNumber, ScheduledMessage, statusColors } from '../types';

interface MessageCardProps {
  message: ScheduledMessage;
  queuePosition?: number | null;
}

export function MessageCard({ message, queuePosition }: MessageCardProps) {
  const dispatch = useDispatch();
  const messages = useSelector(selectMessages);
  const statusInfo = statusColors[message.status];

  const handleDelete = async () => {
    try {
      await schedulerApi.deleteMessage(message.id);
      // Update local state
      const updatedMessages = messages.filter((m) => m.id !== message.id);
      dispatch(syncMessages(updatedMessages));
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message. Please try again.');
    }
  };

  return (
    <div className={styles.messageCard}>
      <div className={styles.messageHeader}>
        <div className={styles.phoneInfo}>
          <div className={styles.phoneIcon}>
            <Iconify icon="solar:phone-bold" width={18} />
          </div>
          <span className={styles.phoneNumber}>{formatPhoneNumber(message.phoneNumber)}</span>
        </div>
        <div className={styles.messageActions}>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.danger}`}
            onClick={handleDelete}
            title="Delete message"
          >
            <Iconify icon="solar:trash-bin-trash-linear" width={16} />
          </button>
        </div>
      </div>

      <div className={styles.messageContent}>{message.message}</div>

      <div className={styles.messageFooter}>
        <div className={styles.messageTimeInfo}>
          <div className={styles.messageTime}>
            <Iconify icon="solar:calendar-add-linear" width={14} />
            <span className={styles.timeLabel}>Created:</span>
            <span>{dayjs(message.createdAt).format('MMM D, h:mm A')}</span>
          </div>
          {message.status !== 'QUEUED' && message.status !== 'ACCEPTED' && (
            <div className={styles.messageTime}>
              <Iconify icon="solar:clock-circle-linear" width={14} />
              <span className={styles.timeLabel}>
                {message.status === 'SENT' || message.status === 'DELIVERED' || message.status === 'RECEIVED'
                  ? 'Sent:'
                  : message.status === 'CANCELLED'
                  ? 'Cancelled:'
                  : 'Updated:'}
              </span>
              <span>{dayjs(message.updatedAt).format('MMM D, h:mm A')}</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {queuePosition && (
            <span className={styles.queuePosition}>#{queuePosition} in queue</span>
          )}
          <span
            className={styles.statusBadge}
            style={{ background: statusInfo.bg, color: statusInfo.text }}
          >
            {statusInfo.label}
          </span>
        </div>
      </div>
    </div>
  );
}

