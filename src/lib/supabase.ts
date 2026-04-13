import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gxorhyqaowbixdcyjmej.supabase.co';
const supabaseKey = 'sb_publishable_WN16fZOeXe-pICb3neDRNQ_F1cOAX7N';

export const supabase = createClient(supabaseUrl, supabaseKey);
