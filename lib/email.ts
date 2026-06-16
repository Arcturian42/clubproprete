// Service d'email — branchable sur Resend / SendGrid / SMTP
// En dev, les emails sont loggués dans la console.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL ?? "noreply@clubproprete.fr";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Échappe les caractères HTML pour empêcher toute injection (noms, titres, villes…
 * sont des données fournies par l'utilisateur et ne doivent jamais être interpolées
 * brutes dans le HTML d'un email).
 */
export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendEmail(payload: EmailPayload): Promise<{ success: boolean }> {
  if (!RESEND_API_KEY) {
    if (process.env.NODE_ENV === "production") {
      // En production, l'absence de clé est une erreur de configuration : les emails
      // ne partent pas. On le signale clairement plutôt que de le masquer.
      console.warn(
        `[EMAIL] RESEND_API_KEY manquante — email NON envoyé à ${payload.to} ("${payload.subject}"). Configurez RESEND_API_KEY.`
      );
      return { success: false };
    }
    console.log("[EMAIL-DEV] To:", payload.to);
    console.log("[EMAIL-DEV] Subject:", payload.subject);
    console.log("[EMAIL-DEV] HTML:", payload.html.slice(0, 200) + "...");
    return { success: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Club Propreté <${FROM_EMAIL}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });

    if (!res.ok) {
      console.error("Email send failed:", await res.text());
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    console.error("Email send error:", err);
    return { success: false };
  }
}

export async function sendWelcomeEmail(to: string, firstName: string) {
  return sendEmail({
    to,
    subject: "Bienvenue sur Club Propreté",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0f172a;">Bienvenue ${escapeHtml(firstName)} !</h1>
        <p>Votre compte Club Propreté a été créé avec succès.</p>
        <p>Connectez-vous dès maintenant pour compléter votre profil et découvrir nos outils.</p>
        <a href="${APP_URL}/connexion" 
           style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          Se connecter
        </a>
      </div>
    `,
    text: `Bienvenue ${firstName} ! Votre compte Club Propreté a été créé. Connectez-vous sur ${APP_URL}/connexion`,
  });
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  return sendEmail({
    to,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0f172a;">Réinitialisation du mot de passe</h1>
        <p>Vous avez demandé à réinitialiser votre mot de passe Club Propreté.</p>
        <p>Ce lien est valable 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
        <a href="${resetLink}"
           style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          Choisir un nouveau mot de passe
        </a>
        <p style="margin-top: 16px; color: #64748b; font-size: 12px;">Ou copiez ce lien : ${resetLink}</p>
      </div>
    `,
    text: `Réinitialisez votre mot de passe (valable 1h) : ${resetLink}`,
  });
}

export async function sendAdminNotification(subject: string, html: string) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@clubproprete.test";
  return sendEmail({
    to: adminEmail,
    subject: `[Club Propreté] ${subject}`,
    html,
  });
}

export async function sendJobApplicationNotification(
  to: string,
  candidateName: string,
  jobTitle: string
) {
  return sendEmail({
    to,
    subject: `Nouvelle candidature pour ${jobTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0f172a;">Nouvelle candidature</h1>
        <p><strong>${escapeHtml(candidateName)}</strong> a postulé à votre offre <strong>${escapeHtml(jobTitle)}</strong>.</p>
        <p>Connectez-vous à votre tableau de bord pour consulter les détails.</p>
        <a href="${APP_URL}/dashboard" 
           style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          Voir le tableau de bord
        </a>
      </div>
    `,
    text: `${candidateName} a postulé à ${jobTitle}. Connectez-vous sur ${APP_URL}/dashboard`,
  });
}

export async function sendNewJobNotification(to: string, jobTitle: string) {
  return sendEmail({
    to,
    subject: "Votre offre est en attente de validation",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0f172a;">Offre soumise</h1>
        <p>Votre offre <strong>${escapeHtml(jobTitle)}</strong> a été soumise et est en attente de validation par notre équipe.</p>
        <p>Vous serez notifié(e) dès qu'elle sera publiée.</p>
      </div>
    `,
    text: `Votre offre ${jobTitle} est en attente de validation.`,
  });
}

export async function sendNewMissionNotification(to: string, missionTitle: string, city: string) {
  return sendEmail({
    to,
    subject: `Votre mission "${missionTitle}" est publiée`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0f172a;">Mission publiée</h1>
        <p>Votre mission <strong>${escapeHtml(missionTitle)}</strong> (${escapeHtml(city)}) a été publiée sur le réseau Club Propreté.</p>
        <p>Les membres de l'association peuvent maintenant y candidater.</p>
        <a href="${APP_URL}/association" 
           style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          Voir mes missions
        </a>
      </div>
    `,
    text: `Votre mission ${missionTitle} (${city}) est publiée.`,
  });
}

export async function sendSubcontractingApplicationNotification(
  to: string,
  candidateName: string,
  missionTitle: string,
  city: string
) {
  return sendEmail({
    to,
    subject: `Nouvelle candidature pour "${missionTitle}"`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0f172a;">Nouvelle candidature</h1>
        <p><strong>${escapeHtml(candidateName)}</strong> a candidaté à votre mission <strong>${escapeHtml(missionTitle)}</strong> (${escapeHtml(city)}).</p>
        <p>Connectez-vous à votre espace association pour consulter les détails et contacter le candidat.</p>
        <a href="${APP_URL}/association" 
           style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          Voir mes missions
        </a>
      </div>
    `,
    text: `${candidateName} a candidaté à ${missionTitle} (${city}). Connectez-vous sur ${APP_URL}/association`,
  });
}

export async function sendAssociationMembershipRequestNotification(
  to: string,
  candidateName: string,
  candidateEmail: string
) {
  return sendEmail({
    to,
    subject: `Nouvelle demande d'adhésion — ${candidateName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0f172a;">Nouvelle demande d'adhésion</h1>
        <p><strong>${escapeHtml(candidateName)}</strong> (${escapeHtml(candidateEmail)}) souhaite rejoindre l'association Club Propreté.</p>
        <p>Connectez-vous au back-office pour valider ou refuser cette demande.</p>
        <a href="${APP_URL}/admin" 
           style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          Accéder à l'admin
        </a>
      </div>
    `,
    text: `${candidateName} (${candidateEmail}) demande à rejoindre l'association.`,
  });
}

export async function sendEmailVerificationEmail(to: string, firstName: string, token: string) {
  const link = `${APP_URL}/verification-email?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to,
    subject: "Vérifiez votre adresse email — Club Propreté",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0f172a;">Bonjour ${escapeHtml(firstName)},</h1>
        <p>Merci de votre inscription sur Club Propreté. Pour activer votre compte, veuillez confirmer votre adresse email en cliquant sur le lien ci-dessous :</p>
        <a href="${link}" 
           style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          Vérifier mon email
        </a>
        <p style="margin-top: 16px; color: #64748b; font-size: 12px;">Ce lien est valable 24 heures. Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.</p>
        <p style="margin-top: 8px; color: #64748b; font-size: 12px;">Ou copiez ce lien : ${link}</p>
      </div>
    `,
    text: `Bonjour ${firstName}, merci de votre inscription. Vérifiez votre email (valable 24h) : ${link}`,
  });
}
