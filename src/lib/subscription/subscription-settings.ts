
/**
 * Global subscription settings to control behavior of subscription features
 */
export interface SubscriptionSettings {
  shouldUseLocalFallback: boolean;
  allowNonAdminSubscriptions: boolean;
  requiresPayment: boolean;
  defaultGracePeriodDays: number;
  defaultAdvancePaymentMonths: number;
}

/**
 * Default settings to use when MongoDB connection fails
 */
const DEFAULT_SETTINGS: SubscriptionSettings = {
  shouldUseLocalFallback: true,
  allowNonAdminSubscriptions: true,
  requiresPayment: false,
  defaultGracePeriodDays: 7,
  defaultAdvancePaymentMonths: 1
};

/**
 * Retrieves global subscription settings from MongoDB
 */
export async function getGlobalSubscriptionSettings(): Promise<SubscriptionSettings> {
  try {
    // Try to get settings from MongoDB
    const response = await fetch('http://localhost:3001/api/subscription-settings');
    
    if (response.ok) {
      const settings = await response.json();
      console.log("✅ Retrieved subscription settings from MongoDB");
      return { 
        ...DEFAULT_SETTINGS, 
        ...settings 
      };
    }
    
    console.log("⚠️ No subscription settings found in MongoDB, using defaults");
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error("❌ Error fetching subscription settings:", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Updates global subscription settings in MongoDB
 */
export async function updateSubscriptionSettings(
  settings: Partial<SubscriptionSettings>
): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3001/api/subscription-settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    
    if (response.ok) {
      console.log("✅ Updated subscription settings");
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("❌ Error updating subscription settings:", error);
    return false;
  }
}
