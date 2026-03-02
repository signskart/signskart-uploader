Here is your **fully updated, production-ready README** including:

* ✅ Client + Server usage
* ✅ Proper S3 presign setup
* ✅ Next.js backend example
* ✅ Express backend example
* ✅ Architecture explanation
* ✅ Clean professional structure
* ✅ v2 structure with `/server` export

You can replace your entire README with this.

---

# 🚀 @ibreakloops/uploader

Production-grade Upload Manager SDK by **ibreakloops**.

A powerful, fully-typed file upload SDK with queue management, retry logic, cancellation support, concurrency control, and multi-provider architecture (S3 + Cloudinary).

---

## ✨ Features

* 🚀 Upload queue system
* 🔁 Automatic retry with exponential backoff
* 📊 Real-time progress tracking
* ❌ Cancel uploads (AbortController support)
* ⚡ Concurrency control
* ☁ Multi-provider support (Amazon S3, Cloudinary)
* 🧠 Fully typed (TypeScript)
* 🌍 Works with React, Vue, Next.js, Vite, vanilla JS
* 🔐 Secure S3 presigned upload support
* 🖥 Optional server helper included

---

# 📦 Installation

```bash
npm install @ibreakloops/uploader
```

or

```bash
yarn add @ibreakloops/uploader
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

---

# ☁ Using Amazon S3

## 1️⃣ Frontend Setup

```ts
import { UploadManager, S3Uploader } from '@ibreakloops/uploader';

const uploader = new S3Uploader({
  presignEndpoint: '/api/s3/presign-upload',
  publicUrl: 'https://cdn.yoursite.com'
});

const manager = new UploadManager(uploader, 2);

const task = manager.add({
  file,
  folder: 'designs'
});

task.events.subscribe((state) => {
  console.log(state.progress, state.status);
});
```

---

## 2️⃣ Backend Setup (Next.js Example)

```ts
// app/api/s3/presign-upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createS3PresignHandler } from '@ibreakloops/uploader/server';

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
import { createS3PresignHandler } from '@ibreakloops/uploader/server';

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
import { UploadManager, CloudinaryUploader } from '@ibreakloops/uploader';

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
import { UploadManager } from '@ibreakloops/uploader';
```

Server helper:

```ts
import { createS3PresignHandler } from '@ibreakloops/uploader/server';
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

MIT © ibreakloops

---

If you want next, I can:

* Turn this into an elite-level open source README (badges, diagrams, examples, comparison table)
* Prepare it for GitHub launch
* Write marketing description for npm
* Add proper semantic versioning strategy

Tell me your next move.
