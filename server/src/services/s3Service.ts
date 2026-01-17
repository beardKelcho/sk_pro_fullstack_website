/**
 * AWS S3 Service
 * AWS S3 API entegrasyonu için service
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import logger from '../utils/logger';

// S3 Client configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

export interface S3UploadOptions {
  folder?: string;
  contentType?: string;
  acl?: 'private' | 'public-read' | 'public-read-write';
  cacheControl?: string;
}

export interface S3UploadResult {
  key: string;
  url: string;
  bucket: string;
  etag?: string;
}

/**
 * Buffer'dan S3'e upload
 */
export const uploadToS3 = async (
  buffer: Buffer,
  filename: string,
  options: S3UploadOptions = {}
): Promise<S3UploadResult> => {
  try {
    const folder = options.folder || 'skproduction';
    const key = `${folder}/${Date.now()}-${filename}`;
    const contentType = options.contentType || 'application/octet-stream';

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: options.acl || 'public-read',
      CacheControl: options.cacheControl || 'max-age=31536000',
    });

    const result = await s3Client.send(command);

    // Public URL oluştur
    const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

    logger.info(`S3'e dosya yüklendi: ${key}`);

    return {
      key,
      url,
      bucket: BUCKET_NAME,
      etag: result.ETag,
    };
  } catch (error) {
    logger.error('S3 upload error:', error);
    throw error;
  }
};

/**
 * S3'ten dosya sil
 */
export const deleteFromS3 = async (key: string): Promise<void> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    logger.info(`S3'ten dosya silindi: ${key}`);
  } catch (error) {
    logger.error('S3 delete error:', error);
    throw error;
  }
};

/**
 * S3'ten signed URL al (private dosyalar için)
 */
export const getSignedUrlFromS3 = async (key: string, expiresIn: number = 3600): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    logger.error('S3 signed URL error:', error);
    throw error;
  }
};
