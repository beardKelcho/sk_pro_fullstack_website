import mongoose, { FilterQuery } from 'mongoose';
import { Project, Equipment, Client, User } from '../models';
import { IProject } from '../models/Project';
import { AppError, IProjectPopulated } from '../types/common';


export interface PaginatedProjects {
    projects: IProjectPopulated[];
    total: number;
    page: number;
    totalPages: number;
}

export interface CreateProjectData {
    name: string;
    description?: string;
    client: string; // ObjectId string
    location?: string;
    startDate: Date;
    endDate?: Date;
    status?: string;
    budget?: number; // Added
    manager?: string; // Added, ObjectId string
    team?: string[]; // Array of ObjectId strings
    equipment?: string[]; // Array of ObjectId strings
    createdBy?: string; // Added for logging
}

export interface UpdateProjectData {
    name?: string;
    description?: string;
    client?: string;
    location?: string;
    startDate?: Date; // Changed from Date | string to just Date or whatever passed
    endDate?: Date;
    status?: string;
    budget?: number; // Added
    manager?: string; // Added
    team?: string[];
    equipment?: string[];
    userId?: string; // Added for logging
}

class ProjectService {
    /**
     * Check equipment availability for a date range
     */
    async checkEquipmentAvailability(
        equipmentIds: string[],
        startDate: Date,
        endDate: Date | undefined,
        excludeProjectId?: string
    ): Promise<{
        available: boolean;
        conflictingProject?: IProjectPopulated;
        conflictingEquipmentId?: string;
    }> {
        if (!equipmentIds.length || !endDate) return { available: true };

        const query: FilterQuery<IProject> = {
            _id: { $ne: excludeProjectId },
            status: { $nin: ['CANCELLED', 'COMPLETED', 'ON_HOLD'] },
            equipment: { $in: equipmentIds },
            $or: [
                // Project starts within range
                { startDate: { $gte: startDate, $lte: endDate } },
                // Project ends within range
                { endDate: { $gte: startDate, $lte: endDate } },
                // Project encompasses range
                { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
            ]
        };

        const conflictingProject = await Project.findOne(query).populate('equipment');

        if (conflictingProject) {
            // Find which equipment is conflicting
            const conflictId = equipmentIds.find(id =>
                (conflictingProject.equipment as unknown as mongoose.Types.ObjectId[]).some(e => e.toString() === id)
            );
            return {
                available: false,
                conflictingProject: conflictingProject as unknown as IProjectPopulated,
                conflictingEquipmentId: conflictId
            };
        }

        return { available: true };
    }

    /**
     * List projects
     */
    async listProjects(
        page: number = 1,
        limit: number = 20,
        sort: string = '-startDate',
        search?: string,
        status?: string,
        client?: string
    ): Promise<PaginatedProjects> {
        const filters: FilterQuery<IProject> = {};

        if (status && status !== 'all') filters.status = status;
        if (client) filters.client = client;

        if (search) {
            filters.$text = { $search: search };
        }

        const skip = (page - 1) * limit;
        const sortOptions: any = {};

        if (search && sort === 'relevance') {
            sortOptions.score = { $meta: 'textScore' };
        } else {
            const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
            const sortOrder = sort.startsWith('-') ? -1 : 1;
            sortOptions[sortField] = sortOrder;
        }

        const [projects, total] = await Promise.all([
            Project.find(filters)
                .populate('client', 'name company email')
                .populate('team', 'name email role')
                .populate('equipment', 'name type model serialNumber')
                .sort(sortOptions)
                .skip(skip)
                .limit(limit),
            Project.countDocuments(filters)
        ]);

        return {
            projects: projects as unknown as IProjectPopulated[],
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * Get Project by ID
     */
    async getProjectById(id: string): Promise<IProjectPopulated> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError('Geçersiz proje ID', 400);
        }

        const project = await Project.findById(id)
            .populate('client', 'name company email plane phone')
            .populate('team', 'name email role phone')
            .populate('equipment');

        if (!project) {
            throw new AppError('Proje bulunamadı', 404);
        }

        return project as unknown as IProjectPopulated;
    }

    /**
     * Create Project
     */
    async createProject(data: CreateProjectData, session?: mongoose.ClientSession): Promise<IProjectPopulated> {
        if (!data.name || !data.client || !data.startDate) {
            throw new AppError('Proje adı, müşteri ve başlangıç tarihi gereklidir', 400);
        }

        // Validate Client
        if (!mongoose.Types.ObjectId.isValid(data.client)) {
            throw new AppError('Geçersiz müşteri ID', 400);
        }
        const clientExists = await Client.findById(data.client);
        if (!clientExists) {
            throw new AppError('Müşteri bulunamadı', 404);
        }

        // Validate Team
        if (data.team && data.team.length > 0) {
            const validTeam = await User.countDocuments({ _id: { $in: data.team } });
            if (validTeam !== data.team.length) {
                throw new AppError('Bazı ekip üyeleri bulunamadı', 400);
            }
        }

        // Check Equipment Availability
        if (data.equipment && data.equipment.length > 0 && data.endDate) {
            const availability = await this.checkEquipmentAvailability(
                data.equipment,
                new Date(data.startDate),
                new Date(data.endDate)
            );

            if (!availability.available) {
                throw new AppError(
                    `Seçilen ekipmanlardan bazıları bu tarihler arasında başka bir projede kullanımda: ${availability.conflictingProject?.name}`,
                    409
                );
            }
        }

        const [project] = await Project.create([{
            name: data.name,
            client: data.client,
            description: data.description,
            startDate: data.startDate,
            endDate: data.endDate,
            location: data.location,
            status: data.status || 'PENDING_APPROVAL',
            team: data.team || [],
            equipment: data.equipment || []
        }], { session });

        // Handle Equipment Checkout logic
        if (data.equipment && data.equipment.length > 0) {
            const EquipmentModel = mongoose.model('Equipment');
            const InventoryLogModel = mongoose.model('InventoryLog');

            // Update Equipment Status
            await EquipmentModel.updateMany(
                { _id: { $in: data.equipment } },
                { $set: { status: 'IN_USE', currentProject: project._id } },
                { session }
            );

            // Create Logs
            const logs = data.equipment.map((eqId: string) => ({
                equipment: eqId,
                user: data.createdBy, // Assuming createdBy is passed in data or we need it
                action: 'CHECK_OUT',
                project: project._id,
                quantityChanged: 0,
                notes: `Assigned to Project: ${project.name}`,
                date: new Date()
            }));
            await InventoryLogModel.insertMany(logs, { session });
        }

        return await this.getProjectById(project._id.toString());
    }

    /**
     * Update Project
     */
    async updateProject(id: string, data: UpdateProjectData, session?: mongoose.ClientSession): Promise<IProjectPopulated> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError('Geçersiz proje ID', 400);
        }

