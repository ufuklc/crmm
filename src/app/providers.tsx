'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    console.log('AppProviders: Setting up auth state change listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AppProviders: Auth state changed', { event, hasSession: !!session });
        
        try {
          const response = await fetch('/api/auth/callback', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ event, session }),
          });
          
          const result = await response.json();
          console.log('AppProviders: Auth callback response', result);
        } catch (error) {
          console.error('AppProviders: Auth callback error', error);
        } finally {
          router.refresh();
        }
      }
    );
    
    return () => {
      console.log('AppProviders: Cleaning up auth state change listener');
      subscription.unsubscribe();
    };
  }, [router]);

  return <>{children}</>;
}
