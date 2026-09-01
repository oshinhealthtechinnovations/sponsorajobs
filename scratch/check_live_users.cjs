const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function checkLiveUsers() {
  const supabaseUrl = process.env.SUPABASE_URL || "https://tyijulgmluvlxkfgsszd.supabase.co";
  const supabaseKey = process.env.SUPABASE_KEY || "sb_publishable_bjRsLme6-pwayZBk95Kikw_d6_lexjm";

  console.log("Connecting to Supabase:", supabaseUrl);

  try {
    const usersRes = await fetch(`${supabaseUrl}/rest/v1/candidate_users?select=*&order=created_at.desc&limit=10`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    });
    const users = await usersRes.json();
    console.log("Candidate Users in DB:", users);

    const appsRes = await fetch(`${supabaseUrl}/rest/v1/candidate_applications?select=*&order=applied_at.desc&limit=10`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    });
    const apps = await appsRes.json();
    console.log("Candidate Applications in DB:", apps);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

checkLiveUsers().catch(console.error);
