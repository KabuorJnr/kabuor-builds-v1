// Branches grouped by country, in the order countries first appear: [{ country, branches }].
export function byCountry(branches = []) {
  const groups = [];
  for (const b of branches) {
    const country = b.country || 'Kenya';
    let g = groups.find((x) => x.country === country);
    if (!g) groups.push((g = { country, branches: [] }));
    g.branches.push(b);
  }
  return groups;
}

export const telHref = (phone = '') => `tel:${phone.replace(/[^\d+]/g, '')}`;
