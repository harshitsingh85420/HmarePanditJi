/**
 * Voice Scripts Index - Part 0 (S-0.1 to S-0.12)
 * HmarePanditJi - Main Tutorial Flow
 * 
 * Total: 900 scripts across 12 screens and 15 languages
 * Each screen has 5 lines × 15 languages = 75 scripts
 */

export { S0_1_SWAGAT } from './09_S-0.1_Swagat';
export { S0_2_INCOME_HOOK } from './10_S-0.2_Income_Hook';
export { S0_3_FIXED_DAKSHINA } from './11_S-0.3_Fixed_Dakshina';
export { S0_4_ONLINE_REVENUE } from './12_S-0.4_Online_Revenue';
export { S0_5_BACKUP_PANDIT } from './13_S-0.5_Backup_Pandit';
export { S0_6_INSTANT_PAYMENT } from './14_S-0.6_Instant_Payment';
export { S0_7_VOICE_NAV_DEMO } from './15_S-0.7_Voice_Nav_Demo';
export { S0_8_DUAL_MODE } from './16_S-0.8_Dual_Mode';
export { S0_9_TRAVEL_CALENDAR } from './17_S-0.9_Travel_Calendar';
export { S0_10_VIDEO_VERIFICATION } from './18_S-0.10_Video_Verification';
export { S0_11_4_GUARANTEES } from './19_S-0.11_4_Guarantees';
export { S0_12_FINAL_CTA } from './20_S-0.12_Final_CTA';

// All Part 0 scripts combined
export const ALL_PART0_VOICE_SCRIPTS = [
  S0_1_SWAGAT,
  S0_2_INCOME_HOOK,
  S0_3_FIXED_DAKSHINA,
  S0_4_ONLINE_REVENUE,
  S0_5_BACKUP_PANDIT,
  S0_6_INSTANT_PAYMENT,
  S0_7_VOICE_NAV_DEMO,
  S0_8_DUAL_MODE,
  S0_9_TRAVEL_CALENDAR,
  S0_10_VIDEO_VERIFICATION,
  S0_11_4_GUARANTEES,
  S0_12_FINAL_CTA,
];

// Script count by screen
export const PART0_SCRIPT_COUNTS = {
  S_0_1: 75,  // 15 langs × 5 lines
  S_0_2: 75,
  S_0_3: 75,
  S_0_4: 75,
  S_0_5: 75,
  S_0_6: 75,
  S_0_7: 75,
  S_0_8: 75,
  S_0_9: 75,
  S_0_10: 75,
  S_0_11: 75,
  S_0_12: 75,
  TOTAL: 900,  // 12 screens × 75 scripts
};

// Screen metadata
export const PART0_SCREEN_METADATA = {
  'S-0.1': { name: 'Swagat Welcome', description: 'Welcome Pandit Ji to platform', scripts: 75 },
  'S-0.2': { name: 'Income Hook', description: 'Show potential income', scripts: 75 },
  'S-0.3': { name: 'Fixed Dakshina', description: 'Explain fixed pricing', scripts: 75 },
  'S-0.4': { name: 'Online Revenue', description: 'Explain online payments', scripts: 75 },
  'S-0.5': { name: 'Backup Pandit', description: 'Explain backup feature', scripts: 75 },
  'S-0.6': { name: 'Instant Payment', description: 'Explain instant payments', scripts: 75 },
  'S-0.7': { name: 'Voice Nav Demo', description: 'Demonstrate voice navigation', scripts: 75 },
  'S-0.8': { name: 'Dual Mode', description: 'Explain voice + touch modes', scripts: 75 },
  'S-0.9': { name: 'Travel Calendar', description: 'Explain calendar feature', scripts: 75 },
  'S-0.10': { name: 'Video Verification', description: 'Explain verification process', scripts: 75 },
  'S-0.11': { name: '4 Guarantees', description: 'Explain platform guarantees', scripts: 75 },
  'S-0.12': { name: 'Final CTA', description: 'Final registration CTA', scripts: 75 },
};

export default ALL_PART0_VOICE_SCRIPTS;