        const project = await Project.findById(id);
        if (!project) {
            throw new AppError('Proje bulunamadı', 404);
        }

        // Determine effective dates for availability check
        const startDate = data.startDate ? new Date(data.startDate) : project.startDate;
        const endDate = data.endDate ? new Date(data.endDate) : project.endDate;
        const equipmentIds = data.equipment || (project.equipment as unknown as mongoose.Types.ObjectId[]).map(id => id.toString());

        // Use strict check if dates or equipment changed
        const isDateChanged = (data.startDate && new Date(data.startDate).getTime() !== new Date(project.startDate).getTime()) ||
            (data.endDate && new Date(data.endDate).getTime() !== new Date(project.endDate!).getTime());
        const isEquipmentChanged = !!data.equipment;

        // Only check availability if relevant fields changed and we have an end date
        if ((isDateChanged || isEquipmentChanged) && endDate && equipmentIds.length > 0) {
            const availability = await this.checkEquipmentAvailability(
                equipmentIds,
                startDate,
                endDate,
                id
            );

            if (!availability.available) {
                throw new AppError(
                    `Seçilen ekipmanlardan bazıları bu tarihler arasında başka bir projede kullanımda: ${availability.conflictingProject?.name}`,
                    409
                );
            }
        }

        // Apply updates
        // Get old project for comparison
        const oldProject = await Project.findById(id).session(session || null);
        if (!oldProject) throw new AppError('Project not found', 404);

        if (data.name) project.name = data.name;
        if (data.description) project.description = data.description;
        if (data.startDate) project.startDate = new Date(data.startDate);
        if (data.endDate) project.endDate = new Date(data.endDate); // Allow setting undefined? Typescript says Optional
        if (data.location) project.location = data.location;
        if (data.status) project.status = data.status as IProject['status'];
        if (data.client) project.client = new mongoose.Types.ObjectId(data.client);
        if (data.team) project.team = data.team.map(id => new mongoose.Types.ObjectId(id));
        if (data.equipment) project.equipment = data.equipment.map(id => new mongoose.Types.ObjectId(id));
        if (data.budget) project.budget = data.budget;
        if (data.manager) project.manager = new mongoose.Types.ObjectId(data.manager);

