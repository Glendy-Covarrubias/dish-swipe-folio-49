
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mminythhfgcfcjrlkfkr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1taW55dGhoZmdjZmNqcmxrZmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MDAxNTIsImV4cCI6MjA1NzI3NjE1Mn0.nLbbdaf8REnq09VNwa05tC6UUVnGo_5I6BM2wqH8zkQ";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
