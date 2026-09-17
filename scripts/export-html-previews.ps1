param (
    [Parameter(Mandatory=$true)]
    [string]$HtmlDir,

    [Parameter(Mandatory=$true)]
    [string]$OutputDir
)

$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edgePath)) {
    $edgePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
}

if (-not (Test-Path $edgePath)) {
    Write-Error "Neither Edge nor Chrome browser found."
    exit 1
}

$resolvedHtmlDir = (Resolve-Path $HtmlDir).Path
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
}
$resolvedOutDir = (Resolve-Path $OutputDir).Path

$htmlFiles = Get-ChildItem -Path $resolvedHtmlDir -Filter "*.html" | Sort-Object Name
Write-Host "Found $($htmlFiles.Count) HTML preview files in $resolvedHtmlDir"

foreach ($file in $htmlFiles) {
    $baseName = $file.BaseName
    $outPng = Join-Path $resolvedOutDir "$baseName.png"
    $fileUri = "file:///" + ($file.FullName -replace '\\', '/')
    
    # Check if this file specifies dimensions in name (e.g. portrait)
    $winW = 1920
    $winH = 1080
    if ($baseName -match "portrait|9_16|poster|resume") {
        $winW = 1080
        $winH = 1528
    } elseif ($baseName -match "square|1_1") {
        $winW = 1200
        $winH = 1200
    }

    & $edgePath --headless=new --screenshot="$outPng" --window-size="$winW,$winH" "$fileUri" 2>&1 | Out-Null
    Start-Sleep -Milliseconds 300
    if (Test-Path $outPng) {
        Write-Host "  -> Rendered browser preview: $baseName.png"
    } else {
        Write-Warning "  -> Failed to render $baseName.png"
    }
}
