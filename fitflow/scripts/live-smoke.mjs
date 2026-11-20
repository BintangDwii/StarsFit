import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const email = process.env.LIVE_TEST_EMAIL;
const password = process.env.LIVE_TEST_PASSWORD;

if (!url || !key || !email || !password) {
  console.error(
    'Missing env. Copy .env.example to .env and set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, LIVE_TEST_EMAIL, LIVE_TEST_PASSWORD.'
  );
  process.exit(1);
}

const supabase = createClient(url, key);

const fail = (message) => {
  console.error(`FAIL: ${message}`);
  process.exit(1);
};

const { data: auth, error: authError } =
  await supabase.auth.signInWithPassword({ email, password });

if (authError || !auth.session) {
  fail(`login: ${authError?.message || 'no session'}`);
}

const { data: memberships, error: membershipError } = await supabase
  .from('tenant_members')
  .select('tenant_id, role, status')
  .eq('user_id', auth.user.id)
  .eq('status', 'active');

if (membershipError || !memberships?.length) {
  fail(`membership: ${membershipError?.message || 'no tenant'}`);
}

const tenantId = memberships[0].tenant_id;
const checks = [
  ['get_tenant_settings', {}],
  ['list_members', { p_tenant: tenantId }],
  ['list_bookings', { p_tenant: tenantId }],
  ['list_assignments', { p_tenant: tenantId }],
  ['list_exercises', { p_tenant: tenantId }],
  ['get_dashboard_stats', { p_tenant: tenantId }],
];

for (const [name, args] of checks) {
  const { error } = await supabase.rpc(name, args);
  if (error) fail(`${name}: ${error.message}`);
  console.log(`PASS ${name}`);
}

const { data: members, error: membersError } = await supabase.rpc(
  'list_members',
  { p_tenant: tenantId }
);

if (membersError) fail(`list_members data: ${membersError.message}`);

if (members.length) {
  const { error: quotaError } = await supabase.rpc('get_member_quotas', {
    p_tenant: tenantId,
    p_member: members[0].id,
  });
  if (quotaError) fail(`get_member_quotas: ${quotaError.message}`);
  console.log('PASS get_member_quotas');
}

console.log(`PASS live smoke — tenant ${tenantId}, role ${memberships[0].role}`);
await supabase.auth.signOut();
