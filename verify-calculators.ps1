# verify-calculators.ps1 — Verification script for calculator page UI upgrade
$projectRoot = "D:\WorkBuddy\三站引流项目\deng-tts-tools"
$errors = @()

$pages = @(
    @{ Html = "$projectRoot\tools\tiktok-fee-calculator\index.html"; Js = "$projectRoot\assets\js\tiktok-fee-calculator.js"; Name = "Fee Calculator" }
    @{ Html = "$projectRoot\tools\tiktok-profit-calculator\index.html"; Js = "$projectRoot\assets\js\tiktok-profit-calculator.js"; Name = "Profit Calculator" }
    @{ Html = "$projectRoot\tools\tiktok-vs-amazon\index.html"; Js = "$projectRoot\assets\js\tiktok-vs-amazon.js"; Name = "VS Amazon Calculator" }
)

foreach ($p in $pages) {
    Write-Host "`n=== $($p.Name) ===" -ForegroundColor Cyan
    $html = Get-Content $p.Html -Raw
    $js = Get-Content $p.Js -Raw

    # 1. body has tool-calc
    if ($html -match '<body[^>]*class="[^"]*tool-calc') { Write-Host "  [OK] body.tool-calc" -ForegroundColor Green }
    else { $errors += "$($p.Name): no tool-calc"; Write-Host "  [FAIL] no tool-calc" -ForegroundColor Red }

    # 2. calc-window
    if ($html -match 'calc-window') { Write-Host "  [OK] calc-window" -ForegroundColor Green }
    else { $errors += "$($p.Name): no calc-window" }

    # 3. calc-inputs / calc-results
    if ($html -match 'calc-inputs') { Write-Host "  [OK] calc-inputs" -ForegroundColor Green }
    else { $errors += "$($p.Name): no calc-inputs" }
    if ($html -match 'calc-results') { Write-Host "  [OK] calc-results" -ForegroundColor Green }
    else { $errors += "$($p.Name): no calc-results" }

    # 4. copy-results-btn
    if ($html -match 'copy-results-btn') { Write-Host "  [OK] copy-results-btn" -ForegroundColor Green }
    else { $errors += "$($p.Name): no copy-results-btn" }

    # 5. nextstep
    if ($html -match 'nextstep') { Write-Host "  [OK] nextstep" -ForegroundColor Green }
    else { $errors += "$($p.Name): no nextstep" }

    # 6. copy-results.js script tag
    if ($html -match 'copy-results\.js') { Write-Host "  [OK] copy-results.js script" -ForegroundColor Green }
    else { $errors += "$($p.Name): no copy-results.js script" }

    # 7. Cross-check JS IDs vs HTML
    # Pattern 1: getElementById('id')
    $jsIds1 = [regex]::Matches($js, "getElementById\('([^']+)'\)") | ForEach-Object { $_.Groups[1].Value }
    # Pattern 2: $id('id')
    $jsIds2 = [regex]::Matches($js, "\`$id\('([^']+)'\)") | ForEach-Object { $_.Groups[1].Value }
    # Pattern 3: get('id')
    $jsIds3 = [regex]::Matches($js, "get\('([^']+)'\)") | ForEach-Object { $_.Groups[1].Value }
    $jsIds = ($jsIds1 + $jsIds2 + $jsIds3) | Sort-Object -Unique

    $htmlIds = [regex]::Matches($html, 'id="([^"]+)"') | ForEach-Object { $_.Groups[1].Value }

    $allFound = $true
    foreach ($jid in $jsIds) {
        if ($htmlIds -notcontains $jid) {
            Write-Host "  [FAIL] JS ID '$jid' not in HTML" -ForegroundColor Red
            $allFound = $false
            $errors += "$($p.Name): JS ID '$jid' not in HTML"
        }
    }
    if ($allFound) { Write-Host "  [OK] All $($jsIds.Count) JS IDs found in HTML" -ForegroundColor Green }
}

# Check copy-results.js exists
if (Test-Path "$projectRoot\assets\js\copy-results.js") {
    Write-Host "`n=== copy-results.js exists ===" -ForegroundColor Green
} else {
    $errors += "copy-results.js missing"
    Write-Host "`n=== copy-results.js MISSING ===" -ForegroundColor Red
}

Write-Host "`n========== SUMMARY ==========" -ForegroundColor Cyan
if ($errors.Count -eq 0) {
    Write-Host "ALL CHECKS PASSED!" -ForegroundColor Green
} else {
    Write-Host "$($errors.Count) error(s):" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}
Write-Host "=============================" -ForegroundColor Cyan
