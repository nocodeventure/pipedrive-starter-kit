require('dotenv').config();
const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

/**
 * Apply RLS (Row-Level Security) migration to the database
 * This script reads the SQL file and executes it against your PostgreSQL database
 */
async function applyRLS() {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL not found in environment variables');
        console.error('Please create a .env file with your PostgreSQL connection string');
        process.exit(1);
    }

    const sql = postgres(process.env.DATABASE_URL);

    try {
        console.log('📋 Reading RLS migration file...');
        const migrationPath = path.join(__dirname, 'migrations', 'enable_rls.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        console.log('🔒 Applying Row-Level Security policies...');

        // Execute the migration
        await sql.unsafe(migrationSQL);

        console.log('✅ RLS policies applied successfully!');
        console.log('\nPolicies enabled:');
        console.log('  - Organizations: Users can only access organizations they belong to');
        console.log('  - Users: Users can access their own data and users in their orgs');
        console.log('  - User Organizations: Users can access their own relationships');
        console.log('  - OAuth Tokens: Users can only access their own tokens');
        console.log('  - Todos: Users can access todos from their organizations');
        console.log('\n🎉 Your database is now protected with Row-Level Security!');
    } catch (error) {
        console.error('❌ Error applying RLS migration:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    } finally {
        await sql.end();
    }
}

applyRLS();
