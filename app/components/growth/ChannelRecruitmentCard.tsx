import type { AcrehubOwnedChannel } from "@/app/lib/growth-types";

const KIND_META: Record<string, { icon: string; label: string }> = {
  telegram_channel: { icon: "📣", label: "Telegram channel" },
  telegram_group: { icon: "💬", label: "Telegram group" },
  whatsapp_community: { icon: "🟢", label: "WhatsApp Community" },
  whatsapp_community_subgroup: { icon: "🟢", label: "WhatsApp group" },
  email_list: { icon: "✉️", label: "Email updates" },
};

// Compact "join an AcreHub channel" card. Presentational (no client JS) so it
// can drop into any server page. See growth-engine-spec-aggressive-v2.md §1.8.
export default function ChannelRecruitmentCard({
  channel,
}: {
  channel: Pick<AcrehubOwnedChannel, "name" | "channel_kind" | "description" | "public_join_url" | "member_count">;
}) {
  const meta = KIND_META[channel.channel_kind] ?? { icon: "🔔", label: "Channel" };
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-50 text-xl">{meta.icon}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-gray-900">{channel.name}</p>
        <p className="truncate text-sm text-gray-500">
          {channel.description || meta.label}
          {channel.member_count > 0 && <span className="text-gray-400"> · {channel.member_count.toLocaleString("en-IN")} members</span>}
        </p>
      </div>
      {channel.public_join_url && (
        <a
          href={channel.public_join_url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-800"
        >
          Join
        </a>
      )}
    </div>
  );
}
