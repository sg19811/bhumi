// Pure vote tally + advisory threshold check. The result is advisory only — the
// real decision is recorded by the admin in the proposal's decision_notes.

export type VoteOption = { key: string; label: string };

export function tallyVotes(votes: { vote_value: string }[], options: VoteOption[]): Record<string, number> {
  const tally: Record<string, number> = {};
  for (const o of options) tally[o.key] = 0;
  for (const v of votes) if (v.vote_value in tally) tally[v.vote_value] += 1;
  return tally;
}

// Indicative outcome for Yes/No-style proposals. Returns the leading option key,
// or 'inconclusive'. `threshold` mirrors the schema's threshold_required.
export function indicativeOutcome(
  tally: Record<string, number>,
  threshold: string,
  totalMembers: number
): { leader: string; passes: boolean } {
  const entries = Object.entries(tally);
  const totalVotes = entries.reduce((s, [, n]) => s + n, 0);
  if (totalVotes === 0) return { leader: "inconclusive", passes: false };
  const leader = entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
  const denom = totalMembers > 0 ? totalMembers : totalVotes;
  const yes = tally["yes"] ?? 0;
  let passes = false;
  if (threshold === "unanimous") passes = yes === totalMembers && totalMembers > 0;
  else if (threshold === "supermajority_67") passes = yes / denom >= 0.67;
  else if (threshold === "admin_decision") passes = false; // admin decides regardless
  else passes = yes / denom > 0.5; // simple_majority
  return { leader, passes };
}