        await project.save({ session });

        // Equipment Logic
        const EquipmentModel = mongoose.model('Equipment');
        const InventoryLogModel = mongoose.model('InventoryLog');
        const userId = (data as any).userId; // Need to ensure passed from controller

        // 1. Check if Status Changed to COMPLETED or CANCELLED
        if ((project.status === 'COMPLETED' || project.status === 'CANCELLED') && oldProject.status !== project.status) {
            if (project.equipment && project.equipment.length > 0) {
                const eqIds = project.equipment.map((e: any) => e._id || e); // e might be object or id

                await EquipmentModel.updateMany(
                    { _id: { $in: eqIds } },
                    { $set: { status: 'AVAILABLE' }, $unset: { currentProject: 1 } },
                    { session }
                );

                if (userId) {
                    const logs = eqIds.map((eqId: any) => ({
                        equipment: eqId,
                        user: userId,
                        action: 'CHECK_IN',
                        project: project._id,
                        quantityChanged: 0,
                        notes: `Project ${project.status}: ${project.name}`,
                        date: new Date()
                    }));
                    await InventoryLogModel.insertMany(logs, { session });
                }
            }
        }
        // 2. If Project is Active/Pending, handle equipment changes
        else if (data.equipment) { // If equipment was updated
            const oldEqIds = oldProject.equipment.map((e: any) => e.toString());
            const newEqIds = project.equipment.map((e: any) => e.toString());

            const added = newEqIds.filter(id => !oldEqIds.includes(id));
            const removed = oldEqIds.filter(id => !newEqIds.includes(id));

            if (added.length > 0) {
                await EquipmentModel.updateMany(
                    { _id: { $in: added } },
                    { $set: { status: 'IN_USE', currentProject: project._id } },
                    { session }
                );

                if (userId) {
                    const addLogs = added.map((id: string) => ({
                        equipment: id,
                        user: userId,
                        action: 'CHECK_OUT',
                        project: project._id,
                        quantityChanged: 0,
                        notes: `Added to Project: ${project.name}`,
                        date: new Date()
                    }));
                    await InventoryLogModel.insertMany(addLogs, { session });
                }
            }

            if (removed.length > 0) {
                await EquipmentModel.updateMany(
                    { _id: { $in: removed } },
                    { $set: { status: 'AVAILABLE' }, $unset: { currentProject: 1 } },
                    { session }
                );

                if (userId) {
                    const removeLogs = removed.map((id: string) => ({
                        equipment: id,
                        user: userId,
                        action: 'CHECK_IN',
                        project: project._id,
                        quantityChanged: 0,
                        notes: `Removed from Project: ${project.name}`,
                        date: new Date()
                    }));
                    await InventoryLogModel.insertMany(removeLogs, { session });
                }
            }
        }

        return await this.getProjectById(id);
    }

    /**
     * Delete Project
     */
    async deleteProject(id: string): Promise<void> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError('Geçersiz proje ID', 400);
        }

        const project = await Project.findById(id);
        if (!project) {
            throw new AppError('Proje bulunamadı', 404);
        }

        // Model pre-hook handles equipment status reset if needed?
        // Actually, ProjectSchema has a pre 'findOneAndUpdate' hook for status change, 
        // but for delete, we might need to manually free equipment if implicit logic requires it.
        // Let's check schema... Schema doesn't have pre 'deleteOne'.
        // We should ensure equipment is freed.

        if (project.equipment && project.equipment.length > 0) {
            await Equipment.updateMany(
                { _id: { $in: project.equipment } },
                { $set: { status: 'AVAILABLE' }, $unset: { currentProject: 1 } }
            );
        }

        await project.deleteOne();
    }

    /**
     * Get Stats
     */
    async getStats(): Promise<any> {
        const [
            total,
            active,
            completed,
            pending,
            thisMonth
        ] = await Promise.all([
            Project.countDocuments(),
            Project.countDocuments({ status: 'ACTIVE' }),
            Project.countDocuments({ status: 'COMPLETED' }),
            Project.countDocuments({ status: { $in: ['PENDING_APPROVAL', 'PLANNING'] } }),
            Project.countDocuments({
                startDate: {
                    $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
                }
            })
        ]);

        return {
            total,
            active,
            completed,
            pending,
            thisMonth
        };
    }
}

export default new ProjectService();
