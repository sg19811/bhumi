import type { Metadata } from "next";
import Header from "@/app/components/Header";
import { supabaseAdmin as db } from "@/app/lib/supabase-server";
import type { AcrehubOwnedChannel } from "@/app/lib/growth-types";
import ChannelRecruitmentCard from "@/app/components/growth/ChannelRecruitmentCard";

export const metadata: Metadata = {
  title: "AcreHub Channels — new land listings on Telegram & WhatsApp",
  description:
    "Join AcreHub's free channels to get new agricultural land and farm-plot listings for your state and district, the moment they're posted.",
};

export const dynamic = "force-dynamic";

const GROUPS: { kinds: AcrehubOwnedChannel["channel_kind"][]; title: string }[] = [
  { kinds: ["telegram_channel", "telegram_group"], title: "Telegram" },
  { kinds: ["whatsapp_community", "whatsapp_community_subgroup"], title: "WhatsApp Communities" },
  { kinds: ["email_list"], title: "Email updates" },
];

export default async function ChannelsPage() {
  const { data } = await db
    .from("acrehub_owned_channels")
    .select("*")
    .eq("status", "active")
    .order("name");
  const channels = (data ?? []) as AcrehubOwnedChannel[];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white text-gray-900">
      <Header />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-3xl font-bold">AcreHub channels</h1>
        <p className="mt-2 text-gray-600">
          Get every new land and farm-plot listing for your area the moment it&apos;s posted — free, no spam, leave anytime.
        </p>

        {channels.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
            Our channels are launching soon. Check back shortly, or{" "}
            <a href="/buy" className="font-medium text-green-800 hover:underline">post what you&apos;re looking for</a> and we&apos;ll reach out.
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {GROUPS.map((g) => {
              const inGroup = channels.filter((c) => g.kinds.includes(c.channel_kind));
              if (inGroup.length === 0) return null;
              return (
                <section key={g.title}>
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">{g.title}</h2>
                  <div className="space-y-3">
                    {inGroup.map((c) => (
                      <ChannelRecruitmentCard key={c.id} channel={c} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
