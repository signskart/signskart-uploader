import { UploadOptions, UploadResponse } from './types';

export abstract class BaseUploader {
    abstract upload(options: UploadOptions, onProgress: (percent: number) => void, signal?: AbortSignal): Promise<UploadResponse>;
}