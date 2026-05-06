# 🚀 @signskart/uploader

Production-grade Upload Manager SDK by **Signskart**.

A powerful, fully-typed file upload SDK with queue management, retry logic, cancellation support, concurrency control, and multi-provider architecture (S3 + Cloudinary + Firebase Storage).

---

## ✨ Features

* 🚀 Upload queue system
* 🔁 Automatic retry with exponential backoff
* 📊 Real-time progress tracking
* ❌ Cancel uploads (AbortController support)
* ⚡ Concurrency control
* ☁ Multi-provider support (Amazon S3, Cloudinary, Firebase Storage)
* 🧠 Fully typed (TypeScript)
* 🌍 Works with React, Vue, Next.js, Vite, vanilla JS
* 🔐 Secure S3 presigned upload support
* 🖥 Optional server helper included

---

# 📦 Installation

```bash
npm install @signskart/uploader
```

or

```bash
yarn add @signskart/uploader
```

---

# 🏗 Architecture

For **Amazon S3**, uploads require a backend to generate presigned URLs.

Flow:

Frontend → Backend (presign) → S3 → Frontend uploads directly

Your AWS credentials NEVER reach the browser.

Cloudinary does NOT require backend if using unsigned preset.

---

# 🚀 Quick Start

## 1️⃣ Client (S3)

```ts
import { UploadManager, S3Uploader } from '@signskart/uploader';

const manager = new UploadManager(
  new S3Uploader({
    apiBaseUrl: import.meta.env.VITE_APP_API_BASE_URL,
    publicUrl: import.meta.env.VITE_AWS_S3_BASE_URL,
  }),
  3
);

const task = manager.add({
  file,
  folder: 'uploads',
});

task.events.subscribe((state) => {
  console.log(state.progress, state.status);
});
```

## 2️⃣ Server Presign Endpoint

Use `createS3PresignHandler` in your backend and expose:

`POST /api/s3/presign-upload`

Expected request body:

```json
{
  "fileName": "logo.png",
  "folder": "uploads",
  "contentType": "image/png"
}
```

Expected response body:

```json
{
  "signedUrl": "https://...",
  "key": "uploads/1710000000000-logo.png",
  "url": "https://cdn.example.com/uploads/1710000000000-logo.png"
}
```

---

# ✅ Signskart Admin Pattern (Recommended)

Goal: keep upload implementation inside `@signskart/uploader`; in admin only pass env and selected file.

## 1️⃣ Admin wrapper (env only)

```ts
// apps/signskart-admin/src/lib/uploads/createUploadManager.ts
import { S3Uploader, UploadManager } from '@signskart/uploader';

export const createUploadManager = (concurrency = 3) => {
  return new UploadManager(
    new S3Uploader({
      apiBaseUrl: import.meta.env.VITE_APP_API_BASE_URL,
      publicUrl: import.meta.env.VITE_AWS_S3_BASE_URL,
    }),
    concurrency
  );
};
```

## 2️⃣ Admin component (select file + call manager)

```tsx
const uploadManager = useMemo(() => createUploadManager(3), []);

const handleUpload = (file: File) => {
  const task = uploadManager.add({
    file,
    folder: 'assets/store',
  });

  task.events.subscribe((state) => {
    if (state.status === 'success') {
      console.log('Uploaded URL:', state.response?.url);
    }
  });
};
```

This keeps admin thin: env + selected file only.

---

## 2️⃣ Backend Setup (Next.js Example)

```ts
// app/api/s3/presign-upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createS3PresignHandler } from '@signskart/uploader/server';

const generatePresignedUpload = createS3PresignHandler({
  region: process.env.AWS_REGION!,
  accessKeyId: process.env.AWS_KEY!,
  secretAccessKey: process.env.AWS_SECRET!,
  bucket: process.env.AWS_S3_BUCKET!,
  publicUrl: process.env.NEXT_PUBLIC_S3_PUBLIC_URL!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await generatePresignedUpload(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate presigned URL' },
      { status: 500 }
    );
  }
}
```

---

## 3️⃣ Backend Setup (Express Example)

```ts
import express from 'express';
import { createS3PresignHandler } from '@signskart/uploader/server';

const app = express();
app.use(express.json());

const generatePresignedUpload = createS3PresignHandler({
  region: process.env.AWS_REGION!,
  accessKeyId: process.env.AWS_KEY!,
  secretAccessKey: process.env.AWS_SECRET!,
  bucket: process.env.AWS_S3_BUCKET!,
  publicUrl: process.env.S3_PUBLIC_URL!,
});

app.post('/api/s3/presign-upload', async (req, res) => {
  try {
    const result = await generatePresignedUpload(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate presigned URL' });
  }
});

app.listen(3000);
```

---

# ☁ Using Cloudinary (No Backend Required)

```ts
import { UploadManager, CloudinaryUploader } from '@signskart/uploader';

const uploader = new CloudinaryUploader({
  cloudName: 'your-cloud-name',
  uploadPreset: 'unsigned-preset'
});

const manager = new UploadManager(uploader);

const task = manager.add({
  file,
  folder: 'designs'
});
```

