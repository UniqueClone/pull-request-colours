# PowerShell script to create placeholder icons for Azure DevOps PR File Colors extension

Add-Type -AssemblyName System.Drawing

# Create 16x16 icon
$bmp16 = New-Object System.Drawing.Bitmap(16,16)
$g16 = [System.Drawing.Graphics]::FromImage($bmp16)
$g16.FillRectangle([System.Drawing.Brushes]::Blue, 0, 0, 16, 16)
$bmp16.Save("$PSScriptRoot/icon-16.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g16.Dispose()
$bmp16.Dispose()

# Create 48x48 icon
$bmp48 = New-Object System.Drawing.Bitmap(48,48)
$g48 = [System.Drawing.Graphics]::FromImage($bmp48)
$g48.FillRectangle([System.Drawing.Brushes]::Blue, 0, 0, 48, 48)
$bmp48.Save("$PSScriptRoot/icon-48.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g48.Dispose()
$bmp48.Dispose()

# Create 128x128 icon
$bmp128 = New-Object System.Drawing.Bitmap(128,128)
$g128 = [System.Drawing.Graphics]::FromImage($bmp128)
$g128.FillRectangle([System.Drawing.Brushes]::Blue, 0, 0, 128, 128)
$bmp128.Save("$PSScriptRoot/icon-128.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g128.Dispose()
$bmp128.Dispose()

Write-Host "Icons created successfully!"
Write-Host "- icon-16.png (16x16)"
Write-Host "- icon-48.png (48x48)" 
Write-Host "- icon-128.png (128x128)"
