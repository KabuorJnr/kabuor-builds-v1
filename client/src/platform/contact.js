// Where people reach Kabuor Technologies by email. kabuor.com isn't ours, so nothing may point there.
export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'rooneykabuor2004@gmail.com';
/** True on the shop platform's own address (builds.…): its home page is the shops page, not the company's. */
export const BUILDS_HOST = typeof window !== 'undefined' && /^builds\./.test(window.location.hostname);
