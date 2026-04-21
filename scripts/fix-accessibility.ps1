# Bulk UI Accessibility Fixes Script
# Replaces small text, old color tokens, and small touch targets

$files = @(
    "apps\pandit\src\app\onboarding\screens\MobileNumberScreen.tsx",
    "apps\pandit\src\app\onboarding\screens\OTPScreen.tsx",
    "apps\pandit\src\app\onboarding\screens\ManualCityScreen.tsx",
    "apps\pandit\src\app\(auth)\login\page.tsx",
    "apps\pandit\src\app\(registration)\profile\page.tsx",
    "apps\pandit\src\app\(registration)\mobile\page.tsx",
    "apps\pandit\src\app\(registration)\otp\page.tsx"
)

# Typography fixes
$replacements = @{
    '\btext-xs\b' = 'text-base'
    '\btext-sm\b' = 'text-lg'
    'text-[13px]' = 'text-base'
    'text-[14px]' = 'text-lg'
    'text-[15px]' = 'text-lg'
    'bg-vedic-cream' = 'bg-surface-base'
    'text-vedic-brown' = 'text-text-primary'
    'text-vedic-gold' = 'text-saffron'
    'bg-primary-lt' = 'bg-surface-card'
    'border-vedic-border' = 'border-outline-variant'
    '\bbg-primary\b' = 'bg-saffron'
    '\btext-primary\b' = 'text-saffron'
    'border-primary' = 'border-saffron'
    'w-10 h-10' = 'w-[56px] h-[56px]'
    'w-8 h-8' = 'w-[52px] h-[52px]'
    '\bh-10\b' = 'h-[56px]'
    '\bh-8\b' = 'h-[52px]'
}

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        $original = $content
        
        foreach ($pattern in $replacements.Keys) {
            $content = $content -replace $pattern, $replacements[$pattern]
        }
        
        if ($content -ne $original) {
            Set-Content -Path $file -Value $content -Encoding UTF8 -NoNewline
            Write-Host "✓ Fixed: $file"
        } else {
            Write-Host "- No changes: $file"
        }
    } else {
        Write-Host "✗ Not found: $file"
    }
}

Write-Host "Done!"
