import { useCallback, useEffect, useMemo, useState } from 'react';

import { supabase } from '../lib/supabase';
import { DEMO_MODE } from '../services/api';
import { AuthContext } from './authContext';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(!DEMO_MODE);
  const [memberships, setMemberships] = useState([]);
  const [tenantId, setTenantId] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (DEMO_MODE) return undefined;

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session);
        setLoading(false);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);

      if (!nextSession) {
        setMemberships([]);
        setTenantId(null);
        setRole(null);
      }
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (DEMO_MODE || !session) return undefined;

    let active = true;

    (async () => {
      const { data } = await supabase
        .from('tenant_members')
        .select('id, tenant_id, user_id, role, status')
        .eq('user_id', session.user.id)
        .eq('status', 'active');

      if (active) {
        const rows = data || [];
        setMemberships(rows);
        setTenantId(rows[0]?.tenant_id || null);
        setRole(rows[0]?.role || null);
      }
    })();

    return () => {
      active = false;
    };
  }, [session]);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const selectTenant = useCallback(
    (nextTenantId) => {
      const membership = memberships.find(
        (item) => item.tenant_id === nextTenantId
      );
      if (!membership) return;
      setTenantId(membership.tenant_id);
      setRole(membership.role);
    },
    [memberships]
  );

  const value = useMemo(
    () => ({
      demoMode: DEMO_MODE,
      loading,
      session,
      user: session?.user || null,
      memberships,
      tenantId,
      role,
      signIn,
      signOut,
      selectTenant,
    }),
    [loading, session, memberships, tenantId, role, selectTenant]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
