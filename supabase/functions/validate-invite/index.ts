import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
};

interface ValidateInviteRequest {
  token: string;
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

    // Validate request method
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { token }: ValidateInviteRequest = await req.json();

    // Validate input
    if (!token || typeof token !== 'string') {
      return new Response(
        JSON.stringify({ error: "Invalid token provided" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate token format (should be a UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      return new Response(
        JSON.stringify({ error: "Invalid token format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Query for the specific invite by token
    const { data: invite, error } = await supabase
      .from('convites')
      .select('id, email, role, invited_by_name, expires_at, status')
      .eq('token', token)
      .eq('status', 'pendente')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !invite) {
      console.log("Invite validation failed:", error?.message || "No valid invite found");
      return new Response(
        JSON.stringify({ 
          error: "Invalid or expired invitation",
          valid: false 
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Return only necessary invite information (no sensitive data like token)
    return new Response(
      JSON.stringify({
        valid: true,
        invite: {
          id: invite.id,
          email: invite.email,
          role: invite.role,
          invited_by_name: invite.invited_by_name,
          expires_at: invite.expires_at
        }
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in validate-invite function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        valid: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);