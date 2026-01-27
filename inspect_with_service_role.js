const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is missing in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectUsers() {
    console.log('--- Inspecting public.users with Service Role ---');
    const { data: users, error } = await supabase.from('users').select('*').limit(5);
    
    if (error) {
        console.error('Error fetching users:', error.message);
    } else {
        console.log('Users found:', JSON.stringify(users, null, 2));
    }

    console.log('\n--- Inspecting auth.users via RPC or direct (if possible) ---');
    // Note: service_role can access auth schema in some configurations
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
        console.error('Error fetching auth users:', authError.message);
    } else {
        console.log('Auth users count:', authUsers.users.length);
        console.log('Auth users sample:', JSON.stringify(authUsers.users.slice(0, 2).map(u => ({ id: u.id, email: u.email })), null, 2));
    }
}

inspectUsers();
