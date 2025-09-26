import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ManageUserRequest {
  action: 'delete' | 'create' | 'list';
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
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if user has admin permissions (for now, any authenticated user can manage)
    // In production, you should check user role from profiles table
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('user_id', user.id)
      .single();

    // For now, allowing all users to manage. In production, add proper role check:
    // if (userProfile?.user_role !== 'admin') {
    //   return new Response(
    //     JSON.stringify({ error: "Forbidden: Admin access required" }),
    //     { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
    //   );
    // }

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

      // Get profile data for each user
      const usersWithProfiles = await Promise.all(
        users.map(async (authUser) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, user_role')
            .eq('user_id', authUser.id)
            .single();

          return {
            id: authUser.id,
            email: authUser.email || '',
            full_name: profile?.full_name || 'N/A',
            user_role: profile?.user_role || 'user',
            created_at: authUser.created_at
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

    } else if (action === 'create' && userData) {
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: {
          full_name: userData.fullName,
          role: userData.userRole
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