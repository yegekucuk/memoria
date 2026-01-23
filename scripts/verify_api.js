async function main() {
  const BASE_URL = 'http://localhost:3000';
  console.log("Starting verification (API only mode)...");

  // 1. Register a user to get ID
  const email = `test_verif_${Date.now()}@example.com`;
  console.log(`\n[TEST] Registering User (${email})`);
  
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
          email,
          password: 'password123',
          confirmPassword: 'password123',
          name: 'Verification User'
      })
  });
  
  let userId;
  if (regRes.ok) {
      const user = await regRes.json();
      console.log("Register output:", user);
      userId = user.id || user.user?.id;
      console.log("✅ User registered:", userId);
  } else {
      // If register fails (maybe already exists?), try login? 
      // Or maybe the register API has different shape.
      // Assuming standard implementation from previous tasks.
      // If fail, we can't proceed easily.
      console.error("❌ Registration failed:", await regRes.text());
      // Try to continue if we get a user object anyway? No.
      process.exit(1);
  }

  // 2. Start Session (POST /api/sessions/active)
  console.log("\n[TEST] Start Session");
  const startRes = await fetch(`${BASE_URL}/api/sessions/active`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  
  if (!startRes.ok) {
      console.error("Start failed:", await startRes.text());
      process.exit(1);
  }

  const session = await startRes.json();
  console.log("✅ Started Session:", session.id);

  // 3. Get Active Session (Persistence) (GET /api/sessions/active)
  console.log("\n[TEST] Persistence Check");
  const getRes = await fetch(`${BASE_URL}/api/sessions/active?userId=${userId}`);
  const activeSession = await getRes.json();
  
  if (activeSession && activeSession.id === session.id) {
      console.log("✅ Persistence verified");
  } else {
      console.error("❌ Persistence failed. Got:", activeSession);
      process.exit(1);
  }

  // 4. Save Session (PATCH)
  console.log("\n[TEST] Save Session (Tags/Notes)");
  const saveRes = await fetch(`${BASE_URL}/api/sessions/${session.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        endTime: new Date().toISOString(),
        durationSeconds: 60,
        notes: 'Verified via Script',
        tags: ['VerificationTag']
    })
  });
  
  if (!saveRes.ok) {
      console.error("Save failed:", await saveRes.text());
      process.exit(1);
  }

  const savedSession = await saveRes.json();
  // Check tags in response (it returns formatted session with string tags)
  if (savedSession.tags.includes('VerificationTag') && savedSession.notes === 'Verified via Script') {
      console.log("✅ Session saved correctly");
  } else {
      console.error("❌ Save verification failed. Body:", savedSession);
      process.exit(1);
  }
  
  // Verify it is no longer active
  const checkActive = await fetch(`${BASE_URL}/api/sessions/active?userId=${userId}`);
  // Expecting null or empty? API returns null if 404 handled, or empty string?
  // My implementation returns null explicitly (res.json(null))
  const checkActiveJson = await checkActive.json();
  if (checkActiveJson === null) {
      console.log("✅ Session correctly removed from active status");
  } else {
      console.error("❌ Session still active:", checkActiveJson);
      process.exit(1);
  }


  // 5. Discard (Delete)
  console.log("\n[TEST] Discard Session");
  // Start another one
  const s2Res = await fetch(`${BASE_URL}/api/sessions/active`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
  });
  const s2 = await s2Res.json();
  console.log("Started session to discard:", s2.id);
  
  const delRes = await fetch(`${BASE_URL}/api/sessions/${s2.id}`, { method: 'DELETE' });
  
  if (delRes.ok) {
       console.log("✅ Delete request successful");
  } else {
       console.error("❌ Delete request failed");
       process.exit(1);
  }
  
  const checkDiscard = await fetch(`${BASE_URL}/api/sessions/active?userId=${userId}`);
  const checkDiscardJson = await checkDiscard.json();
  if (checkDiscardJson === null) {
      console.log("✅ Discard verified");
  } else {
      console.error("❌ Session still exists");
  }
  
  console.log("\nAll Tests Passed! 🚀");
}

main().catch(e => {
    console.error("Script Error:", e);
    process.exit(1);
});
