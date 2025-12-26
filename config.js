module.exports = {
    clientId: 'e5424750dcd9a660', // Your Pipedrive App OAuth 2 Client ID
    clientSecret: '6f7406c774d49797c1392bd9c89281733ab2c6e1', // Your Pipedrive App OAuth 2 Client Secret
    redirectUri: 'https://d23b2974a153.ngrok-free.app/callback', // Your Pipedrive App OAuth 2 Redirection endpoint or Callback Uri
    surfaceJwt: 'surfaceJWTSecret', // The JWT you have to set in Pipedrive Marketplace Manager to check security of Surface request
    embeddedActionJwt: 'embeddedActionJWTSecret', // The JWT you have to set in Pipedrive Marketplace Manager to check security of Embedded action request
    settingsJwt: 'settingsJWTSecret', // The JWT you have to set in Pipedrive Marketplace Manager to check security of Settings widget request
}
