const { eq, and, max } = require('drizzle-orm');
const db = require('./db');
const { withUserContext } = require('./db');
const { organizations, users, todos } = require('./schema');

/**
 * Get user UUID from Pipedrive user ID
 * @param {string} userId - Pipedrive user ID
 * @returns {string} User UUID
 */
async function getUserUuid(userId) {
    const { sql } = require('./db');
    await sql`SET LOCAL row_security = off`;

    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.pipedriveUserId, parseInt(userId)));

    await sql`SET LOCAL row_security = on`;

    if (!user) {
        throw new Error(`User not found for userId: ${userId}`);
    }

    return user.id;
}

/**
 * Save a new todo record
 * @param {string} userId - Pipedrive user ID
 * @param {string} companyId - Pipedrive company ID
 * @param {string} dealId - Pipedrive deal ID
 * @param {Object} record - Record data with title
 * @returns {Object} Created record with id
 */
async function saveRecord(userId, companyId, dealId, record) {
    try {
        const userUuid = await getUserUuid(userId);

        return await withUserContext(userUuid, async (db) => {
            // Find organization by companyId
            const [org] = await db
                .select()
                .from(organizations)
                .where(eq(organizations.companyId, parseInt(companyId)));

            if (!org) {
                throw new Error(`Organization not found for companyId: ${companyId}`);
            }

            // Calculate next display order (max + 1)
            const result = await db
                .select({ maxOrder: max(todos.displayOrder) })
                .from(todos)
                .where(
                    and(
                        eq(todos.organizationId, org.id),
                        eq(todos.dealId, dealId),
                        eq(todos.deleted, false)
                    )
                );

            const nextOrder = (result[0]?.maxOrder || 0) + 1;

            // Insert new todo
            const [newTodo] = await db
                .insert(todos)
                .values({
                    organizationId: org.id,
                    dealId: dealId,
                    title: record.title,
                    checked: false,
                    deleted: false,
                    displayOrder: nextOrder,
                })
                .returning();

            return { id: newTodo.id };
        });
    } catch (error) {
        console.error('Error saving record:', error);
        throw error;
    }
}

/**
 * Hard delete a todo record
 * @param {string} userId - Pipedrive user ID
 * @param {string} companyId - Pipedrive company ID
 * @param {string} dealId - Pipedrive deal ID
 * @param {string} recordId - Todo record ID
 * @returns {Object} Deleted record
 */
async function deleteRecord(userId, companyId, dealId, recordId) {
    try {
        const userUuid = await getUserUuid(userId);

        return await withUserContext(userUuid, async (db) => {
            // Find organization by companyId
            const [org] = await db
                .select()
                .from(organizations)
                .where(eq(organizations.companyId, parseInt(companyId)));

            if (!org) {
                throw new Error(`Organization not found for companyId: ${companyId}`);
            }

            // Hard delete: Remove from database
            const [deletedTodo] = await db
                .delete(todos)
                .where(
                    and(
                        eq(todos.id, recordId),
                        eq(todos.organizationId, org.id),
                        eq(todos.dealId, dealId)
                    )
                )
                .returning();

            return deletedTodo;
        });
    } catch (error) {
        console.error('Error deleting record:', error);
        throw error;
    }
}

/**
 * Get todo record(s)
 * @param {string} userId - Pipedrive user ID
 * @param {string} companyId - Pipedrive company ID
 * @param {string} dealId - Pipedrive deal ID
 * @param {string} recordId - Optional specific record ID
 * @returns {Object} Single record or object of records
 */
async function getRecord(userId, companyId, dealId, recordId) {
    try {
        const userUuid = await getUserUuid(userId);

        return await withUserContext(userUuid, async (db) => {
            // Find organization by companyId
            const [org] = await db
                .select()
                .from(organizations)
                .where(eq(organizations.companyId, parseInt(companyId)));

            if (!org) {
                return {};
            }

            // If recordId provided, fetch single todo
            if (recordId) {
                const [todo] = await db
                    .select()
                    .from(todos)
                    .where(
                        and(
                            eq(todos.id, recordId),
                            eq(todos.organizationId, org.id),
                            eq(todos.dealId, dealId)
                        )
                    );

                return todo;
            }

            // Fetch all non-deleted todos for the deal, ordered by displayOrder
            const allTodos = await db
                .select()
                .from(todos)
                .where(
                    and(
                        eq(todos.organizationId, org.id),
                        eq(todos.dealId, dealId),
                        eq(todos.deleted, false)
                    )
                )
                .orderBy(todos.displayOrder);

            // Convert to object with UUID keys
            const todosObj = {};
            allTodos.forEach((todo) => {
                todosObj[todo.id] = {
                    id: todo.id,
                    title: todo.title,
                    checked: todo.checked,
                    deleted: todo.deleted,
                };
            });

            return todosObj;
        });
    } catch (error) {
        console.error('Error getting record:', error);
        throw error;
    }
}

/**
 * Update a todo record
 * @param {string} userId - Pipedrive user ID
 * @param {string} companyId - Pipedrive company ID
 * @param {string} dealId - Pipedrive deal ID
 * @param {Object} record - Record data with id, title, checked
 */
async function updateRecord(userId, companyId, dealId, record) {
    try {
        const userUuid = await getUserUuid(userId);

        return await withUserContext(userUuid, async (db) => {
            // Find organization by companyId
            const [org] = await db
                .select()
                .from(organizations)
                .where(eq(organizations.companyId, parseInt(companyId)));

            if (!org) {
                throw new Error(`Organization not found for companyId: ${companyId}`);
            }

            // Update todo
            await db
                .update(todos)
                .set({
                    title: record.title,
                    checked: record.checked,
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(todos.id, record.id),
                        eq(todos.organizationId, org.id),
                        eq(todos.dealId, dealId)
                    )
                );
        });
    } catch (error) {
        console.error('Error updating record:', error);
        throw error;
    }
}

module.exports = {
    saveRecord,
    deleteRecord,
    getRecord,
    updateRecord,
};
