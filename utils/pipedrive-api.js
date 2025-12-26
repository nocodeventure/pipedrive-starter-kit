/**
 * Utility for making authenticated Pipedrive API calls
 */

/**
 * Fetch current user information from Pipedrive API
 * @param {string} apiDomain - The API domain (e.g., "https://nocodeventure.pipedrive.com")
 * @param {string} accessToken - OAuth access token
 * @returns {Promise<Object>} User and company information
 */
async function getUserInfo(apiDomain, accessToken) {
    try {
        const response = await fetch(`${apiDomain}/api/v1/users/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Pipedrive API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error('Pipedrive API returned unsuccessful response');
        }

        return result.data;
    } catch (error) {
        console.error('Error fetching user info from Pipedrive:', error);
        throw error;
    }
}

module.exports = {
    getUserInfo,
};
