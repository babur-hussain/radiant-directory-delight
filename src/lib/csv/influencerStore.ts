
import { Influencer } from './influencerTypes';

// In-memory store for influencers data
let influencersData: Influencer[] = [];
let initialized = false;

// Event management
const dataChangeListeners: Array<() => void> = [];

export const addInfluencerDataChangeListener = (listener: () => void) => {
  dataChangeListeners.push(listener);
};

export const removeInfluencerDataChangeListener = (listener: () => void) => {
  const index = dataChangeListeners.indexOf(listener);
  if (index !== -1) {
    dataChangeListeners.splice(index, 1);
  }
};

export const notifyInfluencerDataChanged = () => {
  dataChangeListeners.forEach(listener => listener());
};

// Store operations
export const getInfluencersData = (): Influencer[] => {
  return influencersData;
};

export const setInfluencersData = (data: Influencer[]): void => {
  influencersData = data;
};

export const getInfluencerInitialized = (): boolean => {
  return initialized;
};

export const setInfluencerInitialized = (value: boolean): void => {
  initialized = value;
};

// Get all influencers
export const getAllInfluencers = (): Influencer[] => {
  return [...influencersData];
};
