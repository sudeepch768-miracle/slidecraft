param (
    [Parameter(Mandatory=$true)]
    [string]$PptxPath,

    [Parameter(Mandatory=$true)]
    [string]$OutputDir
)

$resolvedPptx = (Resolve-Path $PptxPath).Path
if (-not (Test-Path $resolvedPptx)) {
    Write-Error "PPTX file not found: $PptxPath"
    exit 1
}

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
}
$resolvedOutDir = (Resolve-Path $OutputDir).Path

Write-Host "Opening PowerPoint to export: $resolvedPptx"

$ppt = New-Object -ComObject PowerPoint.Application
try {
    # Open presentation in read-only, hidden/minimized window
    $pres = $ppt.Presentations.Open($resolvedPptx, 1, 0, 0)
    $slideCount = $pres.Slides.Count
    Write-Host "Exporting $slideCount slides to PNG..."

    for ($i = 1; $i -le $slideCount; $i++) {
        $slide = $pres.Slides.Item($i)
        $outPng = Join-Path $resolvedOutDir "Slide_$i.png"
        if (Test-Path $outPng) { Remove-Item -Force $outPng }
        
        # Determine aspect ratio from presentation dimensions
        $widthInches = $pres.PageSetup.SlideWidth / 72.0
        $heightInches = $pres.PageSetup.SlideHeight / 72.0
        
        # High resolution render (1920 width for landscape, 1080 for portrait)
        $targetW = 1920
        $targetH = 1080
        if ($heightInches -gt $widthInches) {
            # Portrait (e.g. A4 poster, resume, 9:16 infographic)
            $targetW = 1080
            $targetH = [int](1080 * ($heightInches / $widthInches))
        } elseif ($heightInches -eq $widthInches) {
            # Square (1:1)
            $targetW = 1200
            $targetH = 1200
        }

        $slide.Export($outPng, "PNG", $targetW, $targetH)
        Write-Host "  -> Exported Slide $i to: $outPng"
    }

    $pres.Close()
    Write-Host "Successfully exported all $slideCount slides."
}
catch {
    Write-Error "PowerPoint export failed: $_"
    exit 1
}
finally {
    $ppt.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}
