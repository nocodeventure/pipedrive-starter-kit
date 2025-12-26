const { eq, and } = require('drizzle-orm');
const db = require('../../database/db');
const { withUserContext, sql } = require('../../database/db');
const { organizations, users, userOrganizations, oauthTokens } = require('../../database/schema');
const { getUserInfo } = require('../../utils/pipedrive-api');

/**
 * Secured endpoint to get current user information from Pipedrive API
 * Route: GET /user/me/:userId/:companyId
 * Requires JWT authentication
 */
async function handler(req, res) {
    const { userId, companyId } = req.params;

    try {
        // Temporarily disable RLS to find user
        await sql`SET LOCAL row_security = off`;

        // Find user and organization
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.pipedriveUserId, parseInt(userId)));

        const [org] = await db
            .select()
            .from(organizations)
            .where(eq(organizations.companyId, parseInt(companyId)));

        if (!user || !org) {
            await sql`SET LOCAL row_security = on`;
            return res.status(404).json({
                success: false,
                error: 'User or organization not found',
            });
        }

        // Re-enable RLS and use user context
        await sql`SET LOCAL row_security = on`;

        const result = await withUserContext(user.id, async (db) => {
            // Fetch OAuth tokens for the user-organization
            const [tokens] = await db
                .select()
                .from(oauthTokens)
                .where(
                    and(
                        eq(oauthTokens.userId, user.id),
                        eq(oauthTokens.organizationId, org.id)
                    )
                );

            if (!tokens) {
                return {
                    error: 'OAuth tokens not found',
                    status: 404,
                };
            }

            // Check if token is expired
            if (new Date() > tokens.expiresAt) {
                return {
                    error: 'Access token expired. Token refresh needed.',
                    status: 401,
                };
            }

            // Call Pipedrive API to get latest user info
            const userInfo = await getUserInfo(org.apiDomain, tokens.accessToken);

            // Temporarily disable RLS for updates
            await sql`SET LOCAL row_security = off`;

            // Update user and organization records with latest data
            await db
                .update(users)
                .set({
                    email: userInfo.email,
                    name: userInfo.name,
                    locale: userInfo.locale,
                    language: userInfo.language?.language_code || 'en',
                    timezone: userInfo.timezone_name,
                    isAdmin: Boolean(userInfo.is_admin),
                    activeFlag: Boolean(userInfo.active_flag),
                    updatedAt: new Date(),
                })
                .where(eq(users.id, user.id));

            await db
                .update(organizations)
                .set({
                    companyName: userInfo.company_name,
                    companyDomain: userInfo.company_domain,
                    companyCountry: userInfo.company_country,
                    updatedAt: new Date(),
                })
                .where(eq(organizations.id, org.id));

            // Re-enable RLS
            await sql`SET LOCAL row_security = on`;

            return {
                success: true,
                data: userInfo,
            };
        });

        if (result.error) {
            return res.status(result.status).json({
                success: false,
                error: result.error,
            });
        }

        // Return Pipedrive API response
        res.json(result);
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error',
        });
    }
}

module.exports = handler;
