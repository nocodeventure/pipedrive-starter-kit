/**
 * Utility for making authenticated Pipedrive API calls
 */

const config = require('../config');

/**
 * Refresh an expired OAuth access token using the refresh token
 * @param {string} refreshToken - The refresh token
 * @returns {Promise<Object>} New token data { access_token, refresh_token, expires_in, token_type, scope, api_domain }
 */
async function refreshAccessToken(refreshToken) {
    const tokenUrl = 'https://oauth.pipedrive.com/oauth/token';
    
    const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: config.clientId,
        client_secret: config.clientSecret,
    });

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token refresh failed: ${response.status} - ${errorText}`);
    }

    return response.json();
}

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
    refreshAccessToken,
};
