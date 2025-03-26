
import { Business } from './types';

// In-memory store for businesses data
let businessesData: Business[] = [];
let initialized = false;

// Event management
const dataChangeListeners: Array<() => void> = [];

export const addDataChangeListener = (listener: () => void) => {
  dataChangeListeners.push(listener);
};

export const removeDataChangeListener = (listener: () => void) => {
  const index = dataChangeListeners.indexOf(listener);
  if (index !== -1) {
    dataChangeListeners.splice(index, 1);
  }
};

export const notifyDataChanged = () => {
  dataChangeListeners.forEach(listener => listener());
};

// Store operations
export const getBusinessesData = (): Business[] => {
  return businessesData;
};

export const setBusinessesData = (data: Business[]): void => {
  businessesData = data;
};

export const getInitialized = (): boolean => {
  return initialized;
};

export const setInitialized = (value: boolean): void => {
  initialized = value;
};

// Get all businesses
export const getAllBusinesses = (): Business[] => {
  return [...businessesData];
};