---

# 🔥 Firebase Storage Full Examples (Next.js + Node.js)

Firebase mode is different from S3 mode:

* S3: frontend uploads via backend presign endpoint.
* Firebase: frontend can upload directly with Firebase client SDK.

## 1️⃣ Next.js Client Example (using uploader package)

Install:

```bash
npm install @signskart/uploader firebase
```

Create env file:

```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

Create uploader helper:

```ts
// lib/firebaseUploader.ts
import { FirebaseStorageUploader, UploadManager } from '@signskart/uploader';

export const createFirebaseUploadManager = (concurrency = 3) => {
  return new UploadManager(
    new FirebaseStorageUploader({
      firebaseConfig: {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
      },
      appName: 'signskart-nextjs-uploader',
    }),
    concurrency
  );
};
```

Use in a client component:

```tsx
// app/upload/page.tsx
'use client';

import { useMemo, useState } from 'react';
import { createFirebaseUploadManager } from '@/lib/firebaseUploader';

export default function UploadPage() {
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [status, setStatus] = useState('idle');

  const manager = useMemo(() => createFirebaseUploadManager(3), []);

  const onSelectFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const task = manager.add({
      file,
      folder: 'uploads/nextjs',
      metadata: { source: 'nextjs-client' },
    });

    task.events.subscribe((state) => {
      setProgress(state.progress);
      setStatus(state.status);

      if (state.status === 'success') {
        setUploadedUrl(state.response?.url || '');
      }
    });

    try {
      await task.start();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Firebase Upload</h1>
      <input type="file" onChange={onSelectFile} />
      <p>Status: {status}</p>
      <p>Progress: {progress}%</p>
      {uploadedUrl ? (
        <p>
          File URL: <a href={uploadedUrl} target="_blank" rel="noreferrer">{uploadedUrl}</a>
        </p>
      ) : null}
    </main>
  );
}
```

## 2️⃣ Node.js Example (server upload flow)

`FirebaseStorageUploader` in this package is browser-oriented (uses browser upload APIs).
For pure Node.js backend upload, use Firebase Admin SDK.

Install:

```bash
npm install express multer firebase-admin
```

Server example:

```ts
// server.ts
import express from 'express';
import multer from 'multer';
import admin from 'firebase-admin';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const bucket = admin.storage().bucket();

app.post('/api/firebase/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const folder = String(req.body.folder || 'uploads/node');
    const objectName = `${folder}/${Date.now()}-${req.file.originalname}`;
    const object = bucket.file(objectName);

    await object.save(req.file.buffer, {
      contentType: req.file.mimetype,
      resumable: false,
      metadata: {
        metadata: {
          source: 'node-api',
        },
      },
    });

    await object.makePublic();
    const url = `https://storage.googleapis.com/${bucket.name}/${objectName}`;

    return res.json({ url, key: objectName, provider: 'firebase' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

Node.js env example:

```bash
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

---

# 🧠 API Reference

---

## UploadManager

```ts
new UploadManager(uploader, concurrency?)
```

### Parameters

| Parameter   | Type         | Default  |
| ----------- | ------------ | -------- |
| uploader    | BaseUploader | required |
| concurrency | number       | 3        |

---

## UploadTask

Returned from:

```ts
const task = manager.add(options);
```

### Properties

* `task.state`
* `task.events.subscribe()`

### Methods

```ts
task.start()
task.cancel()
```

---

## Upload Options

```ts
{
  file: File;
  folder: string;
  fileName?: string;
  metadata?: Record<string, any>;
}
```

---

# 🔁 Retry Logic

* Automatic retry
* Exponential backoff
* Default max retries: 2
* Cancels if AbortController triggered

---

# ❌ Cancel Upload

```ts
task.cancel();
```

---

# 📊 Listen to Progress

```ts
task.events.subscribe((state) => {
  console.log(state.progress, state.status);
});
```

State structure:

```ts
{
  id: string;
  progress: number;
  status: 'queued' | 'uploading' | 'success' | 'error' | 'cancelled';
  error?: string;
  response?: UploadResponse;
}
```

---

# ⚛ Example React Usage

```tsx
const handleUpload = (file: File) => {
  const task = manager.add({ file, folder: 'uploads' });

  task.events.subscribe((state) => {
    setProgress(state.progress);
  });
};
```

---

# 🔐 Security Notes (Important)

* AWS credentials must NEVER be exposed to frontend.
* Always generate presigned URLs server-side.
* Cloudinary unsigned preset must have restricted permissions.
* Set proper S3 bucket CORS configuration.

---

# 🛠 Requirements

* Modern browser (AbortController support)
* Node.js 18+ for server helper
* Backend endpoint for S3 presign (if using S3)

---

# 📦 Package Exports

Client:

```ts
import { UploadManager } from '@signskart/uploader';
```

Server helper:

```ts
import { createS3PresignHandler } from '@signskart/uploader/server';
```

---

# 📈 Roadmap

* Multipart uploads (100MB+)
* Image compression plugin
* Validation middleware
* Signed download URLs
* React hooks wrapper

---

# 📜 License

MIT © Signskart