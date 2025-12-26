const { eq } = require('drizzle-orm');
const db = require('../../database/db');
const { sql } = require('../../database/db');
const { users, organizations } = require('../../database/schema');
const { getUserInfo } = require('../../utils/pipedrive-api');
const { getValidTokens } = require('../../database/oauth');

/**
 * Secured endpoint to get current user information from Pipedrive API
 * Route: GET /user/me/:userId/:companyId
 * Requires JWT authentication
 */
async function handler(req, res) {
    const { userId, companyId } = req.params;

    try {
        // Get valid tokens (automatically refreshes if expired)
        const tokenData = await getValidTokens(userId, companyId);

        // Call Pipedrive API to get latest user info
        const userInfo = await getUserInfo(tokenData.api_domain, tokenData.access_token);

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
            .where(eq(users.id, tokenData.user.id));

        await db
            .update(organizations)
            .set({
                companyName: userInfo.company_name,
                companyDomain: userInfo.company_domain,
                companyCountry: userInfo.company_country,
                updatedAt: new Date(),
            })
            .where(eq(organizations.id, tokenData.org.id));

        // Re-enable RLS
        await sql`SET LOCAL row_security = on`;

        // Return Pipedrive API response
        res.json({
            success: true,
            data: userInfo,
        });
    } catch (error) {
        console.error('Error fetching user info:', error);
        
        // Handle specific error cases
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: error.message,
            });
        }
        if (error.message.includes('refresh failed') || error.message.includes('re-authorize')) {
            return res.status(401).json({
                success: false,
                error: error.message,
            });
        }
        
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error',
        });
    }
}

module.exports = handler;
