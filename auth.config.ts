import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: process.env.AUTH_TRUST_HOST !== "false",
  pages: {
    signIn: "/connexion",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.associationMember = user.associationMember;
        token.organization = user.organization;
        token.phone = user.phone;
      }
      // Rafraîchissement de la session sans reconnexion (ex. changement de nom
      // dans /profil) : on fusionne les champs transmis à update() dans le token.
      if (trigger === "update" && session && typeof session === "object") {
        const data = session as {
          firstName?: string;
          lastName?: string;
          phone?: string;
          organization?: string | null;
        };
        if (typeof data.firstName === "string") token.firstName = data.firstName;
        if (typeof data.lastName === "string") token.lastName = data.lastName;
        if (typeof data.phone === "string") token.phone = data.phone;
        if ("organization" in data) token.organization = data.organization ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.associationMember = token.associationMember as boolean;
        session.user.organization = token.organization as string | null;
        session.user.phone = token.phone as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;

      // Seules les zones privées exigent une session ; toute autre URL reste
      // publique afin que les pages inconnues affichent la vraie 404.
      const protectedPrefixes = [
        "/dashboard",
        "/admin",
        "/profil",
        "/notifications",
        "/candidats",
        "/emploi/nouvelle-offre",
        "/api/admin",
        "/api/upload",
        "/api/user-company",
      ];
      const isProtected = protectedPrefixes.some((prefix) => path.startsWith(prefix));

      if (!isProtected) return true;
      if (!isLoggedIn) return false;

      return true;
    },
  },
} satisfies NextAuthConfig;
