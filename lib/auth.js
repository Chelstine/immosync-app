import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail } from "./airtable";
import bcrypt from "bcryptjs";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await getUserByEmail(credentials.email);

                if (!user) {
                    // User not found
                    return null;
                }

                const isValid = await bcrypt.compare(credentials.password, user.Password);

                if (!isValid) {
                    return null;
                }

                return {
                    id: user.id,
                    name: user.Name,
                    email: user.Email,
                };
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
        signOut: '/login',
        error: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
