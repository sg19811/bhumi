// Pure expense-allocation math. Splits an expense across members by the chosen
// method and returns the rupee amount each member bears (rounded; remainder goes
// to the first member so the parts sum to the total).

export type AllocMember = { id: string; soft_commitment_amount?: number | null };
export type AllocMethod = "equal" | "by_share" | "specific_members" | "custom";

export function allocateExpense(
  amount: number,
  members: AllocMember[],
  method: AllocMethod,
  details?: { memberIds?: string[]; custom?: Record<string, number> }
): Record<string, number> {
  const out: Record<string, number> = {};
  if (!(amount > 0) || members.length === 0) return out;

  if (method === "custom" && details?.custom) {
    for (const m of members) out[m.id] = Math.round(details.custom[m.id] ?? 0);
    return out;
  }

  let pool = members;
  if (method === "specific_members" && details?.memberIds?.length) {
    pool = members.filter((m) => details.memberIds!.includes(m.id));
  }
  if (pool.length === 0) return out;

  if (method === "by_share") {
    const total = pool.reduce((s, m) => s + (m.soft_commitment_amount ?? 0), 0);
    if (total > 0) {
      let assigned = 0;
      pool.forEach((m, i) => {
        const share = i === pool.length - 1 ? amount - assigned : Math.round((amount * (m.soft_commitment_amount ?? 0)) / total);
        out[m.id] = share; assigned += share;
      });
      return out;
    }
    // fall through to equal if no share data
  }

  // equal (default / fallback)
  const per = Math.floor(amount / pool.length);
  let assigned = 0;
  pool.forEach((m, i) => { const v = i === pool.length - 1 ? amount - assigned : per; out[m.id] = v; assigned += v; });
  return out;
}
