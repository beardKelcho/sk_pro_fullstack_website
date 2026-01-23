import jwt from 'jsonwebtoken';
import { Session, User } from '../models';
import { IUser } from '../models/User';
import { AppError } from '../types/common';
import { createTokenHash, generateTokenPair, TokenPair, JWT_REFRESH_SECRET } from '../utils/authTokens';
import logger from '../utils/logger';

export interface LoginResult {
    user: IUser;
    tokens?: TokenPair;
    requires2FA?: boolean;
}

export interface RefreshResult {
    accessToken: string;
    refreshToken: string;
}

class AuthService {
    /**
     * Authenticate user with email/phone and password
     */
    async login(identifier: string, password: string, ip: string, userAgent: string): Promise<LoginResult> {
        const identifierRaw = identifier.trim();
        const isEmail = identifierRaw.includes('@');
        const identifierEmail = isEmail ? identifierRaw.toLowerCase() : '';
        const identifierPhone = !isEmail ? identifierRaw.replace(/[^\d+]/g, '') : '';

        // Find user
        const user = await User.findOne({
            $or: [
                ...(identifierEmail ? [{ email: identifierEmail }] : []),
                ...(identifierPhone ? [{ phone: identifierPhone }, { phone: identifierRaw }] : []),
            ],
        });

        if (!user) {
            throw new AppError('Geçersiz email ya da şifre', 401);
        }

        if (!user.isActive) {
            throw new AppError('Hesabınız devre dışı bırakılmış', 401);
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new AppError('Geçersiz email ya da şifre', 401);
        }

        // 2FA Check
        if (user.is2FAEnabled) {
            return { user, requires2FA: true };
        }

        // Generate Tokens
        const tokens = generateTokenPair(user);

        // Create Session
        try {
            await Session.create({
                userId: user._id,
                token: createTokenHash(tokens.accessToken),
                refreshToken: createTokenHash(tokens.refreshToken),
                deviceInfo: {
                    userAgent: userAgent,
                    ipAddress: ip,
                },
                lastActivity: new Date(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                isActive: true,
            });
        } catch (sessionError) {
            // Non-blocking but log it
            logger.warn('Session create failed:', sessionError);
        }

        return { user, tokens };
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshTokenRaw: string): Promise<RefreshResult> {
        // Verify token
        let decoded: jwt.JwtPayload;
        try {
            decoded = jwt.verify(refreshTokenRaw, JWT_REFRESH_SECRET) as jwt.JwtPayload;
        } catch (error: unknown) {
            throw new AppError('Geçersiz veya süresi dolmuş token', 401);
        }

        // Check Session
        const refreshHash = createTokenHash(refreshTokenRaw);
        const session = await Session.findOne({
            userId: decoded.id,
            refreshToken: refreshHash,
            isActive: true,
            expiresAt: { $gt: new Date() },
        });

        if (!session) {
            throw new AppError('Geçersiz oturum', 401);
        }

        const user = await User.findById(decoded.id);
        if (!user || !user.isActive) {
            throw new AppError('Kullanıcı bulunamadı veya pasif', 401);
        }

        // Generate new pair
        const tokens = generateTokenPair(user);

        // Rotate Session
        try {
            await Session.updateOne(
                { _id: session._id },
                {
                    token: createTokenHash(tokens.accessToken),
                    refreshToken: createTokenHash(tokens.refreshToken),
                    lastActivity: new Date(),
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                }
            );
        } catch (error) {
            logger.warn('Session rotation failed:', error);
        }

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        };
    }

    /**
     * Logout
     */
    async logout(refreshTokenRaw?: string): Promise<void> {
        if (refreshTokenRaw) {
            const refreshHash = createTokenHash(refreshTokenRaw);
            await Session.updateMany(
                { refreshToken: refreshHash, isActive: true },
                { isActive: false }
            );
        }
    }

    /**
     * Get Profile
     */
    async getProfile(userId: string): Promise<IUser> {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            throw new AppError('Kullanıcı bulunamadı', 404);
        }
        return user;
    }

    /**
     * Update Profile
     */
    async updateProfile(userId: string, data: { name?: string; email?: string }): Promise<IUser> {
        const updateData: Record<string, unknown> = {};
        if (data.name) updateData.name = data.name;
        if (data.email) updateData.email = data.email;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            throw new AppError('Kullanıcı bulunamadı', 404);
        }
        return updatedUser;
    }

    /**
     * Change Password
     */
    async changePassword(userId: string, current: string, nextPass: string): Promise<void> {
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('Kullanıcı bulunamadı', 404);
        }

        const isValid = await user.comparePassword(current);
        if (!isValid) {
            throw new AppError('Mevcut şifre yanlış', 401);
        }

        user.password = nextPass;
        await user.save();
    }
}

export default new AuthService();
