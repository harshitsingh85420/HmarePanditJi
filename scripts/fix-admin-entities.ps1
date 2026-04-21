# Fix remaining HTML entities in admin app files

$files = @(
    "apps\admin\src\app\settings\page.tsx",
    "apps\admin\src\app\support\page.tsx",
    "apps\admin\src\app\travel-desk\page.tsx",
    "apps\admin\src\app\payouts\page.tsx",
    "apps\admin\src\app\customers\page.tsx",
    "apps\admin\src\app\helpline\page.tsx",
    "apps\admin\src\app\login\page.tsx",
    "apps\admin\src\app\bookings\[id]\page.tsx"
)

foreach ($file in $files) {
    $path = Join-Path $PSScriptRoot "..\$file"
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        $original = $content
        
        # Fix alert() strings
        $content = $content -replace "alert\((?!['\"])([^);]+)(\);?)", "alert('$1')$"
        
        # Fix localStorage strings
        $content = $content -replace "localStorage\.getItem\(([^)']+)\)", {
            param($match)
            $arg = $match.Groups[1].Value
            if ($arg -notmatch "^['\"]") {
                "localStorage.getItem('$arg')"
            } else {
                $match.Value
            }
        }
        
        # Fix method strings
        $content = $content -replace "method: ([A-Z]+)", "method: '$1'"
        
        # Fix header strings  
        $content = $content -replace "Content- Type: application/ json", "'Content-Type': 'application/json'"
        
        if ($content -ne $original) {
            Set-Content $path $content -NoNewline
            Write-Host "Fixed: $file"
        }
    }
}

Write-Host "Done!"
