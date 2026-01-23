export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Dynamic import to avoid bundling issues if this file is imported in sensitive environments regarding 'pg'
    const { default: prisma } = await import('./lib/prisma');

    const checkDb = async () => {
      try {
        await prisma.$queryRaw`SELECT 1`;
        console.log('Database health check: OK');
      } catch (error) {
        console.error('Database health check: FAILED', error);
      }
    };

    // Run the check immediately on start
    checkDb();

    // Schedule the check every 5 seconds
    setInterval(checkDb, 5000);
  }
}
