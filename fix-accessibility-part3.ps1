# Additional UI Accessibility Fixes - Remaining Onboarding & Auth Screens

$files = @(
    "apps\pandit\src\app\onboarding\screens\LanguageConfirmScreen.tsx",
    "apps\pandit\src\app\onboarding\screens\LanguageListScreen.tsx",
    "apps\pandit\src\app\onboarding\screens\LocationPermissionScreen.tsx",
    "apps\pandit\src\app\onboarding\screens\HelpScreen.tsx",
    "apps\pandit\src\app\onboarding\screens\VoiceTutorialScreen.tsx",
    "apps\pandit\src\app\(auth)\page.tsx",
    "apps\pandit\src\app\(auth)\referral\[code]\page.tsx",
    "apps\pandit\src\app\dashboard\page.tsx",
    "apps\pandit\src\app\resume\page.tsx"
)

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
    'px-4 py-2' = 'px-6 py-3'
    'py-1\.5' = 'py-3'
    'py-2 ' = 'py-3 '
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
