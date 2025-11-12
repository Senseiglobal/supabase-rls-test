import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserContextValue {
  userId: string | null;
  email: string | null;
  loading: boolean;
}

const UserContext = createContext<UserContextValue>({ userId: null, email: null, loading: true });

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        setEmail(session.user.email || null);
      } else {
        setUserId(null);
        setEmail(null);
      }
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        setEmail(session.user.email || null);
      } else {
        setUserId(null);
        setEmail(null);
      }
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ userId, email, loading }}>
      {children}
    </UserContext.Provider>
  );
};
