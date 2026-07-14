import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { logger } from '../utils/logger';

export class StorageService {
  private useCloudinary = false;

  constructor() {
    // Enable Cloudinary only if credentials are set and not mock
    if (
      config.cloudinary.cloudName &&
      config.cloudinary.cloudName !== 'mock_cloud_name' &&
      config.cloudinary.apiKey &&
      config.cloudinary.apiKey !== 'mock_api_key' &&
      config.cloudinary.apiSecret
    ) {
      cloudinary.config({
        cloud_name: config.cloudinary.cloudName,
        api_key: config.cloudinary.apiKey,
        api_secret: config.cloudinary.apiSecret,
      });
      this.useCloudinary = true;
      logger.info('Cloudinary Storage Service Initialized');
    } else {
      logger.info('Cloudinary config missing or using mock; falling back to Local Storage');
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string
  ): Promise<{ url: string; publicId: string }> {
    if (this.useCloudinary) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: `educouns/${folder}` },
          (error, result) => {
            if (error || !result) {
              logger.error('Cloudinary upload error:', error);
              return reject(new Error('Gagal mengunggah file ke Cloudinary'));
            }
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        );
        uploadStream.end(file.buffer);
      });
    } else {
      // Local storage fallback
      try {
        const uploadDir = path.join(__dirname, '../../uploads', folder);
        await fs.promises.mkdir(uploadDir, { recursive: true });

        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        const filepath = path.join(uploadDir, filename);

        await fs.promises.writeFile(filepath, file.buffer);

        const relativeUrl = `/uploads/${folder}/${filename}`;
        const fullUrl = `http://localhost:${config.port}${relativeUrl}`;

        logger.info(`File uploaded locally: ${filepath}`);

        return {
          url: fullUrl,
          publicId: `local:${folder}/${filename}`, // Prefix to identify local files
        };
      } catch (error) {
        logger.error('Local file upload error:', error);
        throw new Error('Gagal mengunggah file ke penyimpanan lokal');
      }
    }
  }

  async deleteFile(publicId: string): Promise<boolean> {
    if (!publicId) return false;

    if (this.useCloudinary && !publicId.startsWith('local:')) {
      try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === 'ok';
      } catch (error) {
        logger.error('Failed to delete file from Cloudinary:', error);
        return false;
      }
    } else {
      // Delete local file
      try {
        const localPath = publicId.replace('local:', '');
        const filepath = path.join(__dirname, '../../uploads', localPath);
        if (fs.existsSync(filepath)) {
          await fs.promises.unlink(filepath);
          logger.info(`Deleted local file: ${filepath}`);
          return true;
        }
        return false;
      } catch (error) {
        logger.error('Failed to delete local file:', error);
        return false;
      }
    }
  }
}
