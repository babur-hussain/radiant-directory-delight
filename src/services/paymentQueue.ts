// Payment Queue System to prevent rate limiting
class PaymentQueue {
  private static instance: PaymentQueue;
  private queue: Array<{
    id: string;
    paymentData: any;
    resolve: (value: any) => void;
    reject: (error: any) => void;
    timestamp: number;
  }> = [];
  private isProcessing = false;
  private lastPaymentTime = 0;
  private readonly MIN_INTERVAL = 5000; // 5 seconds between payments

  static getInstance(): PaymentQueue {
    if (!PaymentQueue.instance) {
      PaymentQueue.instance = new PaymentQueue();
    }
    return PaymentQueue.instance;
  }

  async addToQueue(paymentData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.queue.push({
        id,
        paymentData,
        resolve,
        reject,
        timestamp: Date.now()
      });

      console.log(`Payment ${id} added to queue. Queue length: ${this.queue.length}`);
      
      // Start processing if not already processing
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log('Starting payment queue processing...');

    while (this.queue.length > 0) {
      const payment = this.queue.shift();
      if (!payment) continue;

      try {
        // Check if enough time has passed since last payment
        const now = Date.now();
        const timeSinceLastPayment = now - this.lastPaymentTime;
        
        if (timeSinceLastPayment < this.MIN_INTERVAL) {
          const waitTime = this.MIN_INTERVAL - timeSinceLastPayment;
          console.log(`Waiting ${waitTime}ms before processing next payment...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        console.log(`Processing payment ${payment.id}...`);
        
        // Process the payment
        const result = await this.processPayment(payment.paymentData);
        payment.resolve(result);
        
        this.lastPaymentTime = Date.now();
        console.log(`Payment ${payment.id} processed successfully`);
        
      } catch (error) {
        console.error(`Payment ${payment.id} failed:`, error);
        payment.reject(error);
      }
    }

    this.isProcessing = false;
    console.log('Payment queue processing completed');
  }

  private async processPayment(paymentData: any): Promise<any> {
    // Import the PayU API function
    const { initiatePayUPayment } = await import('@/api/services/payuAPI');
    
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const result = await initiatePayUPayment(paymentData);
        return result;
      } catch (error) {
        attempts++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (errorMessage.toLowerCase().includes('too many requests') || 
            errorMessage.toLowerCase().includes('rate limit') ||
            errorMessage.toLowerCase().includes('rate exceeded')) {
          
          if (attempts >= maxAttempts) {
            throw new Error('Payment service is currently busy. Please try again in a few minutes.');
          }
          
          // Wait before retrying (exponential backoff)
          const waitTime = Math.min(1000 * Math.pow(2, attempts - 1), 10000);
          console.log(`Rate limited. Waiting ${waitTime}ms before retry ${attempts}/${maxAttempts}...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        } else {
          throw error;
        }
      }
    }
  }

  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      lastPaymentTime: this.lastPaymentTime
    };
  }

  clearQueue() {
    this.queue = [];
    console.log('Payment queue cleared');
  }
}

export const paymentQueue = PaymentQueue.getInstance();
