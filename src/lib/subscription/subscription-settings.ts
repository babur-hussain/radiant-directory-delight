
import { collection, doc, getDoc, getDocs, setDoc, query, where } from "firebase/firestore";
import { db } from "@/config/firebase";

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
 * Default settings to use when Firebase connection fails
 */
const DEFAULT_SETTINGS: SubscriptionSettings = {
  shouldUseLocalFallback: true,
  allowNonAdminSubscriptions: true, // Changed to TRUE to allow non-admin subscriptions by default
  requiresPayment: false,
  defaultGracePeriodDays: 7,
  defaultAdvancePaymentMonths: 1
};

/**
 * Retrieves global subscription settings from Firestore
 */
export async function getGlobalSubscriptionSettings(): Promise<SubscriptionSettings> {
  try {
    // Try to get settings from Firestore
    const settingsRef = doc(db, "system", "subscription_settings");
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      console.log("✅ Retrieved subscription settings from Firestore");
      return { 
        ...DEFAULT_SETTINGS, 
        ...settingsDoc.data() as SubscriptionSettings 
      };
    }
    
    console.log("⚠️ No subscription settings found in Firestore, using defaults");
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error("❌ Error fetching subscription settings:", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Updates global subscription settings
 */
export async function updateSubscriptionSettings(
  settings: Partial<SubscriptionSettings>
): Promise<boolean> {
  try {
    const settingsRef = doc(db, "system", "subscription_settings");
    await setDoc(settingsRef, settings, { merge: true });
    console.log("✅ Updated subscription settings");
    return true;
  } catch (error) {
    console.error("❌ Error updating subscription settings:", error);
    return false;
  }
}
