import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: ' aysuyildizcaldiran@gmail.com' },
        password: { label: 'Şifre', type: 'password' },
      },
      async authorize(credentials) {
        // Burada gerçek kullanıcı doğrulama yapılmalı
        if (
          credentials?.email === 'aysuyildizcaldiran@gmail.com' &&
          credentials?.password === '$c1cU02v1c@9t9YvX^qOVGL@hxDJji'
        ) {
          return { id: '1', name: 'Test User', email: 'aysuyildizcaldiran@gmail.com' };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 