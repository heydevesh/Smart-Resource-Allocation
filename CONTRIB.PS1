param (
    [int]$count = 40,
    [string]$filePath = "c:\Users\Asus\Projects\Smart-Resource-Allocation\sahaay_rebuild_prompts.md"
)

Set-Location "c:\Users\Asus\Projects\Smart-Resource-Allocation"

for ($i = 1; $i -le $count; $i++) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $message = "Contribution #${i}: Documentation refinement at $timestamp"
    
    # Append a small unique comment to the end of the file
    Add-Content -Path $filePath -Value "`n<!-- Update ${i}: Refined at $timestamp -->"
    
    # Git add and commit
    git add $filePath
    git commit -m $message
    
    Write-Host "Committed #${i}: $message"
}

