// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xfbjpthncsebrbgpfvcm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYmpwdGhuY3NlYnJiZ3BmdmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxODQ5MTMsImV4cCI6MjA2NTc2MDkxM30.0BwMaJpzGfHlhpmOa2ACl1m4f5BziFV-u-kp7tO-ZwU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);