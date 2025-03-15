
// This file is kept for backward compatibility
// It re-exports all subscription utilities from the modular structure
export * from './subscription';

// Utility function for handling features string/array conversion
export function featuresToString(features: string[] | undefined): string {
  return features ? features.join('\n') : '';
}

export function stringToFeatures(featuresString: string): string[] {
  return featuresString.split('\n').filter(f => f.trim().length > 0);
}
