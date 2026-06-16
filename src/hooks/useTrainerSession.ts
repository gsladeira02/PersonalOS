'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase/client';
import { trainerCanAccess } from '@/lib/access';

export type Trainer = {
  id: string;
  user_id: string;
  full_name: string;
  business_name: string | null;
  plan_code: string;
  subscription_status: string | null;
  grace_until: string | null;
};

export function useTrainerSession() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [loading, setLoading] = useState(true);
  const [trainer, setTrainer] = useState<Trainer | null>(null);

  const load = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.replace('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();

    if (profile?.role === 'student') {
      router.replace('/aluno');
      return;
    }

    const { data, error } = await supabase
      .from('trainers')
      .select('id,user_id,full_name,business_name,plan_code,subscription_status,grace_until')
      .eq('user_id', userData.user.id)
      .single();

    if (error || !data) {
      router.replace('/login');
      return;
    }

    if (!trainerCanAccess(data)) {
      router.replace('/regularizar');
      return;
    }

    setTrainer(data as Trainer);
    setLoading(false);
  }, [router, supabase]);

  useEffect(() => { load(); }, [load]);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  return { loading, trainer, supabase, reload: load, signOut };
}
