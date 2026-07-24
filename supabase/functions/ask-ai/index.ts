import { createClient } from 'jsr:@supabase/supabase-js@2';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';

Deno.serve(async (req) => {
  try {
    // verify the caller is a logged-in user
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response('Unauthorized', { status: 401 });

    const { messages, chickName } = await req.json();   // messages: [{ role: 'user'|'model', text: string }]

    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': Deno.env.get('GEMINI_API_KEY')!,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: `You're name is ${chickName}. You are the user's virtual chicken friend, but here you're acting as a scheduling assistant for a todo/calendar app.
                          Help with planning, questions about today's schedule, or questions about what you can do.
                          If the user asks for something you can't do yet (editing or deleting existing items,
                          recurring events, multi-day planning), say so plainly rather than attempting it.
                          Stay focused on scheduling — politely redirect anything unrelated.` }],
        },
        contents: messages.map((m: any) => ({
          role: m.role,
          parts: [{ text: m.text }],
        })),
      }),
    });

    if (!res.ok) {
      console.error(await res.text());
      return new Response(JSON.stringify({ error: 'Gemini request failed' }), { status: 502 });
    }

    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't answer that.";
    return new Response(JSON.stringify({ reply }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
});