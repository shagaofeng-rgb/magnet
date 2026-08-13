param(
  [Parameter(Mandatory=$true)][string]$Source,
  [Parameter(Mandatory=$true)][string]$OutputDirectory
)

Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force $OutputDirectory | Out-Null
$sourceImage = [System.Drawing.Bitmap]::new($Source)
$width = $sourceImage.Width
$height = $sourceImage.Height
$clean = [System.Drawing.Bitmap]::new($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($y = 0; $y -lt $height; $y++) {
  for ($x = 0; $x -lt $width; $x++) {
    $pixel = $sourceImage.GetPixel($x, $y)
    $nearNeutral = ([Math]::Abs($pixel.R - $pixel.G) -lt 8) -and ([Math]::Abs($pixel.G - $pixel.B) -lt 8)
    $isChecker = $nearNeutral -and $pixel.R -ge 178
    if ($isChecker) { $clean.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 255, 255, 255)) }
    else { $clean.SetPixel($x, $y, $pixel) }
  }
}

$bounds = [System.Drawing.Rectangle]::FromLTRB($width, $height, 0, 0)
for ($y = 0; $y -lt $height; $y++) {
  for ($x = 0; $x -lt $width; $x++) {
    if ($clean.GetPixel($x, $y).A -gt 20) {
      if ($x -lt $bounds.Left) { $bounds.X = $x }
      if ($y -lt $bounds.Top) { $bounds.Y = $y }
      if ($x -gt $bounds.Right) { $bounds.Width = $x - $bounds.X + 1 }
      if ($y -gt $bounds.Bottom) { $bounds.Height = $y - $bounds.Y + 1 }
    }
  }
}

$padding = 18
$crop = [System.Drawing.Bitmap]::new($bounds.Width + $padding * 2, $bounds.Height + $padding * 2, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($crop)
$graphics.Clear([System.Drawing.Color]::Transparent)
$graphics.DrawImage($clean, [System.Drawing.Rectangle]::new($padding, $padding, $bounds.Width, $bounds.Height), $bounds, [System.Drawing.GraphicsUnit]::Pixel)
$graphics.Dispose()
$crop.Save((Join-Path $OutputDirectory 'bzmagnet-logo.png'), [System.Drawing.Imaging.ImageFormat]::Png)

$icon = [System.Drawing.Bitmap]::new(256, 256, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$iconGraphics = [System.Drawing.Graphics]::FromImage($icon)
$iconGraphics.Clear([System.Drawing.Color]::Transparent)
$top = [System.Drawing.Rectangle]::new(350, 70, 400, 470)
$iconGraphics.DrawImage($clean, [System.Drawing.Rectangle]::new(8, 8, 240, 240), $top, [System.Drawing.GraphicsUnit]::Pixel)
$iconGraphics.Dispose()
$icon.Save((Join-Path $OutputDirectory 'icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$icon.Save((Join-Path $OutputDirectory 'apple-icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)

$sourceImage.Dispose(); $clean.Dispose(); $crop.Dispose(); $icon.Dispose()
