import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { uploadId } = await req.json();

    if (!uploadId) {
      return new Response(
        JSON.stringify({ error: 'Upload ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get upload details
    const { data: upload, error: uploadError } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', uploadId)
      .eq('user_id', user.id)
      .single();

    if (uploadError || !upload) {
      console.error('Upload fetch error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Upload not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already analyzed
    if (upload.ai_analysis) {
      return new Response(
        JSON.stringify({ analysis: upload.ai_analysis, cached: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Lovable AI for analysis
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a music industry expert and audio analyst. Analyze the provided song information and provide detailed insights.`;
    
    const userPrompt = `Analyze this music file:
Filename: ${upload.file_name}
File size: ${(upload.file_size / 1024 / 1024).toFixed(2)} MB
Type: ${upload.mime_type}

Provide a comprehensive analysis covering:
1. Genre classification and subgenres
2. Mood and energy level
3. Potential target audience
4. Recommendations for distribution platforms
5. Marketing suggestions based on the music style
6. Estimated commercial potential
7. Similar artists or tracks (if identifiable from metadata)`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'analyze_music',
            description: 'Provide structured music analysis',
            parameters: {
              type: 'object',
              properties: {
                genre: { type: 'string', description: 'Primary genre' },
                subgenres: { type: 'array', items: { type: 'string' } },
                mood: { type: 'string', description: 'Overall mood' },
                energy_level: { type: 'string', enum: ['low', 'medium', 'high', 'very high'] },
                target_audience: { type: 'string' },
                recommended_platforms: { type: 'array', items: { type: 'string' } },
                marketing_tips: { type: 'array', items: { type: 'string' } },
                commercial_potential: { type: 'string', enum: ['low', 'moderate', 'high', 'very high'] },
                similar_artists: { type: 'array', items: { type: 'string' } },
                insights: { type: 'string', description: 'Additional insights and recommendations' }
              },
              required: ['genre', 'mood', 'energy_level', 'target_audience', 'commercial_potential', 'insights'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'analyze_music' } }
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'AI rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      throw new Error('AI analysis failed');
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const analysis = toolCall?.function?.arguments ? JSON.parse(toolCall.function.arguments) : null;

    if (!analysis) {
      throw new Error('No analysis returned from AI');
    }

    // Store analysis in database
    const { error: updateError } = await supabase
      .from('uploads')
      .update({
        ai_analysis: analysis,
        analyzed_at: new Date().toISOString()
      })
      .eq('id', uploadId);

    if (updateError) {
      console.error('Failed to store analysis:', updateError);
    }

    return new Response(
      JSON.stringify({ analysis, cached: false }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-song function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});