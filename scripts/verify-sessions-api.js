const { PrismaClient } = require('../prisma/generated/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

// Initialize Prisma with Adapter
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting verification...');

  // 1. Get a user
  let user = await prisma.user.findFirst({ where: { email: 'test@test.com' } });
  if (!user) {
    user = await prisma.user.findFirst();
  }

  if (!user) {
    console.log('No user found. Please create a user first via the UI.');
    return;
  }
  console.log(`Found user: ${user.email} (${user.id})`);

  // 2. Test POST /api/sessions (Fetch against localhost:3000)
  // We assume the app is running on port 3000.
  const baseUrl = 'http://localhost:3000/api/sessions';
  
  const newSessionData = {
    userId: user.id,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString(), // +1 hour
    durationSeconds: 3600,
    notes: 'Test session from verification script',
    tags: ['Verification', 'Test']
  };

  console.log('Creating session via API...');
  try {
      const createRes = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSessionData)
      });
      
      if (!createRes.ok) {
          const txt = await createRes.text();
          throw new Error(`Failed to create session: ${createRes.status} ${txt}`);
      }
      
      const createdSession = await createRes.json();
      console.log('Session created:', createdSession);
      
      if (createdSession.tags.includes('Verification')) {
          console.log('Tags verified.');
      } else {
          console.error('Tags mismatch:', createdSession.tags);
      }

      // 3. Test GET /api/sessions
      console.log('Fetching sessions via API...');
      const getRes = await fetch(`${baseUrl}?userId=${user.id}`);
      if (!getRes.ok) {
           const txt = await getRes.text();
          throw new Error(`Failed to get sessions: ${getRes.status} ${txt}`);
      }
      
      const sessions = await getRes.json();
      console.log(`Retrieved ${sessions.length} sessions.`);
      
      // Since API returns ASC, the new session should be at the end
      const found = sessions.find(s => s.id === createdSession.id);
      if (found) {
          console.log('Verified: Created session found in list.');
      } else {
          console.error('Error: Created session not found in list.');
      }

  } catch (err) {
      if (err.cause && err.cause.code === 'ECONNREFUSED') {
          console.log('Could not connect to localhost:3000. Is the server running?');
      } else {
          console.error('Verification failed:', err);
      }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
