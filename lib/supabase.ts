import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

// Datos extraídos de la imagen que enviaste
const supabaseUrl = "https://bmktonpyfimlmodmrulv.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJta3RvbnB5ZmltbG1vZG1ydWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNzMyMTEsImV4cCI6MjA5MTk0OTIxMX0.6gLhOCBKRiwRmT0r30eklzPjegxXL42Ce1byRlZ0GZ4"; // <--- PEGA AQUÍ TODA LA "ANON KEY" DE LA IMAGEN

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
