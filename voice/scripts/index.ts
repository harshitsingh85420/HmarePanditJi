/**
 * Voice Scripts Index
 * Hmare Pandit Ji - Part 0.0 Voice Scripts
 * 
 * This file exports all voice scripts for easy import.
 * Total: 405 scripts across 9 screens and 15 languages
 */

export { S0_0_2_LOCATION_PERMISSION } from './01_S-0.0.2_Location_Permission';
export { S0_0_2B_MANUAL_CITY } from './02_S-0.0.2B_Manual_City';
export { S0_0_3_CITY_SELECTION } from './03_S-0.0.3_City_Selection';
export { S0_0_4_LANGUAGE_SELECTION } from './04_S-0.0.4_Language_Selection';
export { S0_0_5_PERMISSION_EXPLANATION } from './05_S-0.0.5_Permission_Explanation';
export { S0_0_6_CELEBRATION } from './06_S-0.0.6_Celebration';
export { S0_0_7_LOADING } from './07_S-0.0.7_Loading';
export { S0_0_8_ERROR_RETRY } from './08_S-0.0.8_Error_Retry';

// All scripts combined in a single array
export const ALL_VOICE_SCRIPTS = [
  ...S0_0_2_LOCATION_PERMISSION,
  ...S0_0_2B_MANUAL_CITY,
  ...S0_0_3_CITY_SELECTION,
  ...S0_0_4_LANGUAGE_SELECTION,
  ...S0_0_5_PERMISSION_EXPLANATION,
  ...S0_0_6_CELEBRATION,
  ...S0_0_7_LOADING,
  ...S0_0_8_ERROR_RETRY,
];

// Script count by screen
export const SCRIPT_COUNTS = {
  S_0_0_2: S0_0_2_LOCATION_PERMISSION.length,      // 75 scripts
  S_0_0_2B: S0_0_2B_MANUAL_CITY.length,            // 30 scripts
  S_0_0_3: S0_0_3_CITY_SELECTION.length,           // 60 scripts
  S_0_0_4: S0_0_4_LANGUAGE_SELECTION.length,       // 60 scripts
  S_0_0_5: S0_0_5_PERMISSION_EXPLANATION.length,   // 60 scripts
  S_0_0_6: S0_0_6_CELEBRATION.length,              // 75 scripts
  S_0_0_7: S0_0_7_LOADING.length,                  // 15 scripts
  S_0_0_8: S0_0_8_ERROR_RETRY.length,              // 45 scripts
  TOTAL: ALL_VOICE_SCRIPTS.length,                 // 405 scripts
};

// Languages covered
export const SUPPORTED_LANGUAGES = [
  { code: 'hi-IN', name: 'Hindi', priority: 1 },
  { code: 'ta-IN', name: 'Tamil', priority: 2 },
  { code: 'te-IN', name: 'Telugu', priority: 3 },
  { code: 'bn-IN', name: 'Bengali', priority: 4 },
  { code: 'mr-IN', name: 'Marathi', priority: 5 },
  { code: 'gu-IN', name: 'Gujarati', priority: 6 },
  { code: 'kn-IN', name: 'Kannada', priority: 7 },
  { code: 'ml-IN', name: 'Malayalam', priority: 8 },
  { code: 'pa-IN', name: 'Punjabi', priority: 9 },
  { code: 'or-IN', name: 'Odia', priority: 10 },
  { code: 'en-IN', name: 'English', priority: 11 },
  { code: 'hi-IN', name: 'Bhojpuri', priority: 12, fallback: true },
  { code: 'hi-IN', name: 'Maithili', priority: 13, fallback: true },
  { code: 'hi-IN', name: 'Sanskrit', priority: 14, fallback: true },
  { code: 'hi-IN', name: 'Assamese', priority: 15, fallback: true },
];

// Screen metadata
export const SCREEN_METADATA = {
  'S-0.0.2': {
    name: 'Location Permission',
    description: 'Request location permission from user',
    scriptCount: 75,
    languages: 5,
    variants: 3,
  },
  'S-0.0.2B': {
    name: 'Manual City Entry',
    description: 'User manually types city name',
    scriptCount: 30,
    languages: 15,
    variants: 2,
  },
  'S-0.0.3': {
    name: 'City Selection',
    description: 'User selects city from list',
    scriptCount: 60,
    languages: 15,
    variants: 4,
  },
  'S-0.0.4': {
    name: 'Language Selection',
    description: 'User selects preferred language',
    scriptCount: 60,
    languages: 15,
    variants: 4,
  },
  'S-0.0.5': {
    name: 'Permission Explanation',
    description: 'Explain why location permission is needed',
    scriptCount: 60,
    languages: 15,
    variants: 4,
  },
  'S-0.0.6': {
    name: 'Celebration',
    description: 'Celebrate successful setup completion',
    scriptCount: 75,
    languages: 15,
    variants: 5,
  },
  'S-0.0.7': {
    name: 'Loading',
    description: 'Show loading/processing state',
    scriptCount: 15,
    languages: 15,
    variants: 1,
  },
  'S-0.0.8': {
    name: 'Error/Retry',
    description: 'Show error message and retry option',
    scriptCount: 45,
    languages: 15,
    variants: 3,
  },
};

export default ALL_VOICE_SCRIPTS;
