import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  email: string;
  role: 'aluno' | 'professor';
  invitedByName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, role, invitedByName }: InviteRequest = await req.json();

    // Get the Authorization header to identify the user
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

    // Verify the JWT token
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

    // Check if invite already exists
    const { data: existingInvite } = await supabase
      .from('convites')
      .select('*')
      .eq('email', email)
      .eq('role', role)
      .single();

    let inviteToken: string;

    if (existingInvite && existingInvite.status === 'pendente') {
      // Use existing token and update expiry
      inviteToken = existingInvite.token;
      
      await supabase
        .from('convites')
        .update({
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          invited_by_name: invitedByName,
        })
        .eq('id', existingInvite.id);
    } else {
      // Create new invite
      const { data: newInvite, error: inviteError } = await supabase
        .from('convites')
        .insert({
          email,
          role,
          user_id: user.id,
          invited_by_name: invitedByName,
          status: 'pendente',
        })
        .select('token')
        .single();

      if (inviteError) {
        console.error("Error creating invite:", inviteError);
        return new Response(
          JSON.stringify({ error: "Failed to create invite" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      inviteToken = newInvite.token;
    }

    // Create the invite link
    const inviteLink = `${supabaseUrl.replace('kgkjrxwoojykdebtgutf.supabase.co', 'id-preview--55bd2b59-3728-4632-aca6-ed7498ac7c95.lovable.app')}/cadastro?token=${inviteToken}`;

    const roleText = role === 'aluno' ? 'aluno' : 'professor';
    
    // Send email
    const emailResponse = await resend.emails.send({
      from: "Genis Sistema <noreply@genisai.com.br>",
      to: [email],
      subject: `Convite para ser ${roleText} no Genis`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #000000, #f1da00); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Genis Sistema Educacional</h1>
          </div>
          
          <div style="padding: 40px 20px; background: #ffffff;">
            <h2 style="color: #333; margin-bottom: 20px;">Você foi convidado!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Olá! Você foi convidado por <strong>${invitedByName}</strong> para ser <strong>${roleText}</strong> no sistema Genis.
            </p>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Para aceitar o convite e criar sua conta, clique no botão abaixo:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteLink}" 
                 style="background: linear-gradient(135deg, #000000, #f1da00); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Aceitar Convite
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; line-height: 1.6;">
              Este convite expira em 7 dias. Se você não solicitou este convite, pode ignorar este email.
            </p>
            
            <p style="color: #999; font-size: 14px; line-height: 1.6;">
              Caso o botão não funcione, copie e cole este link no seu navegador:<br>
              <a href="${inviteLink}" style="color: #f1da00; word-break: break-all;">${inviteLink}</a>
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0;">Genis Sistema Educacional - Educação em Comunhão</p>
          </div>
        </div>
      `,
    });

    console.log("Invite email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Convite enviado para ${email}`,
        inviteId: inviteToken
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
    console.error("Error in send-invite function:", error);
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