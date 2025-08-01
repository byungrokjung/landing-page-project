const { createClient } = require("@supabase/supabase-js");

require("dotenv").config();

async function testSupabaseConnection() {
  try {
    console.log("Testing Supabase connection...");
    console.log("URL:", process.env.SUPABASE_URL);
    console.log("Key exists:", \!\!process.env.SUPABASE_ANON_KEY);
    
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabase
      .from("ai_trend_news")
      .select("count", { count: "exact", head: true });
    
    if (error) {
      console.error("ai_trend_news error:", error);
      
      const tables = ["profiles", "case_studies"];
      for (const table of tables) {
        const { data: testData, error: testError } = await supabase
          .from(table)
          .select("count", { count: "exact", head: true });
        
        if (testError) {
          console.log(`${table}: ${testError.message}`);
        } else {
          console.log(`${table}: accessible`);
        }
      }
    } else {
      console.log("ai_trend_news table accessible, count:", data);
    }
    
  } catch (error) {
    console.error("Connection failed:", error.message);
  }
}

testSupabaseConnection();
