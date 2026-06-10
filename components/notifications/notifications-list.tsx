"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/actions/notifications";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

export function NotificationsList({ initial }: { initial: NotificationItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);

  async function open(item: NotificationItem) {
    if (!item.readAt) {
      await markNotificationRead(item.id);
      setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, readAt: new Date().toISOString() } : entry)));
    }
    if (item.link) {
      router.push(item.link);
    }
  }

  async function markAll() {
    await markAllNotificationsRead();
    setItems((prev) => prev.map((entry) => ({ ...entry, readAt: entry.readAt ?? new Date().toISOString() })));
  }

  if (items.length === 0) {
    return (
      <div className="surface p-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <Bell size={28} className="text-slate-400" />
        </div>
        <p className="text-sm font-bold text-slate-500">Aucune notification pour le moment.</p>
      </div>
    );
  }

  const hasUnread = items.some((item) => !item.readAt);

  return (
    <div className="space-y-4">
      {hasUnread && (
        <div className="flex justify-end">
          <button onClick={markAll} className="bento-btn">
            <CheckCheck size={16} /> Tout marquer comme lu
          </button>
        </div>
      )}
      <div className="space-y-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => open(item)}
            className={`block w-full rounded-[14px] border-2 p-4 text-left transition-colors ${
              item.readAt ? "border-slate-200 bg-white" : "border-indigo-300 bg-indigo-50"
            } hover:border-indigo-500`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-slate-900">{item.title}</p>
                {item.body && <p className="mt-1 text-sm font-semibold text-slate-500">{item.body}</p>}
              </div>
              {!item.readAt && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-rose-500" aria-label="Non lue" />}
            </div>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              {new Date(item.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
