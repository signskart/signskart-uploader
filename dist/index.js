"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  CloudinaryUploader: () => CloudinaryUploader,
  S3Uploader: () => S3Uploader,
  UploadManager: () => UploadManager,
  UploadTask: () => UploadTask
});
module.exports = __toCommonJS(index_exports);

// src/core/EventEmitter.ts
var EventEmitter = class {
  constructor() {
    this.listeners = [];
  }
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
  emit(payload) {
    this.listeners.forEach((listener) => listener(payload));
  }
};

// src/core/UploadTask.ts
var UploadTask = class {
  constructor(uploader, options, maxRetries = 2, retryDelay = 500) {
    this.uploader = uploader;
    this.options = options;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
    this.events = new EventEmitter();
    this.abortController = new AbortController();
    this.retries = 0;
    this.state = {
      id: crypto.randomUUID(),
      progress: 0,
      status: "queued"
    };
  }
  /**
   * Starts the upload process
   */
  async start() {
    this.update({ status: "uploading" });
    while (this.retries <= this.maxRetries) {
      try {
        const response = await this.uploader.upload(
          this.options,
          (progress) => {
            this.update({ progress });
          },
          this.abortController.signal
        );
        this.update({
          status: "success",
          progress: 100,
          response
        });
        return;
      } catch (error) {
        if (this.abortController.signal.aborted) {
          this.update({ status: "cancelled" });
          return;
        }
        const message = error instanceof Error ? error.message : "Unknown upload error";
        if (this.retries >= this.maxRetries) {
          this.update({
            status: "error",
            error: message
          });
          return;
        }
        this.retries++;
        const delay = this.retryDelay * Math.pow(2, this.retries - 1);
        await this.sleep(delay);
      }
    }
  }
  /**
   * Cancels the upload
   */
  cancel() {
    this.abortController.abort();
    this.update({ status: "cancelled" });
  }
  /**
   * Internal state updater
   */
  update(update) {
    this.state = { ...this.state, ...update };
    this.events.emit(this.state);
  }
  /**
   * Utility sleep helper
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};

// src/core/UploadManager.ts
var UploadManager = class {
  constructor(uploader, concurrency = 3) {
    this.uploader = uploader;
    this.concurrency = concurrency;
    this.queue = [];
    this.active = 0;
  }
  add(options) {
    const task = new UploadTask(this.uploader, options);
    this.queue.push(task);
    this.process();
    return task;
  }
  async process() {
    if (this.active >= this.concurrency) return;
    const next = this.queue.find((t) => t.state.status === "queued");
    if (!next) return;
    this.active++;
    await next.start();
    this.active--;
    this.process();
  }
};

// src/core/BaseUploader.ts
var BaseUploader = class {
};

// src/providers/S3Uploader.ts
var S3Uploader = class extends BaseUploader {
  constructor(config) {
    super();
    this.config = config;
  }
  async upload(options, onProgress, signal) {
    const presignRes = await fetch(
      `${this.config.apiBaseUrl}/s3/presign-upload`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: options.fileName || options.file.name,
          folder: options.folder,
          contentType: options.file.type
        })
      }
    );
    const { uploadUrl, key } = await presignRes.json();
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = event.loaded / event.total * 100;
          onProgress(Math.round(percent));
        }
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve({
            url: `${this.config.publicUrl}/${key}`,
            provider: "s3"
          });
        } else {
          reject(new Error("S3 upload failed"));
        }
      };
      xhr.onerror = () => reject(new Error("S3 upload failed"));
      signal?.addEventListener("abort", () => {
        xhr.abort();
        reject(new Error("Upload cancelled"));
      });
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", options.file.type);
      xhr.send(options.file);
    });
  }
};

// src/providers/CloudinaryUploader.ts
var CloudinaryUploader = class extends BaseUploader {
  constructor(config) {
    super();
    this.config = config;
  }
  async upload(options, onProgress) {
    const formData = new FormData();
    formData.append("file", options.file);
    formData.append("upload_preset", this.config.uploadPreset);
    formData.append("folder", options.folder);
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = event.loaded / event.total * 100;
          onProgress(Math.round(percent));
        }
      };
      xhr.onload = () => {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status === 200 && data.secure_url) {
          resolve({
            url: data.secure_url,
            provider: "cloudinary"
          });
        } else {
          reject(new Error("Cloudinary upload failed"));
        }
      };
      xhr.onerror = () => reject(new Error("Cloudinary upload failed"));
      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${this.config.cloudName}/upload`
      );
      xhr.send(formData);
    });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CloudinaryUploader,
  S3Uploader,
  UploadManager,
  UploadTask
});
//# sourceMappingURL=index.js.map