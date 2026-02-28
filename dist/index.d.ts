type UploadProvider = 's3' | 'cloudinary';
interface UploadOptions {
    file: File;
    folder: string;
    fileName?: string;
    metadata?: Record<string, any>;
}
interface UploadResponse {
    url: string;
    provider: UploadProvider;
}
type UploadStatus = 'queued' | 'uploading' | 'success' | 'error' | 'cancelled';
interface UploadTaskState {
    id: string;
    progress: number;
    status: UploadStatus;
    error?: string;
    response?: UploadResponse;
}

declare abstract class BaseUploader {
    abstract upload(options: UploadOptions, onProgress: (percent: number) => void, signal?: AbortSignal): Promise<UploadResponse>;
}

type Listener<T> = (payload: T) => void;
declare class EventEmitter<T> {
    private listeners;
    subscribe(listener: Listener<T>): () => void;
    emit(payload: T): void;
}

declare class UploadTask {
    private uploader;
    private options;
    private maxRetries;
    private retryDelay;
    state: UploadTaskState;
    events: EventEmitter<UploadTaskState>;
    private abortController;
    private retries;
    constructor(uploader: BaseUploader, options: UploadOptions, maxRetries?: number, retryDelay?: number);
    start(): Promise<void>;
    cancel(): void;
    private update;
    private sleep;
}

declare class UploadManager {
    private uploader;
    private concurrency;
    private queue;
    private active;
    constructor(uploader: BaseUploader, concurrency?: number);
    add(options: UploadOptions): UploadTask;
    private process;
}

interface S3Config {
    apiBaseUrl: string;
    publicUrl: string;
}
declare class S3Uploader extends BaseUploader {
    private config;
    constructor(config: S3Config);
    upload(options: UploadOptions, onProgress: (percent: number) => void, signal?: AbortSignal): Promise<UploadResponse>;
}

interface CloudinaryConfig {
    cloudName: string;
    uploadPreset: string;
}
declare class CloudinaryUploader extends BaseUploader {
    private config;
    constructor(config: CloudinaryConfig);
    upload(options: UploadOptions, onProgress: (percent: number) => void): Promise<UploadResponse>;
}

export { CloudinaryUploader, S3Uploader, UploadManager, type UploadOptions, type UploadProvider, type UploadResponse, type UploadStatus, UploadTask, type UploadTaskState };
