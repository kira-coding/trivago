import NextAuth, { DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcrypt";
import { prisma } from "./prisma";

// Extend the User type to include 'role'
declare module "next-auth" {
    interface User {
        role?: string;
    }
    interface Session {
        user?: {
            role?: string;
        } & DefaultSession["user"];
    }
}
export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
    },
    providers: [Credentials({
        name: "Credentials",
        credentials: {
            email: { label: "Email", type: "text" },
            password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) return null;

            const user = await prisma.user.findUnique({
                where: { email: typeof credentials.email === "string" ? credentials.email : "" },
            });

            if (!user || !user.password) return null;

            const isValid = await bcrypt.compare(
                typeof credentials.password === "string" ? credentials.password : "",
                user.password
            );

            if (!isValid) return null;

            return user;
        },
    }),],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
            }
            return session;
        },
    },


})