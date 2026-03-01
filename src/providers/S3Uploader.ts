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

        if (!presignRes.ok) throw new Error('Failed to get presigned URL');

        const { signedUrl, key } = await presignRes.json();

        if (!signedUrl || !key) throw new Error('Invalid presign response');

        return new Promise<UploadResponse>((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.onprogress = event => {
                if (event.lengthComputable) {
                    onProgress(Math.round((event.loaded / event.total) * 100));
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve({
                        url: `${this.config.publicUrl}/${key}`,
                        provider: 's3',
                        key,
                    });
                } else {
                    reject(new Error(`S3 upload failed with status ${xhr.status}`));
                }
            };

            xhr.onerror = () => reject(new Error('S3 upload network error'));

            signal?.addEventListener('abort', () => {
                xhr.abort();
                reject(new Error('Upload cancelled'));
            });

            xhr.open('PUT', signedUrl);
            xhr.setRequestHeader('Content-Type', options.file.type);
            xhr.send(options.file);
        });
    }
}