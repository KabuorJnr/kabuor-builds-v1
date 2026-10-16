import { useEffect, useState } from 'react';
import { create } from 'zustand';

export class ApiError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// `file` sends a File/Blob as the raw request body (used for image uploads).
export async function api(path, { method = 'GET', body, file, token, raw = false } = {}) {
  const res = await fetch(`/api${path}`, {
    method: file ? 'POST' : method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(file ? { 'Content-Type': file.type } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: file ?? (body ? JSON.stringify(body) : undefined),
  });
  if (raw && res.ok) return res;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error || 'Network error, please try again', data.code);
  return data;
}

// Website content (admin-editable) shared with components that aren't under the store page,
// such as the logo and the generated packaging art.
export const useSite = create(() => ({ content: null }));

// Shared, cached loader for the public catalogue, shop config, website content and updates.
let storePromise;
// Called after admin edits so the shop pages fetch fresh data next time they render.
export const refreshStore = () => {
  storePromise = undefined;
};
export function loadStore() {
  storePromise ??= Promise.all([api('/products'), api('/config'), api('/content'), api('/posts')]).then(([products, config, { content }, posts]) => {
    useSite.setState({ content });
    return { products, config, content, posts };
  });
  storePromise.catch(() => (storePromise = undefined));
  return storePromise;
}

export function useStore() {
  const [state, setState] = useState({ products: [], config: null, content: null, posts: [], loading: true, error: null });
  useEffect(() => {
    let live = true;
    loadStore()
      .then((d) => live && setState({ ...d, loading: false, error: null }))
      .catch((e) => live && setState((s) => ({ ...s, loading: false, error: e.message })));
    return () => {
      live = false;
    };
  }, []);
  return state;
}
