import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listRemoteMigrations() {
    console.log('🔍 Fetching remote migration list...');

    // Directly query the supabase_migrations schema
    const { data, error } = await supabase
        .from('_migrations') // Trying to find the right table name, often 'schema_migrations' in 'supabase_migrations' schema
        .select('*')
        .limit(100);

    if (error) {
        // try the other common location
        const { data: data2, error: error2 } = await supabase
            .rpc('get_migrations'); // Some setups have this

        if (error2) {
            console.error('❌ Could not fetch migrations via standard means. Proceeding to manual instruction.');
            console.error('Error:', error2.message);
            process.exit(1);
        }
        console.log('Remote Migrations:', data2);
    } else {
        console.log('Remote Migrations:', data);
    }
}

listRemoteMigrations();
