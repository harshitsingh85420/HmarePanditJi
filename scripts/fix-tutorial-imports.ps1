$dir = "C:\Users\ss\Documents\HmarePanditJi\apps\pandit\src\app\onboarding\screens\tutorial"
Get-ChildItem "$dir\Tutorial*.tsx" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace 'import \{ TUTORIAL_TRANSLATIONS, TutorialLanguage \} from ''@/lib/tutorial-translations'';', 'import { TUTORIAL_TRANSLATIONS, getTutorialLang } from ''@/lib/tutorial-translations'';'
    $content = $content -replace 'const lang = \(language as TutorialLanguage\) in TUTORIAL_TRANSLATIONS \? \(language as TutorialLanguage\) : ''Hindi'';', 'const lang = getTutorialLang(language);'
    Set-Content $_.FullName $content -NoNewline
    Write-Host "Updated: $($_.Name)"
}
Write-Host "Done!"
