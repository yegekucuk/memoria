const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../prisma/generated/client');

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5433/postgres";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Connecting to database...');
  const uniqueId = Date.now();
  const userEmail = `crud-test-${uniqueId}@example.com`;
  const tagName = `CRUD-Tag-${uniqueId}`;

  try {
    // 1. Create
    console.log('1. Creating User and Tag...');
    const user = await prisma.user.create({
      data: {
        email: userEmail,
        name: 'CRUD Tester',
        tags: {
          create: [{ name: tagName, color: 'red' }]
        }
      },
      include: { tags: true }
    });
    console.log('   Created:', user.id, user.tags[0].name);

    if (user.tags[0].name !== tagName) throw new Error("Tag creation failed");

    // 2. Edit
    console.log('2. Updating Tag color...');
    const tagId = user.tags[0].id;
    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: { color: 'green' }
    });
    console.log('   Updated color:', updatedTag.color);
    
    if (updatedTag.color !== 'green') throw new Error("Tag update failed");

    // 3. Delete
    console.log('3. Deleting Tag...');
    await prisma.tag.delete({ where: { id: tagId } });
    const deletedTagCheck = await prisma.tag.findUnique({ where: { id: tagId } });
    if (deletedTagCheck) throw new Error("Tag deletion failed");
    console.log('   Tag deleted.');

    // 4. Add Back
    console.log('4. Adding Tag back...');
    const newTag = await prisma.tag.create({
      data: {
        name: tagName,
        color: 'blue',
        userId: user.id
      }
    });
    console.log('   Added back:', newTag.name, newTag.color);

    if (newTag.name !== tagName) throw new Error("Tag re-creation failed");

    // Cleanup
    console.log('5. Cleaning up...');
    await prisma.tag.delete({ where: { id: newTag.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log('   Cleanup done.');

    console.log('SUCCESS: All CRUD operations verified.');

  } catch (e) {
      console.error("ERROR:", e);
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
