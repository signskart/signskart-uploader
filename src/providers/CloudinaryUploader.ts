import { BaseUploader } from '../core/BaseUploader';
import { UploadOptions, UploadResponse } from '../core/types';

interface CloudinaryConfig {
    cloudName: string;
    uploadPreset: string;
}

export class CloudinaryUploader extends BaseUploader {
    constructor(private config: CloudinaryConfig) {
        super();
    }

    async upload(
        options: UploadOptions,
        onProgress: (percent: number) => void
    ): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append('file', options.file);
        formData.append('upload_preset', this.config.uploadPreset);
        formData.append('folder', options.folder);

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.onprogress = event => {
                if (event.lengthComputable) {
                    onProgress(Math.round((event.loaded / event.total) * 100));
                }
            };

            xhr.onload = () => {
                const data = JSON.parse(xhr.responseText);
                if (xhr.status === 200 && data.secure_url) {
                    resolve({ url: data.secure_url, provider: 'cloudinary' });
                } else {
                    reject(new Error('Cloudinary upload failed'));
                }
            };

            xhr.onerror = () => reject(new Error('Cloudinary upload failed'));

            xhr.open('POST', `https://api.cloudinary.com/v1_1/${this.config.cloudName}/upload`);
            xhr.send(formData);
        });
    }
}