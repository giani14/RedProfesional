import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bmktonpyfimlmodmrulv.supabase.co' 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJta3RvbnB5ZmltbG1vZG1ydWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNzMyMTEsImV4cCI6MjA5MTk0OTIxMX0.6gLhOCBKRiwRmT0r30eklzPjegxXL42Ce1byRlZ0GZ4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)