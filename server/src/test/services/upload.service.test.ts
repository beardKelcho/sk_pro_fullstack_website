import uploadService from '../../services/upload.service';
import { deleteFromCloudinary } from '../../services/cloudinaryService';
import { deleteFromS3 } from '../../services/s3Service';
import { isCloudStorage } from '../../config/storage';

jest.mock('../../config/storage', () => ({
  isCloudStorage: jest.fn(),
}));

jest.mock('../../services/cloudinaryService', () => ({
  uploadToCloudinary: jest.fn(),
  deleteFromCloudinary: jest.fn(),
}));

jest.mock('../../services/s3Service', () => ({
  uploadToS3: jest.fn(),
  deleteFromS3: jest.fn(),
}));

jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

describe('UploadService.deleteFile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('full public_id verildiginde cloudinary silmeyi path uzerinden yapar', async () => {
    process.env.STORAGE_TYPE = 'cloudinary';
    (isCloudStorage as jest.Mock).mockReturnValue(true);

    await uploadService.deleteFile('hero/banner-image.jpg', 'project');

    expect(deleteFromCloudinary).toHaveBeenCalledWith('hero/banner-image.jpg', 'image');
  });

  it('yalnizca filename verildiginde kategori ile storage target olusturur', async () => {
    process.env.STORAGE_TYPE = 's3';
    (isCloudStorage as jest.Mock).mockReturnValue(true);

    await uploadService.deleteFile('banner-image.jpg', 'hero');

    expect(deleteFromS3).toHaveBeenCalledWith('hero/banner-image.jpg');
  });
});
