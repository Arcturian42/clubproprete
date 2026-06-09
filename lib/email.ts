// Service d'email — branchable sur Resend / SendGrid / SMTP
// En dev, les emails sont loggués dans la console.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL ?? "noreply@clubproprete.fr";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendEmail(payload: EmailPayload): Promise<{ success: boolean }> {
  if (!RESEND_API_KEY) {
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
        <h1 style="color: #0f172a;">Bienvenue ${firstName} !</h1>
        <p>Votre compte Club Propreté a été créé avec succès.</p>
        <p>Connectez-vous dès maintenant pour compléter votre profil et découvrir nos outils.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3456"}/connexion" 
           style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          Se connecter
        </a>
      </div>
    `,
    text: `Bienvenue ${firstName} ! Votre compte Club Propreté a été créé. Connectez-vous sur ${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3456"}/connexion`,
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
        <p><strong>${candidateName}</strong> a postulé à votre offre <strong>${jobTitle}</strong>.</p>
        <p>Connectez-vous à votre tableau de bord pour consulter les détails.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3456"}/dashboard" 
           style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          Voir le tableau de bord
        </a>
      </div>
    `,
    text: `${candidateName} a postulé à ${jobTitle}. Connectez-vous sur ${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3456"}/dashboard`,
  });
}

export async function sendNewJobNotification(to: string, jobTitle: string) {
  return sendEmail({
    to,
    subject: "Votre offre est en attente de validation",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0f172a;">Offre soumise</h1>
        <p>Votre offre <strong>${jobTitle}</strong> a été soumise et est en attente de validation par notre équipe.</p>
        <p>Vous serez notifié(e) dès qu'elle sera publiée.</p>
      </div>
    `,
    text: `Votre offre ${jobTitle} est en attente de validation.`,
  });
}
