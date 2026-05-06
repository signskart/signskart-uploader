import type { FirebaseOptions } from 'firebase/app';
import { UploadManager } from '../core/UploadManager';
import type { UploadProvider } from '../core/types';
import { FirebaseStorageUploader } from '../providers/FirebaseStorageUploader';
import { S3Uploader } from '../providers/S3Uploader';

export interface CreateClientUploadManagerConfig {
    provider?: UploadProvider | string;
    concurrency?: number;
    s3?: {
        apiBaseUrl?: string;
        publicUrl?: string;
    };
    firebase?: {
        firebaseConfig?: FirebaseOptions;
        bucketUrl?: string;
        appName?: string;
    };
}

const normalizeProvider = (provider: CreateClientUploadManagerConfig['provider']) =>
    (provider || 's3').toLowerCase();

const hasFirebaseConfig = (config?: FirebaseOptions) =>
    Boolean(config?.apiKey && config?.authDomain && config?.projectId && config?.storageBucket && config?.appId);

export const createClientUploadManager = (config: CreateClientUploadManagerConfig = {}) => {
    const provider = normalizeProvider(config.provider);
    const concurrency = config.concurrency ?? 3;

    if (provider === 'firebase') {
        if (!hasFirebaseConfig(config.firebase?.firebaseConfig)) {
            throw new Error('Missing required Firebase configuration for upload provider "firebase".');
        }

        return new UploadManager(
            new FirebaseStorageUploader({
                firebaseConfig: config.firebase!.firebaseConfig!,
                bucketUrl: config.firebase?.bucketUrl,
                appName: config.firebase?.appName,
            }),
            concurrency
        );
    }

    if (!config.s3?.apiBaseUrl || !config.s3?.publicUrl) {
        throw new Error('Missing required S3 configuration: "apiBaseUrl" and "publicUrl" are required.');
    }

    return new UploadManager(
        new S3Uploader({
            apiBaseUrl: config.s3.apiBaseUrl,
            publicUrl: config.s3.publicUrl,
        }),
        concurrency
    );
};
