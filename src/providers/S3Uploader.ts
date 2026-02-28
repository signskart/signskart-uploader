import { BaseUploader } from '../core/BaseUploader';
import { UploadOptions, UploadResponse } from '../core/types';

interface S3Config {
    apiBaseUrl: string;
    publicUrl: string;
}

export class S3Uploader extends BaseUploader {
    constructor(private config: S3Config) {
        super();
    }

    async upload(
        options: UploadOptions,
        onProgress: (percent: number) => void,
        signal?: AbortSignal
    ): Promise<UploadResponse> {
        const presignRes = await fetch(`${this.config.apiBaseUrl}/api/s3/presign-upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fileName: options.fileName || options.file.name,
                folder: options.folder,
                contentType: options.file.type
            })
        });

        const { uploadUrl, key } = await presignRes.json();

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.onprogress = event => {
                if (event.lengthComputable) {
                    onProgress(Math.round((event.loaded / event.total) * 100));
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve({ url: `${this.config.publicUrl}/${key}`, provider: 's3' });
                } else {
                    reject(new Error('S3 upload failed'));
                }
            };

            xhr.onerror = () => reject(new Error('S3 upload failed'));

            signal?.addEventListener('abort', () => {
                xhr.abort();
                reject(new Error('Upload cancelled'));
            });

            xhr.open('PUT', uploadUrl);
            xhr.setRequestHeader('Content-Type', options.file.type);
            xhr.send(options.file);
        });
    }
}