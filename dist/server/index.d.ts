interface PresignConfig {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    publicUrl: string;
    expiresIn?: number;
}
interface PresignRequest {
    fileName: string;
    contentType: string;
    folder?: string;
}
declare function createS3PresignHandler(config: PresignConfig): ({ fileName, contentType, folder, }: PresignRequest) => Promise<{
    signedUrl: string;
    key: string;
    publicUrl: string;
}>;

export { type PresignConfig, type PresignRequest, createS3PresignHandler };
