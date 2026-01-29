'use client';

import { Iconify } from '@app/common/UI/iconify';
import { schedulerApi } from '@app/lib/api';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from '../css/Scheduler.module.css';
import { selectQueueConfig, setMessagesPerHour } from '../schedulerSlice';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const dispatch = useDispatch();
  const queueConfig = useSelector(selectQueueConfig);
  const [localMessagesPerHour, setLocalMessagesPerHour] = useState(queueConfig.messagesPerHour);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await schedulerApi.updateConfig({ messagesPerHour: localMessagesPerHour });
      dispatch(setMessagesPerHour(localMessagesPerHour));
      onClose();
    } catch (error) {
      console.error('Error updating config:', error);
      alert('Failed to update settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.settingsOverlay} onClick={handleOverlayClick}>
      <div className={styles.settingsModal}>
        <div className={styles.settingsHeader}>
          <h2 className={styles.settingsTitle}>Queue Settings</h2>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            <Iconify icon="solar:close-circle-linear" width={20} />
          </button>
        </div>

        <div className={styles.settingsGroup}>
          <label className={styles.settingsLabel}>Messages per Hour</label>
          <p className={styles.settingsDescription}>
            Configure how many messages are sent from the queue per hour. The queue processes
            messages in FIFO order.
          </p>
          <input
            type="number"
            min={1}
            max={60}
            value={localMessagesPerHour}
            onChange={(e) => setLocalMessagesPerHour(Math.max(1, parseInt(e.target.value) || 1))}
            className={styles.numberInput}
          />
        </div>

        <div className={styles.settingsActions}>
          <button
            type="button"
            className={styles.settingsCancelButton}
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.settingsSaveButton}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

