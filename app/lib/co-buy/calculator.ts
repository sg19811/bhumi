// Contribution calculator — pure, testable, no UI. Given the total deal and a
// buyer's budget, estimate their share. Indicative only; the real split is set
// by the registered documents, not this tool.

export type ContributionInput = {
  totalPrice: number; // total parcel price (₹)
  totalAcres: number; // total parcel size in acres
  buyerBudget: number; // what this buyer can put in (₹)
  targetMembers: number; // how many buyers the circle aims for
  allInMultiplier?: number; // all-in cost vs price (default 1.12 for duty/legal/services)
};

export type ContributionResult = {
  sharePct: number; // % of the parcel this budget buys
  shareAcres: number; // acres this budget buys
  allInForShare: number; // all-in cost for that share (incl. duty/fees)
  evenSharePrice: number; // price per member if split evenly into targetMembers
  pricePerAcre: number;
};

export function contributionEstimate(input: ContributionInput): ContributionResult | null {
  const { totalPrice, totalAcres, buyerBudget, targetMembers } = input;
  const mult = input.allInMultiplier ?? 1.12;
  if (!(totalPrice > 0) || !(totalAcres > 0) || !(buyerBudget > 0)) return null;

  const allInTotal = totalPrice * mult;
  // The budget is "all-in" money, so back out the land-share it can fund.
  const sharePct = Math.min(100, (buyerBudget / allInTotal) * 100);
  const shareAcres = (sharePct / 100) * totalAcres;
  const allInForShare = (sharePct / 100) * allInTotal;
  const members = targetMembers > 0 ? targetMembers : 1;
  const evenSharePrice = allInTotal / members;

  return {
    sharePct: Math.round(sharePct * 10) / 10,
    shareAcres: Math.round(shareAcres * 100) / 100,
    allInForShare: Math.round(allInForShare),
    evenSharePrice: Math.round(evenSharePrice),
    pricePerAcre: Math.round(totalPrice / totalAcres),
  };
}
