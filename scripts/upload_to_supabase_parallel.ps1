# Configuration
$supabaseUrl = "https://zodrhrqqeyehsuswgtbh.supabase.co"
$anonKey = "sb_publishable_XI9Ulg8KZ7o6O83vsMvm6Q_Ok3T-qZx"
$bucket = "reports"

# Base directory
$baseDir = "c:\Users\saias\Downloads\services_community-risk-platform_1774682348.948415-b13decbee07d4a73a1290afdb10fb7df"
$dataDir = Join-Path $baseDir "public\data"
$pdfDir = Join-Path $baseDir "public\pdfs\uploads"

$maxParallel = 5
$runningJobs = @()

function Upload-File-Async($filePath, $destinationName) {
    $scriptBlock = {
        param($url, $anonKey, $filePath, $destinationName)
        $contentType = "application/octet-stream"
        if ($filePath.EndsWith(".pdf")) { $contentType = "application/pdf" }
        elseif ($filePath.EndsWith(".csv")) { $contentType = "text/csv" }

        curl.exe -s -X POST -H "Authorization: Bearer $anonKey" -H "apikey: $anonKey" -H "Content-Type: $contentType" --data-binary "@$filePath" $url
    }
    
    $url = "$using:supabaseUrl/storage/v1/object/$using:bucket/$destinationName"
    return Start-Job -ScriptBlock $scriptBlock -ArgumentList $url, $anonKey, $filePath, $destinationName
}

# Collect all files
$files = (Get-ChildItem $dataDir -File) + (Get-ChildItem $pdfDir -File)

Write-Host "Starting parallel upload of $($files.Count) files..."

foreach ($file in $files) {
    # Limit parallel jobs
    while ($runningJobs.Count -ge $maxParallel) {
        $finished = $runningJobs | Wait-Job -Any
        $runningJobs = $runningJobs | Where-Object { $_.State -eq 'Running' }
        Write-Host "Uploaded $($finished.Count) files. $($files.Count - ($files | Where-Object { $_.Name -eq $file.Name }).IndexOf($file)) left."
    }
    
    $job = Upload-File-Async $file.FullName $file.Name
    $runningJobs += $job
}

# Wait for remaining
$runningJobs | Wait-Job | Out-Null
Write-Host "All files uploaded to Supabase Storage."
