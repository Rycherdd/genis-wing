import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ManageUserRequest {
  action: 'delete' | 'create' | 'list' | 'deactivate';
  userId?: string;
  userData?: {
    email: string;
    password: string;
    fullName: string;
    userRole: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { action, userId, userData }: ManageUserRequest = await req.json();

    // Get the Authorization header to verify the requesting user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Verify the JWT token and get user
    const jwt = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      console.log("Auth error:", authError?.message || "No user found");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if user has admin permissions
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    // Verify admin access
    if (!userRole || userRole.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: "Access denied: Admin role required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (action === 'list') {
      // Get all users with their profiles
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        console.error("Error listing users:", listError);
        return new Response(
          JSON.stringify({ error: "Failed to list users" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Get profile data and roles for each user
      const usersWithProfiles = await Promise.all(
        users.map(async (authUser) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', authUser.id)
            .single();

          const { data: userRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', authUser.id)
            .single();

          return {
            id: authUser.id,
            email: authUser.email || 'Sem email',
            full_name: profile?.full_name || 'Usuário sem nome',
            user_role: userRole?.role || null,
            created_at: authUser.created_at,
            status: userRole?.role ? 'active' : 'inactive'
          };
        })
      );

      return new Response(
        JSON.stringify({ 
          success: true, 
          users: usersWithProfiles
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );

    } else if (action === 'delete' && userId) {
      // Delete user from auth.users (this will cascade to profiles table)
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
      
      if (deleteError) {
        console.error("Error deleting user:", deleteError);
        return new Response(
          JSON.stringify({ error: "Failed to delete user" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "User deleted successfully"
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );

    } else if (action === 'deactivate' && userId) {
      // Remove user role and sign out all sessions
      const { error: deleteRoleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      
      if (deleteRoleError) {
        console.error("Error removing user role:", deleteRoleError);
        return new Response(
          JSON.stringify({ error: "Failed to deactivate user" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Sign out all sessions for this user
      const { error: signOutError } = await supabase.auth.admin.signOut(userId);
      
      if (signOutError) {
        console.error("Error signing out user:", signOutError);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "User deactivated and logged out successfully"
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );

    } else if (action === 'create' && userData) {
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: {
          full_name: userData.fullName
        },
        email_confirm: true // Auto-confirm email
      });

      if (createError) {
        console.error("Error creating user:", createError);
        return new Response(
          JSON.stringify({ error: createError.message }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Create user role in user_roles table
      if (newUser.user) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([
            { 
              user_id: newUser.user.id, 
              role: userData.userRole as 'admin' | 'professor' | 'aluno',
              assigned_by: user.id
            }
          ]);

        if (roleError) {
          console.error("Error creating user role:", roleError);
          // Note: User is created but role assignment failed
          return new Response(
            JSON.stringify({ 
              error: "User created but role assignment failed",
              user: newUser.user 
            }),
            {
              status: 207, // Partial success
              headers: { "Content-Type": "application/json", ...corsHeaders },
            }
          );
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "User created successfully",
          user: newUser.user
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );

    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action or missing required data" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

  } catch (error: any) {
    console.error("Error in manage-users function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);