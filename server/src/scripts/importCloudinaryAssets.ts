import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import Media from '../models/Media';
import SiteImage from '../models/SiteImage';

dotenv.config({ path: path.join(process.cwd(), '.env') });

if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
  dotenv.config({ path: path.join(__dirname, '../../.env') });
}

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!mongoUri) {
  // eslint-disable-next-line no-console
  console.error('FATAL: MONGO_URI veya MONGODB_URI bulunamadı.');
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type CloudinaryResource = {
  public_id: string;
  secure_url: string;
  resource_type: 'image' | 'video' | 'raw';
  created_at?: string;
  original_filename?: string;
  filename?: string;
};

type SiteImageCategory = 'project' | 'gallery' | 'hero' | 'about' | 'video' | 'other';

const siteImageFolders = new Set(['project', 'gallery', 'hero', 'about', 'video', 'other', 'site-images']);

const isApplyMode = process.argv.includes('--apply');

const toFilename = (publicId: string) => publicId.split('/').pop() || publicId;

const classifySiteImageCategory = (publicId: string, resourceType: CloudinaryResource['resource_type']): SiteImageCategory | null => {
  const [firstSegment] = publicId.split('/');
  if (!siteImageFolders.has(firstSegment)) return null;

  if (firstSegment === 'site-images') {
    return resourceType === 'video' ? 'video' : 'project';
  }

  if (firstSegment === 'video') return 'video';
  if (firstSegment === 'project') return 'project';
  if (firstSegment === 'gallery') return 'gallery';
  if (firstSegment === 'hero') return 'hero';
  if (firstSegment === 'about') return 'about';
  return 'other';
};

const isMediaLibraryAsset = (publicId: string) => publicId.startsWith('skproduction/library/');

const fetchAllResources = async (resourceType: 'image' | 'video') => {
  const resources: CloudinaryResource[] = [];
  let nextCursor: string | undefined;

  do {
    const response = await cloudinary.api.resources({
      type: 'upload',
      resource_type: resourceType,
      max_results: 500,
      next_cursor: nextCursor,
    });

    resources.push(...(response.resources as CloudinaryResource[]));
    nextCursor = response.next_cursor;
  } while (nextCursor);

  return resources;
};

const main = async () => {
  await mongoose.connect(mongoUri);

  const [imageResources, videoResources] = await Promise.all([
    fetchAllResources('image'),
    fetchAllResources('video'),
  ]);

  const resources = [...imageResources, ...videoResources];
  const folderSummary = resources.reduce<Record<string, number>>((acc, resource) => {
    const [firstSegment, secondSegment] = resource.public_id.split('/');
    const bucket = secondSegment ? `${firstSegment}/${secondSegment}` : firstSegment;
    acc[bucket] = (acc[bucket] || 0) + 1;
    return acc;
  }, {});

  const mediaAssets = resources.filter((resource) => isMediaLibraryAsset(resource.public_id));
  const siteImageAssets = resources
    .map((resource) => ({
      resource,
      category: classifySiteImageCategory(resource.public_id, resource.resource_type),
    }))
    .filter((item): item is { resource: CloudinaryResource; category: SiteImageCategory } => Boolean(item.category));

  // eslint-disable-next-line no-console
  console.log(`Cloudinary total assets: ${resources.length}`);
  // eslint-disable-next-line no-console
  console.log('Folder summary:', folderSummary);
  // eslint-disable-next-line no-console
  console.log(`Media library candidates: ${mediaAssets.length}`);
  // eslint-disable-next-line no-console
  console.log(`Site image candidates: ${siteImageAssets.length}`);

  if (!isApplyMode) {
    // eslint-disable-next-line no-console
    console.log('Dry run complete. Use --apply to upsert into MongoDB.');
    await mongoose.disconnect();
    return;
  }

  let mediaUpserts = 0;
  let siteImageUpserts = 0;

  for (const asset of mediaAssets) {
    await Media.findOneAndUpdate(
      { publicId: asset.public_id },
      {
        url: asset.secure_url,
        type: asset.resource_type === 'video' ? 'video' : 'image',
        name: asset.original_filename || asset.filename || toFilename(asset.public_id),
        publicId: asset.public_id,
        createdAt: asset.created_at ? new Date(asset.created_at) : new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    mediaUpserts += 1;
  }

  let siteImageOrder = 0;
  for (const { resource, category } of siteImageAssets) {
    await SiteImage.findOneAndUpdate(
      { path: resource.public_id },
      {
        filename: toFilename(resource.public_id),
        originalName: resource.original_filename || resource.filename || toFilename(resource.public_id),
        path: resource.public_id,
        url: resource.secure_url,
        category,
        order: siteImageOrder,
        isActive: true,
        createdAt: resource.created_at ? new Date(resource.created_at) : new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    siteImageOrder += 1;
    siteImageUpserts += 1;
  }

  // eslint-disable-next-line no-console
  console.log(`Upserted media assets: ${mediaUpserts}`);
  // eslint-disable-next-line no-console
  console.log(`Upserted site images: ${siteImageUpserts}`);

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error('Cloudinary import failed:', error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
