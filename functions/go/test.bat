@echo off
REM Run all tests with verbose output
REM Usage: test.bat or test.bat .\package\...

echo === Running Go Tests ===
echo Date: %date% %time%
echo.

REM Tidy dependencies first
echo Tidying dependencies...
go mod tidy

REM Run tests
if "%1"=="" (
    echo Testing all packages...
    go test -v -race -cover ./...
) else (
    echo Testing: %1
    go test -v -race -cover %1
)

echo.
echo === Tests Complete ===
