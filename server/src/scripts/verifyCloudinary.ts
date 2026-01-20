
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

console.log('Checking Cloudinary configuration...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '******' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'Not Set');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function verify() {
    try {
        console.log('Attempting upload...');
        // Create a simple 1x1 base64 png
        const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

        const result = await cloudinary.uploader.upload(base64Image, {
            folder: 'verification_test',
            resource_type: 'image',
        });

        console.log('Upload successful!');
        console.log('Public ID:', result.public_id);
        console.log('URL:', result.secure_url);

        // Clean up
        console.log('Cleaning up...');
        await cloudinary.uploader.destroy(result.public_id);
        console.log('Cleanup successful.');

    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

verify();
