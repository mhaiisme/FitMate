@echo off
chcp 65001 >nul
echo ====================================================================
echo   FITMATE (KHOE CUNG BAN) - KHOI DONG LOCALHOST SERVER (PORT 8080)
echo ====================================================================
echo.
echo Dang mo trinh duyet tai dia chi: http://localhost:8080
echo (Nhan Ctrl + C trong cua so nay khi ban muon tat server)
echo.
cd /d "%~dp0"
start http://localhost:8080
uv run python -m http.server 8080
pause
