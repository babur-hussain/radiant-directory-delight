import { checkRecurringPayments } from './subscriptionService';

class AutopayService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  // Start the autopay service
  start() {
    if (this.isRunning) {
      console.log('Autopay service is already running');
      return;
    }

    console.log('Starting autopay service...');
    this.isRunning = true;

    // Check for recurring payments every hour
    this.intervalId = setInterval(async () => {
      try {
        console.log('Checking for recurring payments...');
        await checkRecurringPayments();
      } catch (error) {
        console.error('Error in autopay service:', error);
      }
    }, 60 * 60 * 1000); // Check every hour

    // Also check immediately on startup
    this.checkImmediately();
  }

  // Stop the autopay service
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Autopay service stopped');
  }

  // Check for recurring payments immediately
  async checkImmediately() {
    try {
      console.log('Performing immediate recurring payment check...');
      await checkRecurringPayments();
    } catch (error) {
      console.error('Error in immediate recurring payment check:', error);
    }
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      hasInterval: this.intervalId !== null
    };
  }
}

// Create singleton instance
const autopayService = new AutopayService();

// Export the service
export default autopayService;

// Auto-start the service when this module is imported
if (typeof window !== 'undefined') {
  // Only start in browser environment
  console.log('Initializing autopay service...');
  autopayService.start();
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    autopayService.stop();
  });
} 