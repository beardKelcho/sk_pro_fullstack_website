import { User } from '../models';
import { IUser } from '../models/User';
import mongoose from 'mongoose';
import { AppError } from '../types/common';
import { sendUserInviteEmail } from '../utils/emailService';
import { notifyUser } from '../utils/notificationService';
import logger from '../utils/logger';

export interface PaginatedUsers {
    users: IUser[];
    total: number;
    page: number;
    totalPages: number;
}

export interface CreateUserData {
    name: string;
    email: string;
    password?: string;
    role?: string;
    isActive?: boolean;
    phone?: string;
    address?: string;
    permissions?: string[];
    inviterName?: string;
}

export interface UpdateUserData {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    isActive?: boolean;
    permissions?: string[];
}

class UserService {
    /**
     * List all users with pagination and filtering
     */
    async listUsers(
        page: number = 1,
        limit: number = 10,
        sort: string = '-createdAt',
        search?: string,
        role?: string
    ): Promise<PaginatedUsers> {
        const filters: mongoose.FilterQuery<IUser> = {};

        if (role) {
            filters.role = role;
        }

        if (search) {
            filters.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const sortOrder = sort.startsWith('-') ? -1 : 1;
        const sortField = sort.startsWith('-') ? sort.substring(1) : sort;

        const [users, total] = await Promise.all([
            User.find(filters)
                .select('-password')
                .sort({ [sortField]: sortOrder })
                .skip(skip)
                .limit(limit),
            User.countDocuments(filters)
        ]);

        return {
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * Get user by ID
     */
    async getUserById(id: string): Promise<IUser> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError('Geçersiz kullanıcı ID', 400);
        }

        const user = await User.findById(id).select('-password');
        if (!user) {
            throw new AppError('Kullanıcı bulunamadı', 404);
        }

        return user;
    }

    /**
     * Create new user
     */
    async createUser(data: CreateUserData): Promise<IUser> {
        // Validate required fields
        if (!data.name || !data.email || !data.password) {
            throw new AppError('İsim, email ve şifre gereklidir', 400);
        }

        // Check duplicate email
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            throw new AppError('Bu email adresi zaten kullanılıyor', 400);
        }

        const user = await User.create({
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role || 'TEKNISYEN',
            isActive: data.isActive ?? true,
            phone: data.phone,
            address: data.address,
            permissions: data.permissions || [],
        });

        // Send Invite Email
        // Warning: password is now hashed in user object, so we must use the original password passed in data
        // CAUTION: passing raw password. This is legacy behavior found in controller.
        const inviterName = data.inviterName || 'Sistem';

        try {
            await sendUserInviteEmail(
                user.email,
                user.name,
                inviterName,
                user.role,
                data.password // Use original password
            );
        } catch (err: unknown) {
            logger.error('Kullanıcı davet email gönderme hatası:', err);
            // Non-blocking
        }

        try {
            await notifyUser(
                user._id,
                'USER_INVITED',
                'SK Production\'a Hoş Geldiniz!',
                `${inviterName} sizi SK Production sistemine ${user.role} rolü ile ekledi.`,
                { role: user.role },
                false
            );
        } catch (err: unknown) {
            logger.error('Hoş geldin bildirimi gönderme hatası:', err);
        }

        return user;
    }

    /**
     * Update user
     */
    async updateUser(id: string, data: UpdateUserData): Promise<IUser> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError('Geçersiz kullanıcı ID', 400);
        }

        const user = await User.findById(id);
        if (!user) {
            throw new AppError('Kullanıcı bulunamadı', 404);
        }

        if (data.name) user.name = data.name;
        if (data.email) user.email = data.email;
        if (data.role) user.role = data.role as IUser['role'];
        if (data.isActive !== undefined) user.isActive = data.isActive;
        if (data.permissions !== undefined) user.permissions = data.permissions;

        if (data.password && data.password.trim().length > 0) {
            if (data.password.length < 6) {
                throw new AppError('Şifre en az 6 karakter olmalıdır', 400);
            }
            user.password = data.password;
        }

        await user.save();
        return user;
    }

    /**
     * Delete user
     */
    async deleteUser(id: string, requestUserId?: string): Promise<void> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError('Geçersiz kullanıcı ID', 400);
        }

        if (requestUserId && requestUserId === id) {
            throw new AppError('Kendi hesabınızı silemezsiniz', 400);
        }

        const user = await User.findById(id);
        if (!user) {
            throw new AppError('Kullanıcı bulunamadı', 404);
        }

        await user.deleteOne();
    }
}

export default new UserService();
