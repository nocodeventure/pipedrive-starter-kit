# Todo example app

A simple todo app where you can manage list of items and mark them as done.

This example app covers following Pipedrive app capabilities:
* OAuth flow with Pipedrive
* Custom UI extensions
* Embedded actions
* Pipedrive API client

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get started.

⚠️ **Disclaimer**

**This repository contains non-production code.**\
Sensitive information, such as tokens or credentials, should always be securely encrypted and stored according to best practices. Do not use hardcoded or plaintext tokens in production.

## Installation

Recommended Node.js version is 16.

Install dependencies with command `npm install`

### Database Setup

This application uses PostgreSQL with Drizzle ORM. You can use any PostgreSQL database provider:
- **Neon** (recommended for serverless)
- **Supabase**
- **AWS RDS**
- **Railway**
- **Local PostgreSQL**

**Steps:**

1. Create a PostgreSQL database (e.g., on [Neon](https://neon.tech))
2. Copy the connection string from your database provider
3. Create a `.env` file in the project root:
   ```
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   ```
4. Push the database schema to your database:
   ```bash
   npm run db:push
   ```
   This will create all required tables (organizations, users, userOrganizations, oauthTokens, todos)

5. **Apply Row-Level Security (RLS) policies:**
   ```bash
   npm run db:apply-rls
   ```
   This enables database-level security policies that ensure users can only access data from their organizations.
   
   > **Important**: RLS policies prevent unauthorized database access even if there's a bug in the application code. This is a critical security layer.

**Database Management Commands:**
- `npm run db:push` - Push schema changes to database (quick, no migration files)
- `npm run db:apply-rls` - Apply Row-Level Security policies
- `npm run db:generate` - Generate migration files from schema changes
- `npm run db:migrate` - Apply migration files to database
- `npm run db:studio` - Open Drizzle Studio (visual database browser)

### Application Setup

Use ngrok or some alternative tunneling service to get publicly accessible HTTPS URL for port 3000.

```
ngrok http 3000 --host-header=localhost
```

```
npm run react:build
```

1. Create an app in Pipedrive Developer Hub.
2. Add Callback URL which is ngrok URL with `/callback` route.
3. Under "App extensions" section create: \
   3.1 "Custom panel" for deal details view. For URL provide the ngrok URL. Choose a JWT secret for the extension. \
   3.2 "JSON modal" for deal details view. For URL provide the ngrok URL with route `/embedded-action`. Choose a JWT secret for the embedded action. Upload `embedded-action-schema.json` as the embedded action schema.
4. Save the app. Retrieve client id and secret from the "OAuth & access scopes" section.
5. Open `config.js` and replace default values with your app specific values.
6. Start the server with command `npm run start`.
7. In the Developer Hub preview your app and press the "Install & test" button and go through OAuth flow.
8. Go to deal details view and the Custom UI Extensions should load.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
