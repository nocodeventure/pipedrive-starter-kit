const { eq, and } = require('drizzle-orm');
const { sql } = require('drizzle-orm');
const db = require('./db');
const { withUserContext } = require('./db');
const { organizations, users, userOrganizations, oauthTokens } = require('./schema');
const { getUserInfo } = require('../utils/pipedrive-api');

/**
 * Save OAuth installation by fetching verified user/company data from Pipedrive API
 * Note: This runs WITHOUT RLS context as it's during initial installation
 * @param {string} userId - Initial userId from token (not used, we fetch verified data)
 * @param {string} companyId - Initial companyId from token (not used, we fetch verified data)
 * @param {Object} tokens - OAuth token response from Pipedrive
 */
async function saveInstallation(userId, companyId, tokens) {
    try {
        const { access_token, refresh_token, expires_in, token_type, scope, api_domain } = tokens;

        // Fetch verified user and company information from Pipedrive API
        const userInfo = await getUserInfo(api_domain, access_token);

        // Calculate token expiration timestamp
        const expiresAt = new Date(Date.now() + expires_in * 1000);

        // Use a transaction to properly handle SET LOCAL
        const result = await db.transaction(async (tx) => {
            // Disable RLS within transaction (we need to insert before user exists)
            await tx.execute(sql`SET LOCAL row_security = off`);

            // Upsert organization with verified data
            const [org] = await tx
                .insert(organizations)
                .values({
                    companyId: userInfo.company_id,
                    companyName: userInfo.company_name,
                    companyDomain: userInfo.company_domain,
                    companyCountry: userInfo.company_country,
                    apiDomain: api_domain,
                    updatedAt: new Date(),
                })
                .onConflictDoUpdate({
                    target: organizations.companyId,
                    set: {
                        companyName: userInfo.company_name,
                        companyDomain: userInfo.company_domain,
                        companyCountry: userInfo.company_country,
                        apiDomain: api_domain,
                        updatedAt: new Date(),
                    },
                })
                .returning();

            // Upsert user with verified data
            const [user] = await tx
                .insert(users)
                .values({
                    pipedriveUserId: userInfo.id,
                    email: userInfo.email,
                    name: userInfo.name,
                    locale: userInfo.locale,
                    language: userInfo.language?.language_code || 'en',
                    timezone: userInfo.timezone_name,
                    isAdmin: Boolean(userInfo.is_admin),
                    activeFlag: Boolean(userInfo.active_flag),
                    updatedAt: new Date(),
                })
                .onConflictDoUpdate({
                    target: users.pipedriveUserId,
                    set: {
                        email: userInfo.email,
                        name: userInfo.name,
                        locale: userInfo.locale,
                        language: userInfo.language?.language_code || 'en',
                        timezone: userInfo.timezone_name,
                        isAdmin: Boolean(userInfo.is_admin),
                        activeFlag: Boolean(userInfo.active_flag),
                        updatedAt: new Date(),
                    },
                })
                .returning();

            // Create/update user-organization relationship
            await tx
                .insert(userOrganizations)
                .values({
                    userId: user.id,
                    organizationId: org.id,
                    role: userInfo.is_admin ? 'admin' : 'member',
                })
                .onConflictDoUpdate({
                    target: [userOrganizations.userId, userOrganizations.organizationId],
                    set: {
                        role: userInfo.is_admin ? 'admin' : 'member',
                    },
                });

            // Store/update OAuth tokens
            await tx
                .insert(oauthTokens)
                .values({
                    userId: user.id,
                    organizationId: org.id,
                    accessToken: access_token,
                    refreshToken: refresh_token,
                    tokenType: token_type,
                    scope: scope,
                    expiresAt: expiresAt,
                    updatedAt: new Date(),
                })
                .onConflictDoUpdate({
                    target: [oauthTokens.userId, oauthTokens.organizationId],
                    set: {
                        accessToken: access_token,
                        refreshToken: refresh_token,
                        tokenType: token_type,
                        scope: scope,
                        expiresAt: expiresAt,
                        updatedAt: new Date(),
                    },
                });

            console.log(`Installation saved for user ${userInfo.name} (${userInfo.email}) at ${userInfo.company_name}`);

            // Return the verified IDs for use in subsequent operations
            return {
                userId: userInfo.id.toString(),
                companyId: userInfo.company_id.toString()
            };
        });

        return result;
    } catch (error) {
        console.error('Error saving installation:', error);
        throw error;
    }
}

