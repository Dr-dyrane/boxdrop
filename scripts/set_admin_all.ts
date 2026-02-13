import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function promoteAllToAdmin() {
    console.log('🚀 Promoting all users to admin...');

    const { data, error, count } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .neq('role', 'admin'); // Only update those who aren't already admins

    if (error) {
        console.error('❌ Failed to promote users:', error.message);
        process.exit(1);
    }

    console.log(`✅ Success! All eligible units have been elevated to Oversight level.`);
}

promoteAllToAdmin();
