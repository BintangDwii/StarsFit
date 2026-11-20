import { useEffect, useMemo, useState } from 'react';

import { PortalContext } from './portalContext';

const STORAGE_KEY = 'fitflow.portal.memberId';

export function PortalProvider({ children, defaultMemberId }) {
  const [memberId, setMemberId] = useState(() => {
    if (typeof window === 'undefined') return defaultMemberId;
    return window.localStorage.getItem(STORAGE_KEY) || defaultMemberId;
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, memberId);
  }, [memberId]);

  const value = useMemo(() => ({ memberId, setMemberId }), [memberId]);

  return (
    <PortalContext.Provider value={value}>{children}</PortalContext.Provider>
  );
}