/**
 * Delete OAuth installation for a user-company combination
 * Deletes the user-org relationship, and cleans up user/org if no longer needed
 * @param {string} userId - Pipedrive user ID
 * @param {string} companyId - Pipedrive company ID
 */
async function deleteInstallation(userId, companyId) {
    try {
        // Use a transaction to properly handle SET LOCAL
        await db.transaction(async (tx) => {
            // Disable RLS within transaction
            await tx.execute(sql`SET LOCAL row_security = off`);

            // Find user and organization
            const [user] = await tx
                .select()
                .from(users)
                .where(eq(users.pipedriveUserId, parseInt(userId)));

            const [org] = await tx
                .select()
                .from(organizations)
                .where(eq(organizations.companyId, parseInt(companyId)));

            if (!user || !org) {
                console.log('User or organization not found');
                return;
            }

            // Delete OAuth tokens (will cascade to userOrganizations)
            await tx
                .delete(oauthTokens)
                .where(
                    and(
                        eq(oauthTokens.userId, user.id),
                        eq(oauthTokens.organizationId, org.id)
                    )
                );

            // Check if organization has any remaining users
            const remainingOrgUsers = await tx
                .select()
                .from(userOrganizations)
                .where(eq(userOrganizations.organizationId, org.id));

            // If no users left in organization, delete it (cascades to todos)
            if (remainingOrgUsers.length === 0) {
                await tx
                    .delete(organizations)
                    .where(eq(organizations.id, org.id));
                console.log(`Organization ${org.companyName} deleted (no users remaining)`);
            }

            // Check if user has any remaining organizations
            const remainingUserOrgs = await tx
                .select()
                .from(userOrganizations)
                .where(eq(userOrganizations.userId, user.id));

            // If user has no other organizations, delete the user
            if (remainingUserOrgs.length === 0) {
                await tx
                    .delete(users)
                    .where(eq(users.id, user.id));
                console.log(`User ${user.name} deleted (no organizations remaining)`);
            }

            console.log(`Installation deleted for userId ${userId} and companyId ${companyId}`);
        });
    } catch (error) {
        console.error('Error deleting installation:', error);
        throw error;
    }
}

/**
 * Get OAuth installation for a user-company combination
 * @param {string} userId - Pipedrive user ID
 * @param {string} companyId - Pipedrive company ID
 * @returns {Object} Installation data in original format for backward compatibility
 */
async function getClientInstallation(userId, companyId) {
    try {
        // Use a transaction to properly handle SET LOCAL
        return await db.transaction(async (tx) => {
            // Disable RLS to find user and org
            await tx.execute(sql`SET LOCAL row_security = off`);

            const [user] = await tx
                .select()
                .from(users)
                .where(eq(users.pipedriveUserId, parseInt(userId)));

            const [org] = await tx
                .select()
                .from(organizations)
                .where(eq(organizations.companyId, parseInt(companyId)));

            if (!user || !org) {
                return null;
            }

            // Fetch OAuth tokens
            const [tokens] = await tx
                .select()
                .from(oauthTokens)
                .where(
                    and(
                        eq(oauthTokens.userId, user.id),
                        eq(oauthTokens.organizationId, org.id)
                    )
                );

            if (!tokens) {
                return null;
            }

            // Return in original format for backward compatibility
            return {
                access_token: tokens.accessToken,
                refresh_token: tokens.refreshToken,
                token_type: tokens.tokenType,
                scope: tokens.scope,
                api_domain: org.apiDomain,
                userId: userId,
                companyId: companyId,
            };
        });
    } catch (error) {
        console.error('Error getting client installation:', error);
        throw error;
    }
}

/**
 * Update client installation (placeholder for token refresh logic)
 */
async function updateClientInstallation() {
    // TODO: Implement token refresh logic if needed
    console.log('updateClientInstallation called - implement token refresh if needed');
}

module.exports = {
    saveInstallation,
    deleteInstallation,
    getClientInstallation,
    updateClientInstallation,
};