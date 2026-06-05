Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('C:\Users\shanmu\Desktop\sill\color-chip-design.png')
$bmp = New-Object System.Drawing.Bitmap($img)
Write-Host ('Size: ' + $bmp.Width + 'x' + $bmp.Height)

$points = @('10,10','100,100','500,200','800,300','900,500','550,400','100,700','500,50','200,300','800,600')
foreach ($p in $points) {
    $parts = $p -split ','
    $x = [int]$parts[0]
    $y = [int]$parts[1]
    if ($x -lt $bmp.Width -and $y -lt $bmp.Height) {
        $c = $bmp.GetPixel($x,$y)
        Write-Host ('  (' + $x + ',' + $y + ') -> #' + $c.R.ToString('X2') + $c.G.ToString('X2') + $c.B.ToString('X2'))
    }
}

# Horizontal scan at multiple rows
foreach ($rowY in @(100,200,300,400,500,600,700)) {
    $colors = @()
    for ($x = 0; $x -lt $bmp.Width; $x += 20) {
        $c = $bmp.GetPixel($x,$rowY)
        $hex = '#' + $c.R.ToString('X2') + $c.G.ToString('X2') + $c.B.ToString('X2')
        if ($colors.Count -eq 0 -or $colors[-1] -ne $hex) {
            $colors += $hex
        }
    }
    Write-Host ('Row ' + $rowY + ': ' + ($colors -join ' '))
}

$bmp.Dispose()
$img.Dispose()
