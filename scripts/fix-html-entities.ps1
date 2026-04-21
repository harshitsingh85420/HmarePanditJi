$files = Get-ChildItem -Path 'e:\HmarePanditJi\hmarepanditji\apps\admin' -Recurse -Include '*.tsx','*.ts'
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content
    $content = $content -replace '&quot;', '"'
    $content = $content -replace '&apos;', "'"
    $content = $content -replace '&amp;', '&'
    $content = $content -replace '&lt;', '<'
    $content = $content -replace '&gt;', '>'
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "Fixed:" $file.FullName
    }
}
Write-Host "Done!"
