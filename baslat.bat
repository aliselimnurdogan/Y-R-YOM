@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"

if not exist "node_modules\" (
  echo Ilk sefer: paketler kuruluyor. Biraz bekle.
  call npm install
)

echo.
echo Yuruyom aciliyor. Bu pencereyi kapatma.
echo Tarayici birkac saniye icinde acilacak.
echo.

start "" cmd /c "timeout /t 3 /nobreak >nul & start http://127.0.0.1:5173/"
call npm run dev -- --host 127.0.0.1 --port 5173
pause
