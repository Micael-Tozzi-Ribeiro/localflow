import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, userType, userName, userRegion } = await req.json();

    const webhookResponse = await fetch(
      "https://micaeltr.app.n8n.cloud/webhook/assistente-localflow",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          userId,
          userType,
          userName,
          userRegion,
        }),
      },
    );

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error("Erro ao chamar webhook do n8n:", webhookResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao chamar o assistente de IA" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const data = await webhookResponse.json();
    console.log("Resposta do n8n:", data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro na função ai-assistant-proxy:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno no assistente de IA" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
