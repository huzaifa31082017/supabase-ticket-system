import { createClient } from '@supabase/supabase-js';

// These lines pull your keys from the .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// This initializes the client so you can use it in your app
export const supabase = createClient('https://cqsnxmvzlnwuccxcrnyj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxc254bXZ6bG53dWNjeGNybnlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNjcxMzIsImV4cCI6MjA5OTk0MzEzMn0.bx3oz5GvGhuRgNaBowZxCEkeOws9SBJ8lwS6rqXKT_o');
