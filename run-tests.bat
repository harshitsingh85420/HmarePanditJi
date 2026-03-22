@echo off
echo.
echo ================================================================
echo   HmarePanditJi - Automated Test Runner
echo ================================================================
echo.

REM Check if app is running
echo [1/4] Checking if app is running on port 3002...
netstat -ano | findstr :3002 > nul
if errorlevel 1 (
    echo.
    echo [ERROR] App is NOT running on port 3002
    echo.
    echo Please start your app first:
    echo   1. Open another terminal
    echo   2. cd apps\pandit
    echo   3. npm run dev
    echo   4. Come back here and run this script again
    echo.
    pause
    exit /b 1
)
echo [OK] App is running
echo.

REM Run tests
echo [2/4] Running automated tests...
echo.
echo This will take 15-20 minutes...
echo.

call npx playwright test --project="Desktop Chrome (Dev)" --reporter=html,list

if errorlevel 1 (
    echo.
    echo [WARNING] Some tests failed
    echo.
) else (
    echo.
    echo [SUCCESS] All tests passed!
    echo.
)

echo [3/4] Generating report...
echo.

call npx playwright show-report

echo.
echo [4/4] Done!
echo.
echo ================================================================
echo   Testing Complete!
echo ================================================================
echo.
echo NEXT STEPS:
echo   1. Review the HTML report that just opened
echo   2. Fix any failing tests
echo   3. Run manual testing: See COMPLETE_TESTING_PROTOCOL.md
echo.
echo ================================================================
echo.
pause
