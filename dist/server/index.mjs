import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// src/server/createS3PresignHandler.ts
function createS3PresignHandler(config) {
  const s3 = new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey
    }
  });
  return async function generatePresignedUpload({
    fileName,
    contentType,
    folder
  }) {
    if (!fileName || !contentType) {
      throw new Error("fileName and contentType are required");
    }
    const key = `${folder || "uploads"}/${Date.now()}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      ContentType: contentType
    });
    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: config.expiresIn ?? 300
    });
    return {
      signedUrl,
      key,
      publicUrl: `${config.publicUrl}/${key}`
    };
  };
}

export { createS3PresignHandler };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map