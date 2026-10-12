@echo off
REM ============================================
REM Lil Mosey Estate 6G Edition - Database Backup Script
REM Schedule via Windows Task Scheduler
REM ============================================

cd /d "%~dp0\backend"
node scripts\backup.js backup

IF %ERRORLEVEL% NEQ 0 (
    echo [%DATE% %TIME%] Backup failed with error code %ERRORLEVEL% >> backups\backup.log
) ELSE (
    echo [%DATE% %TIME%] Backup completed successfully >> backups\backup.log
)
