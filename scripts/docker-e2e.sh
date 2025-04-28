#!/usr/bin/env bash
set -e

# Set ROOT directory (assuming script is run from anywhere)
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Make sure we clean up env file on exit (even on failure)
cleanup() {
  echo "Cleaning up..."
  rm -f "$ROOT/.docker/env-example"
}
trap cleanup EXIT

# Function to bring up the containers
up() {
  echo "Step 1: Copy env file"
  cp "$ROOT/env-example" "$ROOT/.docker/env-example"

  echo "Step 2: Start docker-compose with env file"
  docker-compose -f "$ROOT/.docker/docker-compose.test.yaml" --env-file "$ROOT/.docker/env-example" -p tests up -d --build

  echo "Step 3: Check containers are healthy and running"
  echo "Waiting for containers to become healthy..."

  # Wait for Postgres
  docker-compose -f "$ROOT/.docker/docker-compose.test.yaml" -p tests exec postgres /opt/wait-for-it.sh localhost:5432 -t 60

  # Wait for API
  docker-compose -f "$ROOT/.docker/docker-compose.test.yaml" -p tests exec api /opt/wait-for-it.sh localhost:3000 -t 60

  echo "✅ All containers are ready!"
}

# Function to bring down the containers
down() {
  echo "Step 5: Shutdown containers after tests"
  docker-compose -f "$ROOT/.docker/docker-compose.test.yaml" -p tests down

  echo "Step 6: Force remove any leftovers"
  docker-compose -p tests rm -svf
}

# Step 4: Run E2E tests
run_tests() {
  set +e  # allow script to continue even if tests fail

  docker-compose -f "$ROOT/.docker/docker-compose.test.yaml" -p tests exec api npm run test:e2e -- --watchAll --runInBand
  TEST_EXIT_CODE=$?

  set -e  # back to fail fast mode

  # Show error if tests failed
  if [ $TEST_EXIT_CODE -ne 0 ]; then
    echo ""
    echo "❌ E2E Tests failed with exit code $TEST_EXIT_CODE"
    exit $TEST_EXIT_CODE
  else
    echo ""
    echo "✅ E2E Tests passed successfully!"
  fi
}

# Main script logic
case "$1" in
  up)
    up
    ;;
  down)
    down
    ;;
  test)
    run_tests
    ;;
  *)
    echo "Usage: $0 {up|down|test}"
    exit 1
    ;;
esac
