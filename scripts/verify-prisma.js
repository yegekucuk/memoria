const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../prisma/generated/client');

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5433/postgres";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Connecting to database...');
  
  // Create a user
  try {
      const user = await prisma.user.create({
        data: {
          email: `test-custom-${Date.now()}@example.com`,
          name: 'Test Custom User',
          tags: {
            create: [
              { name: 'Custom', color: 'purple' },
            ],
          },
        },
        include: {
          tags: true,
        },
      });

      console.log('Created user:', JSON.stringify(user, null, 2));
      
      const count = await prisma.user.count();
      console.log(`Total users: ${count}`);

      console.log('Verification successful!');
  } catch (e) {
      console.error("Error during verification:", e);
      process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
