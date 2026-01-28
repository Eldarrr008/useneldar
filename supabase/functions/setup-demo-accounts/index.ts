import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Authentication check - require admin role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - No valid authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's token to verify identity
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the user's token and get claims
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getUser(token);
    
    if (claimsError || !claimsData?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.user.id;

    // Create admin client to check roles
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify user has admin role
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (rolesError || !roles?.some((r) => r.role === "admin")) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate random password for demo accounts (more secure than hardcoded)
    const generatePassword = () => {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
      let password = "";
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const demoAccounts = [
      { email: "student@example.com", password: generatePassword(), role: "student", fullName: "Демо Студент" },
      { email: "psycholog@example.com", password: generatePassword(), role: "psychologist", fullName: "Демо Психолог" },
      { email: "admin@example.com", password: generatePassword(), role: "admin", fullName: "Демо Админ" },
    ];

    const results = [];

    for (const account of demoAccounts) {
      // Check if user exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find((u) => u.email === account.email);

      let finalUserId: string;
      let accountPassword = account.password;

      if (existingUser) {
        finalUserId = existingUser.id;
        // Update password for existing user
        await supabaseAdmin.auth.admin.updateUserById(finalUserId, {
          password: account.password,
        });
        results.push({ 
          email: account.email, 
          status: "updated", 
          userId: finalUserId,
          newPassword: accountPassword 
        });
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: { full_name: account.fullName },
        });

        if (createError) {
          results.push({ email: account.email, status: "error", error: createError.message });
          continue;
        }

        finalUserId = newUser.user.id;
        results.push({ 
          email: account.email, 
          status: "created", 
          userId: finalUserId,
          newPassword: accountPassword 
        });
      }

      // Update role
      await supabaseAdmin.from("user_roles").delete().eq("user_id", finalUserId);

      const { error: insertRoleError } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: finalUserId, role: account.role });

      if (insertRoleError) {
        results.push({ email: account.email, roleStatus: "error", error: insertRoleError.message });
      }

      // Check if profile exists
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("id", finalUserId)
        .maybeSingle();

      if (!existingProfile) {
        await supabaseAdmin
          .from("profiles")
          .insert({ id: finalUserId, full_name: account.fullName });
      }
    }

    // Log the action for audit trail
    console.log(`Demo accounts created/updated by admin: ${userId} at ${new Date().toISOString()}`);

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Setup demo accounts error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
