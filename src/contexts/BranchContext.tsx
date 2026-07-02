import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export type Branch = 'arabia' | 'dahar' | null;

interface BranchContextValue {
  branch: Branch;
  setBranch: (b: Branch) => Promise<void>;
  loading: boolean;
}

const BranchContext = createContext<BranchContextValue | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const [branch, setBranchState] = useState<Branch>(null);
  const [loading, setLoading] = useState(true);

  // Load branch from profiles on mount
  useEffect(() => {
    let cancelled = false;

    async function loadBranch() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        if (!cancelled) {
          setBranchState(null);
          setLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('branch')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!cancelled) {
          if (!error && data?.branch) {
            setBranchState(data.branch as Branch);
          } else {
            setBranchState(null);
          }
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setBranchState(null);
          setLoading(false);
        }
      }
    }

    loadBranch();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setBranchState(null);
        setLoading(false);
      } else {
        loadBranch();
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const setBranch = useCallback(async (b: Branch) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    // Update profiles
    const { error } = await supabase
      .from('profiles')
      .update({ branch: b, updated_at: new Date().toISOString() })
      .eq('id', session.user.id);

    if (!error) {
      setBranchState(b);
    }
  }, []);

  return (
    <BranchContext.Provider value={{ branch, setBranch, loading }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error('useBranch must be used within BranchProvider');
  return ctx;
}