# @signskart/uploader

Production-grade Upload Manager SDK by Signskart.

Features:

- 🚀 Upload queue
- 🔁 Retry logic with exponential backoff
- 📊 Real-time progress tracking
- ❌ Cancel uploads
- ⚡ Concurrency control
- ☁ Multi-provider support (S3, Cloudinary)
- 🧠 Fully typed (TypeScript)
- 🌍 Works with React, Vue, Next.js, Vite

---

## 📦 Installation

```bash
npm install @signskart/uploader
```

or

```bash
yarn add @signskart/uploader
```

---

# 🚀 Quick Start

## Using Amazon S3 (Presigned Upload)

```ts
import { UploadManager, S3Uploader } from '@signskart/uploader';

const uploader = new S3Uploader({
  apiBaseUrl: 'https://api.yourbackend.com',
  publicUrl: 'https://cdn.yoursite.com'
});

const manager = new UploadManager(uploader, 2); // concurrency = 2

const task = manager.add({
  file,
  folder: 'designs'
});

task.events.subscribe((state) => {
  console.log(state.progress, state.status);
});
```

---

## Using Cloudinary

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

# 🧠 API Reference

## UploadManager

```ts
new UploadManager(uploader, concurrency?)
```

### Parameters:

| Parameter | Type | Default |
|-----------|------|----------|
| uploader | BaseUploader | required |
| concurrency | number | 3 |

---

## UploadTask

Returned from:

```ts
const task = manager.add(options);
```

### Properties:

- `task.state`
- `task.events.subscribe()`

### Methods:

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

- Automatic retry
- Exponential backoff
- Default max retries: 2

---

# ❌ Cancel Upload

```ts
task.cancel();
```

---

# 📊 Listen to Progress

```ts
task.events.subscribe((state) => {
  console.log(state.progress);
});
```

---

# 🏗 Example React Usage

```tsx
const handleUpload = (file: File) => {
  const task = manager.add({ file, folder: 'uploads' });

  task.events.subscribe((state) => {
    setProgress(state.progress);
  });
};
```

---

# 🛠 Requirements

- Modern browser (AbortController support)
- Backend endpoint for S3 presign (if using S3)

---

# 📜 License

MIT © Signskart