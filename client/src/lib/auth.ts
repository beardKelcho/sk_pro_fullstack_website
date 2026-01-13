/**
 * Next-Auth konfigürasyonu
 * Bu dosya, kimlik doğrulama ve yetkilendirme işlemleri için kullanılacak
 */

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { db } from './db';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/error',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Şifre', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Burada Prisma yerine bir simülasyon yapalım, çünkü henüz Prisma kurulumu yapılmadı
          // Gerçek projede bu kısım, db üzerinden kullanıcı sorgusunu yapacak
          
          // Simülasyon için test kullanıcısı
          const testUser = {
            id: '1',
            name: 'Admin User',
            email: 'admin@skproduction.com',
            password: '$2a$10$GlJ.xOsV9Zc6eLsrtSdXXek4miWb.MZdVJmjiMmULYuDdcUT8BNQC', // 'password123' kodlanmış hali
            role: 'ADMIN',
          };
          
          if (credentials.email !== testUser.email) {
            return null;
          }
          
          const isPasswordValid = await compare(credentials.password, testUser.password);
          
          if (!isPasswordValid) {
            return null;
          }
          
          return {
            id: testUser.id,
            name: testUser.name,
            email: testUser.email,
            role: testUser.role,
          };
        } catch (error) {
          console.error('Yetkilendirme hatası:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'USER';
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 