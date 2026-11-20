import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })

Deno.serve(async (_request: Request) => {
  const url = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!url || !serviceKey) {
    return json({ error: 'MISSING_SUPABASE_ENV' }, 500)
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  })

  const { data: created, error } = await supabase.rpc('create_session_reminders')

  if (error) {
    return json({ error: error.message }, 500)
  }

  const webhook = Deno.env.get('REMINDER_WEBHOOK_URL')
  if (webhook && Number(created) > 0) {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ created, source: 'fitflow-session-reminders' }),
    }).catch(() => undefined)
  }

  return json({ created })
})
