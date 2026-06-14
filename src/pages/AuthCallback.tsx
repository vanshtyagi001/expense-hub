import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  useEffect(() => {
    // Listen for auth state changes triggered by Supabase consuming the URL (hash or code)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || session) {
        if (window.opener) {
          window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
          window.close();
        } else {
          window.location.href = '/';
        }
      }
    });

    // Also check if session is already present (e.g. exchanged before this mounted)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        if (window.opener) {
          window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
          window.close();
        } else {
          window.location.href = '/';
        }
      } else if (!window.opener) {
        // If not a popup and no session yet, Supabase might just be exchanging code.
        // We do nothing and let onAuthStateChange handle it.
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-medium tracking-tight">Authenticating...</h2>
        <p className="text-gray-500 text-sm">You can close this window.</p>
      </div>
    </div>
  );
}
