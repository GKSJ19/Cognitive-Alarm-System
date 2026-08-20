@echo off
echo ===================================================
echo Creating minimal milestone 4 folder for GitHub...
echo ===================================================

set SOURCE=Milestone4_Code
set DEST=milestone_4_minimal

if exist "%DEST%" (
    echo Removing old %DEST%...
    rmdir /S /Q "%DEST%"
)
mkdir "%DEST%"
mkdir "%DEST%\backend"
mkdir "%DEST%\frontend"
mkdir "%DEST%\exam-bot"

echo.
echo [1/4] Copying essential backend files...
xcopy /E /I /Y "%SOURCE%\backend\app" "%DEST%\backend\app" >nul
copy /Y "%SOURCE%\backend\pyproject.toml" "%DEST%\backend\" >nul
copy /Y "%SOURCE%\backend\Dockerfile" "%DEST%\backend\" >nul
copy /Y "%SOURCE%\backend\alembic.ini" "%DEST%\backend\" >nul

echo [2/4] Copying essential frontend files...
xcopy /E /I /Y "%SOURCE%\frontend\src" "%DEST%\frontend\src" >nul
copy /Y "%SOURCE%\frontend\package.json" "%DEST%\frontend\" >nul
copy /Y "%SOURCE%\frontend\vite.config.ts" "%DEST%\frontend\" >nul
copy /Y "%SOURCE%\frontend\tailwind.config.ts" "%DEST%\frontend\" >nul
copy /Y "%SOURCE%\frontend\Dockerfile" "%DEST%\frontend\" >nul

echo [3/4] Copying essential exam-bot files...
xcopy /E /I /Y "%SOURCE%\exam-bot\src" "%DEST%\exam-bot\src" >nul
copy /Y "%SOURCE%\exam-bot\package.json" "%DEST%\exam-bot\" >nul

echo [4/4] Copying root project files...
copy /Y "%SOURCE%\README.md" "%DEST%\" >nul
copy /Y "%SOURCE%\docker-compose.yml" "%DEST%\" >nul

echo.
echo ===================================================
echo Done! The folder "%DEST%" is ready.
echo It contains ONLY your core source code and should be well under the 100 file limit.
echo ===================================================
pause
