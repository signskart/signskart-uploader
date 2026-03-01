export type UploadProvider = 's3' | 'cloudinary';

export interface UploadOptions {
    file: File;
    folder: string;
    fileName?: string;
    metadata?: Record<string, any>;
}

export interface UploadResponse {
    url: string;
    provider: string;
    key?: string;
}

export type UploadStatus =
    | 'queued'
    | 'uploading'
    | 'success'
    | 'error'
    | 'cancelled';

export interface UploadTaskState {
    id: string;
    progress: number;
    status: UploadStatus;
    error?: string;
    response?: UploadResponse;
}