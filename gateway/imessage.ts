import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface SendResult {
  success: boolean;
  error?: string;
}

/**
 * Send an iMessage using AppleScript
 * This requires macOS with Messages.app signed in to an Apple ID
 */
export async function sendIMessage(phoneNumber: string, message: string): Promise<SendResult> {
  // Clean phone number - remove formatting
  const cleanNumber = phoneNumber.replace(/\D/g, '');

  // AppleScript to send iMessage
  const script = `
    tell application "Messages"
      set targetService to 1st account whose service type = iMessage
      set targetBuddy to participant "${cleanNumber}" of targetService
      send "${message.replace(/"/g, '\\"')}" to targetBuddy
    end tell
  `;

  try {
    await execAsync(`osascript -e '${script.replace(/'/g, "'\\''")}'`);
    return { success: true };
  } catch (error) {
    console.error('Error sending iMessage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if Messages.app is running and accessible
 */
export async function checkMessagesApp(): Promise<boolean> {
  const script = `
    tell application "System Events"
      return exists process "Messages"
    end tell
  `;

  try {
    const { stdout } = await execAsync(`osascript -e '${script}'`);
    return stdout.trim() === 'true';
  } catch (error) {
    return false;
  }
}

/**
 * Get the list of available iMessage accounts
 */
export async function getIMessageAccounts(): Promise<string[]> {
  const script = `
    tell application "Messages"
      set accountList to {}
      repeat with acc in accounts
        if service type of acc is iMessage then
          set end of accountList to id of acc
        end if
      end repeat
      return accountList
    end tell
  `;

  try {
    const { stdout } = await execAsync(`osascript -e '${script}'`);
    const accounts = stdout
      .trim()
      .split(', ')
      .filter((a) => a.length > 0);
    return accounts;
  } catch (error) {
    console.error('Error getting iMessage accounts:', error);
    return [];
  }
}
