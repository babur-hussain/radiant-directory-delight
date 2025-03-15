
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

export interface GlobalSubscriptionSettings {
  advancePaymentMonths: number;
  signupFee: number;
  isPausable: boolean;
  isUserCancellable: boolean;
  lastUpdated: string;
  updatedBy?: string;
}

const DEFAULT_SETTINGS: GlobalSubscriptionSettings = {
  advancePaymentMonths: 6,
  signupFee: 0,
  isPausable: true,
  isUserCancellable: false,
  lastUpdated: new Date().toISOString()
};

/**
 * Get the global subscription settings
 */
export const getGlobalSubscriptionSettings = async (): Promise<GlobalSubscriptionSettings> => {
  try {
    const settingsRef = doc(db, "system", "subscription_settings");
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      return settingsDoc.data() as GlobalSubscriptionSettings;
    } else {
      // If settings don't exist, initialize with defaults
      await setDoc(settingsRef, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
  } catch (error) {
    console.error("Error fetching global subscription settings:", error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Update the global subscription settings
 */
export const updateGlobalSubscriptionSettings = async (
  settings: Partial<GlobalSubscriptionSettings>,
  adminId: string
): Promise<boolean> => {
  try {
    const settingsRef = doc(db, "system", "subscription_settings");
    
    // Get current settings
    const currentSettings = await getGlobalSubscriptionSettings();
    
    // Update with new values
    const updatedSettings = {
      ...currentSettings,
      ...settings,
      lastUpdated: new Date().toISOString(),
      updatedBy: adminId
    };
    
    await updateDoc(settingsRef, updatedSettings);
    return true;
  } catch (error) {
    console.error("Error updating global subscription settings:", error);
    return false;
  }
};

/**
 * Apply global settings to a new subscription
 */
export const applyGlobalSettingsToSubscription = async (subscriptionData: any): Promise<any> => {
  try {
    const globalSettings = await getGlobalSubscriptionSettings();
    
    return {
      ...subscriptionData,
      advancePaymentMonths: globalSettings.advancePaymentMonths,
      signupFee: globalSettings.signupFee,
      isPausable: globalSettings.isPausable,
      isUserCancellable: globalSettings.isUserCancellable
    };
  } catch (error) {
    console.error("Error applying global settings to subscription:", error);
    return subscriptionData;
  }
};
