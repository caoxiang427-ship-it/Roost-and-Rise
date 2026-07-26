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

    const { messages, chickName, today, mode } = await req.json();   // messages: [{ role: 'user'|'model', text: string }]

    let tasks = null, events = null;
    if (mode === 'scheduler') {
      let taskErr, eventErr;
      ({ data: tasks, error: taskErr } = await supabase
        .from('tasks')
        .select('text, difficulty, completed, scheduled_date, start_time, end_time')
        .eq('user_id', user.id)
        .eq('scheduled_date', today));
      if (taskErr) console.error('tasks query failed:', taskErr);

      ({ data: events, error: eventErr } = await supabase
        .from('events')
        .select('title, start_time, end_time, all_day')
        .eq('user_id', user.id)
        .gte('start_time', `${today}T00:00:00`)
        .lte('start_time', `${today}T23:59:59`));
      if (eventErr) console.error('events query failed:', eventErr);
    }

    function buildInstruction() {
      if (mode === 'companion') {
        return `Your name is ${chickName}. You are the user's virtual chicken friend, but here you're acting as a companion and friend.
                The app is a mental health focused gamified productivity app, aimed at balancing work with sufficient rest.
                The app has these main features: virtual pet (you) with an XP system that rewards both work and breaks, a todo list, a studu planner, a pomodoro timer, a self-care/ recovery tab and finally an analytics tab.
                The user can talk to you about anything, be friendly and open to listen. Make sure to emphasise mental wellbeing and suggest professional help if required.
                Do not use markdown formatting — no ## headings, no ** for bold,`;
      }
      // scheduler
      return `Your name is ${chickName}. You are the user's virtual chicken friend, but here you're acting as a scheduling assistant for a todo/calendar app.
                Help with planning, questions about today's schedule, or questions about what you can do.
                If the user asks for something you can't do yet (editing or deleting existing items,
                recurring events, multi-day planning), say so plainly rather than attempting it.
                Stay focused on scheduling — politely redirect anything unrelated.
                The features of this planner are: press plus button to add events or tasks, press and drag to create events/ tasks,
                long press to selected and drag to reschedule task/ event, tap to view/ edit task or event, toggle between daily and weekly 
                calendar view by pressing the 'calendar icon', tasks is synced with the todo list feature. today's date is ${JSON.stringify(today)}.
                Today's tasks: ${JSON.stringify(tasks)}. Today's events: ${JSON.stringify(events)}. Do not use markdown formatting —
                no ## headings, no ** for bold,`;
    }


    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': Deno.env.get('GEMINI_API_KEY')!,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: buildInstruction()
                           }],
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