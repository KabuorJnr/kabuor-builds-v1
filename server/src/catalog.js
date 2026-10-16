// Starter catalogue for the current shop: the products the owner entered when signing up (brand.catalog).
// `look` drives the product picture: the uploaded photo when there is one, otherwise packaging art.
import { brand } from './tenant.js';

export const catalog = () =>
  (brand.catalog ?? [])
    .filter((p) => p.active !== false)
    .map(({ estimate, active, ...p }) => ({ category: 'all', notes: [], rating: 0, reviews: 0, ...p, look: { photo: '', ...p.look } }));
