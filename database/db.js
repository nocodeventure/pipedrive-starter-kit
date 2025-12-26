const postgres = require('postgres');
const { drizzle } = require('drizzle-orm/postgres-js');
const schema = require('./schema');

// Initialize PostgreSQL client (works with any PostgreSQL database: Neon, Supabase, AWS RDS, local, etc.)
const sql = postgres(process.env.DATABASE_URL);

// Create Drizzle instance with schema
const db = drizzle(sql, { schema });

/**
 * Execute a database query with user context for RLS
 * @param {string} userUuid - The UUID of the current user
 * @param {Function} callback - Async function that performs database operations
 * @returns {Promise} Result of the callback
 */
async function withUserContext(userUuid, callback) {
    if (!userUuid) {
        throw new Error('User UUID is required for database operations');
    }

    // Set the current user ID in the session for RLS policies
    await sql`SELECT set_config('app.current_user_id', ${userUuid}, true)`;

    try {
        // Execute the callback with the user context set
        return await callback(db);
    } finally {
        // Reset the session variable (optional, as 'true' makes it transaction-local)
        await sql`SELECT set_config('app.current_user_id', '', true)`;
    }
}

module.exports = db;
module.exports.withUserContext = withUserContext;
module.exports.sql = sql;
