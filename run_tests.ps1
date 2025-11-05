# run_tests.ps1 — helper to run the RLS test suite with Deno (PowerShell)

$ErrorActionPreference = 'Stop'

Write-Host "Running rls_test_suite.ts with Deno..."
& deno run --allow-net --allow-env --allow-read rls_test_suite.ts
$exitCode = $LASTEXITCODE
if ($exitCode -ne 0) {
  Write-Error "Test suite failed with exit code $exitCode"
  exit $exitCode
}
Write-Host "Test suite passed"
exit 0
