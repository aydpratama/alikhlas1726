const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectUsersTable() {
    console.log('--- Inspecting public.users ---');
    
    // Try to get one record to see the structure
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching from users:', error.message);
        console.error('Error details:', error);
    } else {
        if (data.length === 0) {
            console.log('Table "users" exists but is empty OR RLS is blocking access.');
            
            // Try to see if we can get column names by requesting a non-existent column
            // and checking the error message (sometimes it lists valid columns)
            const { error: columnError } = await supabase
                .from('users')
                .select('non_existent_column_to_trigger_error');
            
            if (columnError) {
                console.log('\nAttempting to deduce columns from error message...');
                console.log('Error message:', columnError.message);
            }
        } else {
            console.log('User sample found:', data[0]);
            console.log('Columns:', Object.keys(data[0]));
        }
    }
}

inspectUsersTable();
