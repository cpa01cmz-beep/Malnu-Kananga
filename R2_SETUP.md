# Cloudflare R2 File Storage Integration Guide

## Overview
Cloudflare R2 is an S3-compatible object storage service used for storing files (documents, images, videos) in the School Management System.

## Prerequisites
- Cloudflare account with Workers & R2 enabled
- Wrangler CLI installed (`npm install -g wrangler`)

## Setup Instructions

### 1. Create R2 Buckets

#### Production Bucket
```bash
wrangler r2 bucket create malnu-kananga-files
```

#### Development Bucket
```bash
wrangler r2 bucket create malnu-kananga-files-dev
```

### 2. Configure wrangler.toml
The `wrangler.toml` file already includes the R2 bucket bindings. Ensure the following sections are present:

```toml
[[env.production.r2_buckets]]
binding = "BUCKET"
bucket_name = "malnu-kananga-files"

[[env.dev.r2_buckets]]
binding = "BUCKET"
bucket_name = "malnu-kananga-files-dev"
```

### 3. Update Database Schema
The database tables that require file storage have been updated with the following fields:
- `ppdb_registrants.document_url` (TEXT) - URL to uploaded registration documents
- `e_library.file_url` (TEXT) - URL to uploaded learning materials
- `e_library.file_type` (TEXT) - MIME type of the file
- `e_library.file_size` (INTEGER) - File size in bytes

### 4. File Storage Organization

#### Bucket Structure
```
malnu-kananga-files/
├── ppdb-documents/
│   └── {year}/
│       └── {registrant_id}/
│           └── ijazah.pdf
├── e-library/
│   ├── {subject_id}/
│   │   └── {material_id}/
│   │       └── {filename}
│   └── {category}/
│       └── {material_id}/
│           └── {filename}
└── uploads/
    └── {user_id}/
        └── {timestamp}/
            └── {filename}
```

## API Endpoints

### Upload File
**POST** `/api/files/upload`

**Request:**
- `Content-Type: multipart/form-data`
- `file`: File to upload
- `path`: Optional custom path (default: `uploads/{user_id}/{timestamp}`)

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "key": "ppdb-documents/2024/abc123/ijazah.pdf",
    "url": "https://r2.example.com/ppdb-documents/2024/abc123/ijazah.pdf",
    "size": 1048576,
    "type": "application/pdf"
  }
}
```

### Download File
**GET** `/api/files/download?key={key}`

Redirects to the signed R2 URL for direct download.

### Delete File
**DELETE** `/api/files/delete?key={key}`

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### List Files
**GET** `/api/files/list?prefix={prefix}`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "key": "e-library/math/123/material.pdf",
      "size": 2097152,
      "uploaded": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## File Validation Rules

### PPDB Documents
- **Allowed Types:** PDF, JPG, PNG, JPEG
- **Max Size:** 5 MB
- **Required Fields:** Ijazah, KK, Akta Kelahiran

### E-Library Materials
- **Allowed Types:** PDF, DOCX, PPT, PPTX, MP4, JPG, PNG
- **Max Size:** 50 MB
- **Categories:** Matematika, Bahasa, IPA, IPS, Agama, etc.

### General Uploads
- **Allowed Types:** All common document and image formats
- **Max Size:** 10 MB

## Security Considerations

### 1. Authentication
All file operations require JWT authentication via the `Authorization: Bearer {token}` header.

### 2. Access Control
- Users can only upload files in their designated directories
- Teachers can upload to `e-library/{subject_id}`
- Admins have full access to all directories
- Download URLs are signed with expiration times

### 3. File Validation
- Server-side MIME type validation
- File size limits enforced on upload
- Virus scanning (optional - integrate with Cloudflare Anti-Malware)

## Usage Examples

### Frontend File Upload
```typescript
const uploadFile = async (file: File, path?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (path) formData.append('path', path);

  const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  return response.json();
};
```

### Backend File Processing
```javascript
const file = await request.formData();
const uploadedFile = file.get('file');
const path = file.get('path') || `uploads/${user_id}/${Date.now()}`;

const key = `${path}/${uploadedFile.name}`;
await env.BUCKET.put(key, uploadedFile);
```

## Deployment

### Deploy Worker with R2
```bash
# Deploy to production
wrangler deploy --env production

# Deploy to development
wrangler deploy --env dev
```

## Monitoring

### View Bucket Contents
```bash
wrangler r2 object list malnu-kananga-files --prefix="ppdb-documents/2024/"
```

### Get File Info
```bash
wrangler r2 object get malnu-kananga-files --key=ppdb-documents/2024/abc123/ijazah.pdf
```

### Delete File
```bash
wrangler r2 object delete malnu-kananga-files --key=ppdb-documents/2024/abc123/ijazah.pdf
```

## Troubleshooting

### Issue: "Bucket not found"
**Solution:** Create the bucket using `wrangler r2 bucket create` and ensure the binding in `wrangler.toml` is correct.

### Issue: "File upload failed"
**Solution:** Check file size limits, ensure proper Content-Type header, verify JWT token is valid.

### Issue: "CORS error on download"
**Solution:** Configure CORS rules in the worker response headers (already implemented in `worker.js`).

### Issue: "Storage quota exceeded"
**Solution:** Monitor bucket usage and implement cleanup policies for old files.

## Cost Considerations

- R2 has no egress fees (unlike S3)
- Storage costs apply based on usage
- Class A and Class B operations incur small fees
- Estimated monthly cost: $0.015/GB stored + $4.50/1M Class A operations

## Future Enhancements

1. **Image Optimization:** Integrate with Cloudflare Images for automatic resizing
2. **CDN Distribution:** Use Cloudflare CDN for faster delivery
3. **Versioning:** Enable bucket versioning for file history
4. **Lifecycle Policies:** Auto-delete files older than X days
5. **Encryption:** Enable server-side encryption for sensitive files

## References

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [R2 API Reference](https://developers.cloudflare.com/r2/api/workers-with-r2/)
