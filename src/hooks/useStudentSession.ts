'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase/client';

export type Student = {
  id: string;
  trainer_id: string;
  user_id: string | null;
  full_name: string;
  email: string | null;
  status: string;
};

export function useStudentSession() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);

  const load = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.replace('/login');
      return;
    }

    const { data, error } = await supabase
      .from('students')
      .select('id,trainer_id,user_id,full_name,email,status')
      .eq('user_id', userData.user.id)
      .single();

    if (error || !data) {
      router.replace('/personal/dashboard');
      return;
    }

    setStudent(data as Student);
    setLoading(false);
  }, [router, supabase]);

  useEffect(() => { load(); }, [load]);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  return { loading, student, supabase, reload: load, signOut };
}
