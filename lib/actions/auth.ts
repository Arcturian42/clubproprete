"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { signIn } from "@/auth";
import { sendWelcomeEmail, sendEmailVerificationEmail } from "@/lib/email";
import { createEmailVerificationToken } from "@/lib/email-verification";
import { rateLimitByIp } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";

const signupSchema = z.object({
  email: z.string().email("Veuillez saisir un email valide."),
  password: z
    .string()
    .min(10, "Le mot de passe doit contenir au moins 10 caractères.")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule.")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule.")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre.")
    .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un symbole."),
  firstName: z.string().min(1, "Le prénom est obligatoire."),
  lastName: z.string().min(1, "Le nom est obligatoire."),
  phone: z.string().optional(),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "Vous devez accepter les conditions." }),
  }),
  privacyAccepted: z.literal(true, {
    errorMap: () => ({ message: "Vous devez accepter la politique de confidentialité." }),
  }),
});

export type SignupInput = z.infer<typeof signupSchema>;

// L'inscription crée uniquement un compte utilisateur neutre. Le choix des
// fonctionnalités (fiche société, fiche fournisseur, centre de formation,
// profil candidat/indépendant) se fait ensuite dans l'onboarding : un même
// compte peut cumuler plusieurs fiches par-dessus son profil utilisateur.
export async function registerUser(data: SignupInput) {
  try {
    const ip = await getClientIp();
    const limit = await rateLimitByIp(ip, "register", 5, 3_600_000);
    if (!limit.success) {
      return { success: false, message: "Trop de tentatives. Veuillez réessayer plus tard." };
    }

    const parsed = signupSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { email, password, firstName, lastName, phone } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, errors: { email: ["Cet email est déjà utilisé."] } };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          phone: phone || null,
          mainRole: "registered_user",
          // Le compte personnel n'est PAS auto-vérifié : un email de vérification
          // est envoyé. L'utilisateur peut se connecter mais ne peut pas publier
          // d'offre ni accéder aux actions sensibles tant que son email n'est pas
          // vérifié (isVerifiedPersonalAccount utilise emailVerified).
          emailVerified: false,
          termsAcceptedAt: new Date(),
          privacyAcceptedAt: new Date(),
        },
      });

      await tx.userProfile.create({
        data: {
          userId: createdUser.id,
          profileType: "registered_user",
          completionScore: 15,
          verificationStatus: "draft",
          associationStatus: "not_applicable",
          // Profil membre visible par défaut : chaque inscrit a une page
          // /membres/[id] consultable. L'onboarding repasse les chercheurs
          // d'emploi en privé, et le réglage reste modifiable dans /profil.
          visibility: "public",
        },
      });

      return createdUser;
    });

    await sendWelcomeEmail(user.email, firstName);

    // Envoie un lien de vérification d'email (asynchrone, ne bloque pas l'inscription)
    try {
      const token = await createEmailVerificationToken(user.id);
      await sendEmailVerificationEmail(user.email, firstName, token);
    } catch (verifyErr) {
      console.error("Email verification token/send failed:", verifyErr);
    }

    return { success: true, userId: user.id };
  } catch (err) {
    console.error("registerUser error:", err);
    return { success: false, message: "Une erreur est survenue. Veuillez réessayer." };
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const ip = await getClientIp();
    const limit = await rateLimitByIp(ip, "login", 10, 300_000);
    if (!limit.success) {
      return { success: false, message: "Trop de tentatives. Veuillez réessayer plus tard." };
    }
    await signIn("credentials", { email, password, redirect: false });
    return { success: true };
  } catch {
    return { success: false, message: "Email ou mot de passe incorrect." };
  }
}
