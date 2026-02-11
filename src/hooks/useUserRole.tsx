import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Enums"]["app_role"];

export const useUserRole = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async (userId: string | undefined) => {
      if (!userId) {
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId);

        if (error) {
          console.error("Error fetching roles:", error);
          setRoles([]);
        } else {
          setRoles(data?.map(r => r.role) || []);
        }
      } catch (error) {
        console.error("Error in fetchRoles:", error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    supabase.auth.getUser().then(({ data: { user } }) => {
      fetchRoles(user?.id);
    });

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session?.user) {
          setRoles([]);
          setLoading(false);
        } else {
          setLoading(true);
          fetchRoles(session.user.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const hasRole = (role: UserRole) => roles.includes(role);
  const isAdmin = hasRole("admin");
  const isPsychologist = hasRole("psychologist");
  const isStudent = hasRole("student");

  return {
    roles,
    loading,
    hasRole,
    isAdmin,
    isPsychologist,
    isStudent,
  };
};
