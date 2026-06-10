import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageShell } from "@/components/page-shell";
import { NotificationsList } from "@/components/notifications/notifications-list";
import { getMyNotifications } from "@/lib/actions/notifications";

export const metadata = {
  title: "Notifications — Club Propreté",
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/connexion?callbackUrl=/notifications");
  }

  const notifications = await getMyNotifications();
  const initial = notifications.map((notification) => ({
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    link: notification.link,
    readAt: notification.readAt ? notification.readAt.toISOString() : null,
    createdAt: notification.createdAt.toISOString(),
  }));

  return (
    <PageShell
      eyebrow="Espace connecté"
      title="Notifications"
      description="Suivez les décisions de modération, les candidatures reçues et l'activité de vos espaces."
    >
      <div className="mx-auto max-w-2xl">
        <NotificationsList initial={initial} />
      </div>
    </PageShell>
  );
}
