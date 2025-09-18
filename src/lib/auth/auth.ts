import { authConfig, COOKIE_CONFIG } from "@/auth.config";
import { prisma } from "@/lib/database/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "database",
  },
  cookies: COOKIE_CONFIG,
});
