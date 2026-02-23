import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import connectDB from "./mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        await connectDB();
        const user = await User.findOne({ email: credentials.email });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          roles: user.roles,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.roles = (user as any).roles || ['investor', 'entrepreneur'];
      }
      // On every session check, refresh the role from DB
      // This ensures role changes (e.g. promotions) take effect without re-login
      if (token.id && (trigger === 'update' || !user)) {
        try {
          await connectDB();
          // Try by _id first; fall back to email for Google IDs that aren't valid ObjectIds
          let dbUser = await User.findById(token.id).select('roles').lean();
          if (!dbUser && token.email) {
            dbUser = await User.findOne({ email: token.email }).select('roles _id').lean();
            if (dbUser) {
              // Fix token.id to use the correct MongoDB _id going forward
              token.id = (dbUser as any)._id.toString();
            }
          }
          if (dbUser) {
            token.roles = (dbUser as any).roles || ['investor', 'entrepreneur'];
          }
        } catch {
          // Silently keep existing role if DB lookup fails
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.id;
        (session.user as any).roles = token.roles;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDB();
        let dbUser = await User.findOne({ email: user.email });
        if (!dbUser) {
          dbUser = await User.create({
            name: user.name || "Unknown",
            email: user.email!,
            image: user.image || undefined,
            roles: ["investor", "entrepreneur"],
          });
        }
        // Propagate MongoDB _id back so the jwt callback receives the correct ID
        user.id = dbUser._id.toString();
        (user as any).roles = dbUser.roles;
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
