/**
 * Migration Script: Add type field to existing ShowcaseProjects
 * 
 * This script adds the 'type' field to all existing projects in the database.
 * Projects with videoUrl will be marked as 'video', others as 'photo'.
 * 
 * Run this script once after deploying the new code.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ShowcaseProject from '../models/ShowcaseProject';

// Load environment variables
dotenv.config();

const migrateProjectTypes = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || '');
        console.log('Connected to MongoDB');

        // Find all projects without a type field
        const projectsWithoutType = await ShowcaseProject.find({
            $or: [
                { type: { $exists: false } },
                { type: null }
            ]
        });

        console.log(`Found ${projectsWithoutType.length} projects without type field`);

        let photoCount = 0;
        let videoCount = 0;

        // Update each project
        for (const project of projectsWithoutType) {
            // Determine type based on whether videoUrl exists
            const type = project.videoUrl && project.videoUrl.trim() !== '' ? 'video' : 'photo';

            project.type = type;

            // If it's a photo project but has no imageUrls, create array with coverUrl
            if (type === 'photo' && (!project.imageUrls || project.imageUrls.length === 0)) {
                project.imageUrls = project.coverUrl ? [project.coverUrl] : [];
            }

            await project.save();

            if (type === 'photo') {
                photoCount++;
            } else {
                videoCount++;
            }

            console.log(`✓ Updated: ${project.title} -> ${type}`);
        }

        console.log(`\n✅ Migration completed!`);
        console.log(`   Photo projects: ${photoCount}`);
        console.log(`   Video projects: ${videoCount}`);
        console.log(`   Total migrated: ${projectsWithoutType.length}`);

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

// Run migration
migrateProjectTypes();
