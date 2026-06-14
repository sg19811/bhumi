// =====================================================
// Acrehub Agent Network — outbound WhatsApp/SMS message templates
// Spec: docs/agent-network-spec-build-ready.md (section 6)
// Each function returns a plain string ready to copy-paste or send via BSP.
// =====================================================

// 6.1 Listing confirmation (after publish, no buyer match)
export function confirmationMessage(opts: {
  agentName: string;
  listingUrl: string;
}): string {
  return `Hi ${opts.agentName}, your listing is live on Acrehub:

${opts.listingUrl}

Share this link with your buyers on WhatsApp. Every click and enquiry will route back to you.

Reply here anytime to update the listing or send more properties.

— Acrehub`;
}

// 6.2 Listing confirmation (with strong buyer match)
export function confirmationWithMatchMessage(opts: {
  agentName: string;
  listingUrl: string;
  buyerSummary: string;
  buyerPhoneMasked: string;
  referenceId: string;
}): string {
  return `Hi ${opts.agentName}, your listing is live:

${opts.listingUrl}

GOOD NEWS: a buyer in our system already matches.
Looking for: ${opts.buyerSummary}
Buyer phone: ${opts.buyerPhoneMasked}
Mention reference: ${opts.referenceId} when you call.

Share the listing link with your other buyers too — every click routes to you.

— Acrehub`;
}

// 6.3 Clarification request
export function clarificationMessage(opts: {
  agentName: string;
  questions: string[];
}): string {
  const numbered = opts.questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
  return `Hi ${opts.agentName}, got your property submission. Quick questions to complete the listing:

${numbered}

Reply with the answers and I'll add them. Thanks!

— Acrehub`;
}

// 6.4 Buyer lead delivery (when buyer enquires on agent's listing)
export function leadNotificationMessage(opts: {
  agentName: string;
  buyerName: string;
  buyerPhone: string;
  listingTitle: string;
  listingUrl: string;
  message?: string;
}): string {
  return `Hi ${opts.agentName}, new buyer enquiry on your listing:

"${opts.listingTitle}"
${opts.listingUrl}

Buyer: ${opts.buyerName}
Phone: ${opts.buyerPhone}
${opts.message ? `Message: "${opts.message}"\n` : ''}
Call the buyer directly and let us know how it goes.

— Acrehub`;
}

// 6.5 Status update acknowledgement
export function statusUpdateAck(opts: {
  agentName: string;
  listingTitle: string;
  action: 'marked_sold' | 'price_updated' | 'withdrawn';
  newPrice?: string;
}): string {
  const actionText = {
    marked_sold: `marked as SOLD`,
    price_updated: `price updated to ${opts.newPrice}`,
    withdrawn: `marked as WITHDRAWN`,
  }[opts.action];

  return `Hi ${opts.agentName}, your listing "${opts.listingTitle}" has been ${actionText}. Thanks for keeping it current!

— Acrehub`;
}

// 6.6 Buyer requirement broadcast (admin sends to matched agents)
export function buyerRequirementBroadcast(opts: {
  agentName: string;
  acreageRange: string;
  locationDescription: string;
  landType: string;
  budgetRange: string;
  timeline?: string;
  referenceId: string;
}): string {
  return `Hi ${opts.agentName}, we have a serious buyer looking for land in your area:

Looking for: ${opts.acreageRange} of ${opts.landType}
Where: ${opts.locationDescription}
Budget: ${opts.budgetRange}
${opts.timeline ? `Timeline: ${opts.timeline}\n` : ''}
Reference: ${opts.referenceId}

If you have a matching property, reply YES and send the details. First serious response gets the buyer introduction.

— Acrehub`;
}

// 6.7 Application received acknowledgement
export function applicationReceivedMessage(opts: {
  agentName: string;
}): string {
  return `Hi ${opts.agentName}, thank you for applying to the Acrehub Agent Network.

Our team will call you within 1-2 working days to complete verification.

In the meantime, you can already start sending properties to this number via WhatsApp — just send the details and photos and we'll create listings for you.

— Acrehub`;
}
