
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/auth';

type PopupAdContextType = {
  showSubscriptionPopup: boolean;
  setShowSubscriptionPopup: (show: boolean) => void;
  triggerSubscriptionPopup: () => void;
};

const PopupAdContext = createContext<PopupAdContextType | undefined>(undefined);

export const PopupAdProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Check if the popup has been shown before
  useEffect(() => {
    const hasBeenShown = localStorage.getItem('subscription_popup_shown') === 'true';
    // Don't auto-show the popup on initial load, let it be triggered by events
    if (!hasBeenShown) {
      // We don't show it automatically, will be triggered by profile setup
      localStorage.setItem('subscription_popup_shown', 'false');
    }
  }, []);
  
  const triggerSubscriptionPopup = () => {
    const hasBeenShown = localStorage.getItem('subscription_popup_shown') === 'true';
    if (!hasBeenShown) {
      setShowSubscriptionPopup(true);
    }
  };
  
  // Method to update user state
  const updateUserState = (user: User | null) => {
    setCurrentUser(user);
  };
  
  return (
    <PopupAdContext.Provider value={{
      showSubscriptionPopup,
      setShowSubscriptionPopup,
      triggerSubscriptionPopup,
    }}>
      {children}
    </PopupAdContext.Provider>
  );
};

export const usePopupAd = () => {
  const context = useContext(PopupAdContext);
  if (context === undefined) {
    throw new Error('usePopupAd must be used within a PopupAdProvider');
  }
  return context;
};
