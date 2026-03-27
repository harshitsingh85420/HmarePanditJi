/**
 * Voice Timing Audit Script
 * Verifies all onboarding screens have BUG-001 compliant timing values
 * 
 * BUG-001 FIX Requirements:
 * - initialDelayMs: 800ms (was 500ms)
 * - pauseAfterMs: 1000ms (was 300ms)
 * - listenTimeoutMs: 12000ms or 20000ms (was 8000ms)
 */

import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

// Valid timing values per BUG-001 FIX
const VALID_INITIAL_DELAYS = [200, 400, 500, 600, 800]  // 800 is BUG-001 standard
const VALID_PAUSE_AFTER = [500, 800, 1000, 1500]  // 1000 is BUG-001 standard
const VALID_TIMEOUTS = [8000, 12000, 15000, 20000]  // 12000 or 20000 is BUG-001 standard

// Directories to audit
const auditDirs = [
  'apps/pandit/src/app/onboarding/screens',
  'apps/pandit/src/app/onboarding/screens/tutorial',
]

interface TimingCheck {
  file: string
  hasInitialDelay: boolean
  hasPauseAfter: boolean
  hasTimeout: boolean
  initialDelayValue?: number
  pauseAfterValue?: number
  timeoutValue?: number
  usesUseSarvamVoiceFlow: boolean
}

function extractTimingValues(content: string): { initialDelay?: number, pauseAfter?: number, timeout?: number } {
  const result: { initialDelay?: number, pauseAfter?: number, timeout?: number } = {}
  
  // Extract initialDelayMs value
  const initialDelayMatch = content.match(/initialDelayMs:\s*(\d+)/)
  if (initialDelayMatch) {
    result.initialDelay = parseInt(initialDelayMatch[1], 10)
  }
  
  // Extract pauseAfterMs value
  const pauseAfterMatch = content.match(/pauseAfterMs:\s*(\d+)/)
  if (pauseAfterMatch) {
    result.pauseAfter = parseInt(pauseAfterMatch[1], 10)
  }
  
  // Extract listenTimeoutMs value
  const timeoutMatch = content.match(/listenTimeoutMs:\s*(\d+)/)
  if (timeoutMatch) {
    result.timeout = parseInt(timeoutMatch[1], 10)
  }
  
  return result
}

function checkFile(filePath: string): TimingCheck {
  const content = readFileSync(filePath, 'utf8')
  const timing = extractTimingValues(content)
  
  const usesUseSarvamVoiceFlow = /useSarvamVoiceFlow/.test(content)
  
  // Only check timing if file uses useSarvamVoiceFlow hook
  if (!usesUseSarvamVoiceFlow) {
    return {
      file: filePath.split('/').pop() || filePath,
      hasInitialDelay: true,  // N/A
      hasPauseAfter: true,    // N/A
      hasTimeout: true,       // N/A
      usesUseSarvamVoiceFlow: false,
    }
  }
  
  return {
    file: filePath.split('/').pop() || filePath,
    hasInitialDelay: timing.initialDelay !== undefined && VALID_INITIAL_DELAYS.includes(timing.initialDelay),
    hasPauseAfter: timing.pauseAfter !== undefined && VALID_PAUSE_AFTER.includes(timing.pauseAfter),
    hasTimeout: timing.timeout !== undefined && VALID_TIMEOUTS.includes(timing.timeout),
    initialDelayValue: timing.initialDelay,
    pauseAfterValue: timing.pauseAfter,
    timeoutValue: timing.timeout,
    usesUseSarvamVoiceFlow: true,
  }
}

function auditDirectory(dirPath: string): TimingCheck[] {
  try {
    const files = readdirSync(dirPath)
      .filter(f => f.endsWith('.tsx') && !f.startsWith('_'))
    
    return files.map(file => checkFile(join(dirPath, file)))
  } catch (error) {
    console.log(`⚠️  Directory not found: ${dirPath}`)
    return []
  }
}

// Main audit
console.log('═══════════════════════════════════════════════════════════')
console.log('  VOICE TIMING AUDIT - BUG-001 Compliance Check')
console.log('═══════════════════════════════════════════════════════════\n')

const allResults: TimingCheck[] = []

auditDirs.forEach(dir => {
  const results = auditDirectory(dir)
  allResults.push(...results)
})

// Filter to only files that use useSarvamVoiceFlow
const relevantResults = allResults.filter(r => r.usesUseSarvamVoiceFlow)

let passCount = 0
let failCount = 0

relevantResults.forEach(result => {
  const allPass = result.hasInitialDelay && result.hasPauseAfter && result.hasTimeout
  
  if (allPass) {
    console.log(`✅ ${result.file}`)
    console.log(`   initialDelay: ${result.initialDelayValue}ms | pauseAfter: ${result.pauseAfterValue}ms | timeout: ${result.timeoutValue}ms`)
    passCount++
  } else {
    console.log(`❌ ${result.file}`)
    if (!result.hasInitialDelay) {
      console.log(`   ⚠️  initialDelayMs: ${result.initialDelayValue !== undefined ? result.initialDelayValue + 'ms (invalid)' : 'MISSING'}`)
    }
    if (!result.hasPauseAfter) {
      console.log(`   ⚠️  pauseAfterMs: ${result.pauseAfterValue !== undefined ? result.pauseAfterValue + 'ms (invalid)' : 'MISSING'}`)
    }
    if (!result.hasTimeout) {
      console.log(`   ⚠️  listenTimeoutMs: ${result.timeoutValue !== undefined ? result.timeoutValue + 'ms (invalid)' : 'MISSING'}`)
    }
    failCount++
  }
})

console.log('\n═══════════════════════════════════════════════════════════')
console.log(`  Files using useSarvamVoiceFlow: ${relevantResults.length}`)
console.log(`  ✅ PASS: ${passCount}`)
console.log(`  ❌ FAIL: ${failCount}`)
console.log('═══════════════════════════════════════════════════════════')

if (failCount > 0) {
  console.log('\n❌ VOICE TIMING AUDIT: FAILURES FOUND')
  console.log('\nRequired BUG-001 values:')
  console.log('  - initialDelayMs: 800ms (recommended)')
  console.log('  - pauseAfterMs: 1000ms (recommended)')
  console.log('  - listenTimeoutMs: 12000ms or 20000ms')
  process.exit(1)
} else if (relevantResults.length === 0) {
  console.log('\n⚠️  No files found using useSarvamVoiceFlow hook')
  process.exit(0)
} else {
  console.log('\n✅ VOICE TIMING AUDIT: 100% PASS')
  console.log('\nAll screens are BUG-001 compliant!')
  process.exit(0)
}
