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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.associationMember = user.associationMember;
        token.organization = user.organization;
        token.phone = user.phone;
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
      const role = auth?.user?.role as string | undefined;
      const path = nextUrl.pathname;

      if (path.startsWith("/emploi/nouvelle-offre")) {
        if (!isLoggedIn) return false;
        return true;
      }

      const isPublic =
        path === "/" ||
        path.startsWith("/annuaire") ||
        path.startsWith("/emploi") ||
        path.startsWith("/formations") ||
        path.startsWith("/ressources") ||
        path.startsWith("/independants") ||
        path.startsWith("/association") ||
        path.startsWith("/membres") ||
        path.startsWith("/connexion") ||
        path.startsWith("/inscription") ||
        path.startsWith("/mot-de-passe-oublie") ||
        path.startsWith("/reinitialiser-mot-de-passe") ||
        path.startsWith("/onboarding") ||
        path.startsWith("/sous-traitance") ||
        path.startsWith("/mentions-legales") ||
        path.startsWith("/cgu") ||
        path.startsWith("/politique-confidentialite") ||
        path.startsWith("/api/auth");

      if (isPublic) return true;
      if (!isLoggedIn) return false;

      if (path.startsWith("/admin")) {
        return role === "admin" || role === "super_admin";
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
