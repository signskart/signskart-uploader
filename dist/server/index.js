'use strict';

var clientS3 = require('@aws-sdk/client-s3');
var s3RequestPresigner = require('@aws-sdk/s3-request-presigner');

// src/server/createS3PresignHandler.ts
function createS3PresignHandler(config) {
  const s3 = new clientS3.S3Client({
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
    const command = new clientS3.PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      ContentType: contentType
    });
    const signedUrl = await s3RequestPresigner.getSignedUrl(s3, command, {
      expiresIn: config.expiresIn ?? 300
    });
    return {
      signedUrl,
      key,
      publicUrl: `${config.publicUrl}/${key}`
    };
  };
}

exports.createS3PresignHandler = createS3PresignHandler;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map