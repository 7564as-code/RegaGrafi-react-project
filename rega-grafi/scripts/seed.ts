// scripts/seed.ts
// Fills the database with TEST data: 1 admin, 3 regular users, ~10 jobs,
// a few proposals and one conversation. For development only - never run it
// against a real/production project.
//
// Run it yourself from the project folder:
//   npx tsx --env-file=.env.local scripts/seed.ts
//
// It is safe to run twice: existing test users are reused, and if the test
// jobs already exist it stops without changing anything.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY. " +
      "Run with: npx tsx --env-file=.env.local scripts/seed.ts"
  );
  process.exit(1);
}

// Admin client: uses the secret key and BYPASSES RLS. Server/scripts only.
const supabase = createClient(url, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const TEST_PASSWORD = "Test1234!";

const USERS = [
  { key: "admin", email: "admin@test.com", role: "admin", name: "Admin Test", designer: false },
  { key: "dana", email: "dana@test.com", role: "user", name: "Dana", designer: true },
  { key: "yossi", email: "yossi@test.com", role: "user", name: "Yossi", designer: true },
  { key: "noa", email: "noa@test.com", role: "user", name: "Noa", designer: false },
] as const;

type UserKey = (typeof USERS)[number]["key"];

/** Creates a user, or finds it if the email already exists. Returns the user id. */
async function ensureUser(email: string): Promise<string> {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true, // no confirmation email needed for test users
  });
  if (data?.user) return data.user.id;

  // Probably "already registered": look the user up in the list.
  const { data: list, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (listError) throw listError;
  const existing = list.users.find((u) => u.email === email);
  if (!existing) throw error ?? new Error(`Could not create or find ${email}`);
  return existing.id;
}

async function main() {
  // ---- 1. Users + profiles (the signup trigger creates the profile row) ----
  const ids = {} as Record<UserKey, string>;
  for (const u of USERS) {
    ids[u.key] = await ensureUser(u.email);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: u.name,
        role: u.role,
        onboarded: true,
        is_designer: u.designer,
        availability: "available",
        categories: u.designer ? ["logo", "flyer", "social"] : [],
        bio: u.designer ? `${u.name} - test designer` : null,
      })
      .eq("id", ids[u.key]);
    if (error) throw error;
  }

  // ---- 2. Stop if the test jobs already exist ----
  const { count } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", ids.noa)
    .like("title", "[seed]%");
  if (count && count > 0) {
    console.log("Test jobs already exist - nothing to do.");
    printCredentials();
    return;
  }

  // ---- 3. Jobs (~10, different categories and statuses) ----
  const day = 24 * 60 * 60 * 1000;
  const inDays = (n: number) => new Date(Date.now() + n * day).toISOString();

  const jobRows = [
    { owner: "noa", title: "Logo for a coffee shop", category: "logo", budget: 800, days: 7, status: "open" },
    { owner: "noa", title: "Flyer for a concert", category: "flyer", budget: 300, days: 3, status: "open" },
    { owner: "noa", title: "Banner for a website sale", category: "banner", budget: 250, days: 2, status: "in_progress" },
    { owner: "noa", title: "Instagram post pack", category: "social", budget: 400, days: 10, status: "closed" },
    { owner: "dana", title: "Business card design", category: "other", budget: 150, days: 5, status: "open" },
    { owner: "dana", title: "Logo refresh for a gym", category: "logo", budget: 600, days: 14, status: "closed" },
    { owner: "yossi", title: "Poster for a school play", category: "flyer", budget: 200, days: 4, status: "open" },
    { owner: "yossi", title: "Social media banner", category: "banner", budget: 180, days: 6, status: "in_progress" },
    { owner: "admin", title: "Newsletter header", category: "other", budget: 120, days: 8, status: "open" },
    { owner: "admin", title: "Logo for a food truck", category: "logo", budget: 500, days: 9, status: "closed" },
  ] as const;

  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .insert(
      jobRows.map((j) => ({
        owner_id: ids[j.owner],
        title: `[seed] ${j.title}`,
        description: `Test job: ${j.title}. Please send a proposal with your price and delivery time.`,
        category: j.category,
        budget: j.budget,
        deadline: inDays(j.days),
        status: j.status,
      }))
    )
    .select("id, owner_id, title, status");
  if (jobsError) throw jobsError;

  // ---- 4. Proposals on open jobs of other people ----
  const coffeeJob = jobs.find((j) => j.title.includes("coffee shop"))!;
  const flyerJob = jobs.find((j) => j.title.includes("concert"))!;

  const { error: proposalsError } = await supabase.from("proposals").insert([
    { job_id: coffeeJob.id, designer_id: ids.dana, message: "I can do this in a clean modern style.", price: 700, delivery_hours: 48 },
    { job_id: coffeeJob.id, designer_id: ids.yossi, message: "Happy to help, 3 concepts included.", price: 650, delivery_hours: 72 },
    { job_id: flyerJob.id, designer_id: ids.dana, message: "Bold colors, ready in two days.", price: 280, delivery_hours: 36 },
  ]);
  if (proposalsError) throw proposalsError;

  // ---- 5. One conversation (from the coffee-shop job) + two messages ----
  // user_a must be smaller than user_b, so sort the two ids.
  const [userA, userB] = [ids.noa, ids.dana].sort();
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .insert({ job_id: coffeeJob.id, user_a: userA, user_b: userB })
    .select("id")
    .single();
  if (convError) throw convError;

  const { error: messagesError } = await supabase.from("messages").insert([
    { conversation_id: conversation.id, sender_id: ids.dana, body: "Hi! I saw your coffee shop job, can we talk?" },
    { conversation_id: conversation.id, sender_id: ids.noa, body: "Sure, tell me about your idea." },
  ]);
  if (messagesError) throw messagesError;

  console.log(`Created ${jobs.length} jobs, 3 proposals, 1 conversation.`);
  printCredentials();
}

function printCredentials() {
  console.log("\nTest accounts (password for all: " + TEST_PASSWORD + ")");
  for (const u of USERS) {
    console.log(`  ${u.role.padEnd(5)}  ${u.email}`);
  }
}

main().catch((err) => {
  console.error("Seed failed:", err.message ?? err);
  process.exit(1);
});
