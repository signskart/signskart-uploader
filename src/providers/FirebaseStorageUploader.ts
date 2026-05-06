import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getDownloadURL, getStorage, ref, uploadBytesResumable, type UploadMetadata } from 'firebase/storage';
import { BaseUploader } from '../core/BaseUploader';
import { UploadOptions, UploadResponse } from '../core/types';

export interface FirebaseStorageConfig {
    firebaseConfig: FirebaseOptions;
    bucketUrl?: string;
    appName?: string;
}

export class FirebaseStorageUploader extends BaseUploader {
    private app: FirebaseApp;

    constructor(private config: FirebaseStorageConfig) {
        super();
        this.app = this.getOrCreateApp(config.firebaseConfig, config.appName);
    }

    async upload(
        options: UploadOptions,
        onProgress: (percent: number) => void,
        signal?: AbortSignal
    ): Promise<UploadResponse> {
        const storage = getStorage(this.app, this.config.bucketUrl);
        const objectPath = this.buildObjectPath(options.folder, options.fileName || options.file.name);
        const storageRef = ref(storage, objectPath);
        const metadata: UploadMetadata = {
            contentType: options.file.type,
            customMetadata: this.toStringRecord(options.metadata),
        };

        return new Promise<UploadResponse>((resolve, reject) => {
            const uploadTask = uploadBytesResumable(storageRef, options.file, metadata);
            let isSettled = false;

            const settleReject = (error: Error) => {
                if (isSettled) return;
                isSettled = true;
                reject(error);
            };

            const settleResolve = (response: UploadResponse) => {
                if (isSettled) return;
                isSettled = true;
                resolve(response);
            };

            const abortUpload = () => {
                uploadTask.cancel();
                settleReject(new Error('Upload cancelled'));
            };

            if (signal?.aborted) {
                abortUpload();
                return;
            }

            signal?.addEventListener('abort', abortUpload, { once: true });

            uploadTask.on(
                'state_changed',
                snapshot => {
                    const percent = snapshot.totalBytes
                        ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
                        : 0;

                    onProgress(percent);
                },
                error => {
                    signal?.removeEventListener('abort', abortUpload);
                    settleReject(error);
                },
                async () => {
                    signal?.removeEventListener('abort', abortUpload);

                    try {
                        const url = await getDownloadURL(uploadTask.snapshot.ref);

                        settleResolve({
                            url,
                            provider: 'firebase',
                            key: uploadTask.snapshot.ref.fullPath,
                        });
                    } catch (error) {
                        settleReject(error as Error);
                    }
                }
            );
        });
    }

    private buildObjectPath(folder: string, fileName: string) {
        return [folder, fileName]
            .filter(Boolean)
            .join('/')
            .replace(/\/{2,}/g, '/')
            .replace(/^\//, '');
    }

    private getOrCreateApp(firebaseConfig: FirebaseOptions, appName?: string) {
        if (!appName) {
            return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        }

        const existingApp = getApps().find(app => app.name === appName);
        return existingApp || initializeApp(firebaseConfig, appName);
    }

    private toStringRecord(metadata?: Record<string, any>) {
        if (!metadata) return undefined;

        return Object.entries(metadata).reduce<Record<string, string>>((result, [key, value]) => {
            if (value !== undefined && value !== null) {
                result[key] = String(value);
            }

            return result;
        }, {});
    }
}
