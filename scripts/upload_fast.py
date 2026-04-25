import os
import subprocess
import concurrent.futures

# Configuration
supabase_url = "https://zodrhrqqeyehsuswgtbh.supabase.co"
anon_key = "sb_publishable_XI9Ulg8KZ7o6O83vsMvm6Q_Ok3T-qZx"
bucket = "reports"

# Base directory
base_dir = r"c:\Users\saias\Downloads\services_community-risk-platform_1774682348.948415-b13decbee07d4a73a1290afdb10fb7df"
data_dir = os.path.join(base_dir, "public", "data")
pdf_dir = os.path.join(base_dir, "public", "pdfs", "uploads")

def upload_file(file_info):
    file_path, dest_name = file_info
    url = f"{supabase_url}/storage/v1/object/{bucket}/{dest_name}"
    
    content_type = "application/octet-stream"
    if dest_name.endswith(".pdf"):
        content_type = "application/pdf"
    elif dest_name.endswith(".csv"):
        content_type = "text/csv"
    
    cmd = [
        "curl.exe", "-s", "-X", "POST",
        "-H", f"Authorization: Bearer {anon_key}",
        "-H", f"apikey: {anon_key}",
        "-H", f"Content-Type: {content_type}",
        "--data-binary", f"@{file_path}",
        url
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        print(f"Uploaded: {dest_name}")
    else:
        print(f"Failed: {dest_name} - {result.stderr}")

# Collect all files
files_to_upload = []
if os.path.exists(data_dir):
    for f in os.listdir(data_dir):
        if os.path.isfile(os.path.join(data_dir, f)):
            files_to_upload.append((os.path.join(data_dir, f), f))

if os.path.exists(pdf_dir):
    for f in os.listdir(pdf_dir):
        if os.path.isfile(os.path.join(pdf_dir, f)):
            files_to_upload.append((os.path.join(pdf_dir, f), f))

print(f"Starting parallel upload of {len(files_to_upload)} files...")

# Increase max_workers to speed up (e.g., 20 parallel uploads)
with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
    executor.map(upload_file, files_to_upload)

print("All files processed.")
