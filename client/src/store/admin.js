import { useCallback, useEffect, useRef, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';

export const useAdmin = create(
  persist(
    (set) => ({
      token: null,
      username: null,
      mustChange: false,
      login: ({ token, username, mustChange }) => set({ token, username, mustChange: Boolean(mustChange) }),
      logout: () => set({ token: null, username: null, mustChange: false }),
      requireChange: () => set({ mustChange: true }),
    }),
    { name: 'shop-admin-session' },
  ),
);

export function useAdminApi() {
  const token = useAdmin((s) => s.token);
  const logout = useAdmin((s) => s.logout);
  const requireChange = useAdmin((s) => s.requireChange);
  return useCallback(
    async (path, opts = {}) => {
      try {
        return await api(`/admin${path}`, { ...opts, token });
      } catch (err) {
        if (err.status === 401) logout();
        if (err.code === 'PASSWORD_CHANGE_REQUIRED') requireChange();
        throw err;
      }
    },
    [token, logout, requireChange],
  );
}

// Fetch helper that keeps the previous data on screen while refetching (no layout jump).
export function useAdminQuery(path) {
  const call = useAdminApi();
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const seq = useRef(0);

  const load = useCallback(() => {
    const id = ++seq.current;
    setState((s) => ({ ...s, loading: true }));
    call(path)
      .then((data) => id === seq.current && setState({ data, error: null, loading: false }))
      .catch((err) => id === seq.current && setState((s) => ({ ...s, error: err.message, loading: false })));
  }, [call, path]);

  useEffect(load, [load]);
  return { ...state, reload: load, setData: (fn) => setState((s) => ({ ...s, data: fn(s.data) })) };
}
