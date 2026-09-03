/**
 * Unified Database Seeder
 * Ingests the full production-grade enterprise dataset (322 loans, 180 borrowers, 150 lenders, 127 listed loans)
 * Ensures both demo personas and rich marketplace listings are fully populated.
 */
const seedEnterpriseDatabase = require('./seedEnterprise');

async function seedDatabase() {
  console.log('[Seed] Initiating full enterprise database seed...');
  await seedEnterpriseDatabase();
  process.exit(0);
}

if (require.main === module) {
  seedDatabase().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = seedDatabase;
