# Configuration
$supabaseUrl = "https://zodrhrqqeyehsuswgtbh.supabase.co"
$anonKey = "sb_publishable_XI9Ulg8KZ7o6O83vsMvm6Q_Ok3T-qZx"
$bucket = "reports"

# Base directory
$baseDir = "c:\Users\saias\Downloads\services_community-risk-platform_1774682348.948415-b13decbee07d4a73a1290afdb10fb7df"
$dataDir = Join-Path $baseDir "public\data"
$pdfDir = Join-Path $baseDir "public\pdfs\uploads"

function Upload-File($filePath, $destinationName) {
    $url = "$supabaseUrl/storage/v1/object/$bucket/$destinationName"
    Write-Host "Uploading $destinationName..."
    $contentType = "application/octet-stream"
    if ($filePath.EndsWith(".pdf")) { $contentType = "application/pdf" }
    elseif ($filePath.EndsWith(".csv")) { $contentType = "text/csv" }

    curl.exe -X POST -H "Authorization: Bearer $anonKey" -H "apikey: $anonKey" -H "Content-Type: $contentType" --data-binary "@$filePath" $url
}

# Upload files from public/data
Get-ChildItem $dataDir -File | ForEach-Object {
    Upload-File $_.FullName $_.Name
}

# Upload files from public/pdfs/uploads
Get-ChildItem $pdfDir -File | ForEach-Object {
    Upload-File $_.FullName $_.Name
}
