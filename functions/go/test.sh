#!/bin/bash
# Run all tests with verbose output
# Usage: ./test.sh or ./test.sh ./package/...

set -e

echo "=== Running Go Tests ==="
echo "Date: $(date)"
echo ""

# Tidy dependencies first
echo "Tidying dependencies..."
go mod tidy

# Run tests
if [ -n "$1" ]; then
    echo "Testing: $1"
    go test -v -race -cover "$1"
else
    echo "Testing all packages..."
    go test -v -race -cover ./...
fi

echo ""
echo "=== Tests Complete ==="
