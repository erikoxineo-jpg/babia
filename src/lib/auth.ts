import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email,
            isActive: true,
          },
          include: {
            tenant: {
              select: {
                id: true,
                slug: true,
                name: true,
                status: true,
                onboardingStep: true,
                onboardingCompleted: true,
                settings: { select: { viewMode: true } },
              },
            },
          },
        });

        if (!user || user.tenant.status !== "active") {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          tenantSlug: user.tenant.slug,
          tenantName: user.tenant.name,
          onboardingStep: user.tenant.onboardingStep,
          onboardingCompleted: user.tenant.onboardingCompleted,
          viewMode: user.tenant.settings?.viewMode ?? "solo",
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as Record<string, unknown>;
        token.userId = u.id;
        token.role = u.role;
        token.tenantId = u.tenantId;
        token.tenantSlug = u.tenantSlug;
        token.tenantName = u.tenantName;
        token.onboardingStep = u.onboardingStep;
        token.onboardingCompleted = u.onboardingCompleted;
        token.viewMode = u.viewMode;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        const s = session.user as unknown as Record<string, unknown>;
        s.id = token.userId;
        s.role = token.role;
        s.tenantId = token.tenantId;
        s.tenantSlug = token.tenantSlug;
        s.tenantName = token.tenantName;
        s.onboardingStep = token.onboardingStep;
        s.onboardingCompleted = token.onboardingCompleted;
        s.viewMode = token.viewMode;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
};
