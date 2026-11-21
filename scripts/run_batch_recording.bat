@echo off
setlocal
cd /d "%~dp0\.."

title MathVerse 5 - Silma AI TTS Audio Recorder

echo ================================================================
echo       MathVerse 5 - Silma AI TTS Audio Batch Generator
echo ================================================================
echo.

if "%PYTHON_EXE%"=="" (
    set PYTHON_EXE=C:\Users\Ezz\MyFile\projects\salma\silma_env\Scripts\python.exe
)

if not exist "%PYTHON_EXE%" (
    REM Try fallback to python on PATH
    where python >nul 2>&1
    if %errorlevel% equ 0 (
        set PYTHON_EXE=python
    ) else (
        echo [ERROR] Python environment was not found. Please set PYTHON_EXE or install Python.
        pause
        exit /b 1
    )
)

echo [*] Python environment: %PYTHON_EXE%
echo [*] Starting Silma AI batch audio generation...
echo [*] Note: Existing generated files will be safely skipped.
echo.

"%PYTHON_EXE%" scripts\generate_audio_silma.py %*

echo.
echo ================================================================
echo  Batch generation process completed.
echo ================================================================
pause
