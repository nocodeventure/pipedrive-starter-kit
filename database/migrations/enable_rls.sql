-- Enable Row-Level Security on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (for idempotency)
DROP POLICY IF EXISTS organizations_user_access ON organizations;
DROP POLICY IF EXISTS users_self_access ON users;
DROP POLICY IF EXISTS user_organizations_access ON user_organizations;
DROP POLICY IF EXISTS oauth_tokens_access ON oauth_tokens;
DROP POLICY IF EXISTS todos_org_access ON todos;

-- Organizations: Users can only access organizations they belong to
CREATE POLICY organizations_user_access ON organizations
    FOR ALL
    USING (
        id IN (
            SELECT organization_id 
            FROM user_organizations 
            WHERE user_id = current_setting('app.current_user_id', true)::uuid
        )
    )
    WITH CHECK (
        id IN (
            SELECT organization_id 
            FROM user_organizations 
            WHERE user_id = current_setting('app.current_user_id', true)::uuid
        )
    );

-- Users: Users can access their own record and users in their organizations
CREATE POLICY users_self_access ON users
    FOR ALL
    USING (
        id = current_setting('app.current_user_id', true)::uuid
        OR id IN (
            SELECT uo1.user_id
            FROM user_organizations uo1
            WHERE uo1.organization_id IN (
                SELECT uo2.organization_id
                FROM user_organizations uo2
                WHERE uo2.user_id = current_setting('app.current_user_id', true)::uuid
            )
        )
    )
    WITH CHECK (
        id = current_setting('app.current_user_id', true)::uuid
        OR id IN (
            SELECT uo1.user_id
            FROM user_organizations uo1
            WHERE uo1.organization_id IN (
                SELECT uo2.organization_id
                FROM user_organizations uo2
                WHERE uo2.user_id = current_setting('app.current_user_id', true)::uuid
            )
        )
    );

-- User Organizations: Users can access their own relationships
CREATE POLICY user_organizations_access ON user_organizations
    FOR ALL
    USING (
        user_id = current_setting('app.current_user_id', true)::uuid
        OR organization_id IN (
            SELECT organization_id 
            FROM user_organizations 
            WHERE user_id = current_setting('app.current_user_id', true)::uuid
        )
    )
    WITH CHECK (
        user_id = current_setting('app.current_user_id', true)::uuid
        OR organization_id IN (
            SELECT organization_id 
            FROM user_organizations 
            WHERE user_id = current_setting('app.current_user_id', true)::uuid
        )
    );

-- OAuth Tokens: Users can only access their own tokens
CREATE POLICY oauth_tokens_access ON oauth_tokens
    FOR ALL
    USING (
        user_id = current_setting('app.current_user_id', true)::uuid
    )
    WITH CHECK (
        user_id = current_setting('app.current_user_id', true)::uuid
    );

-- Todos: Users can access todos from their organizations
CREATE POLICY todos_org_access ON todos
    FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_organizations 
            WHERE user_id = current_setting('app.current_user_id', true)::uuid
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT organization_id 
            FROM user_organizations 
            WHERE user_id = current_setting('app.current_user_id', true)::uuid
        )
    );

-- Grant necessary permissions to the database user
-- Note: Replace 'your_db_user' with your actual database username
-- GRANT ALL ON organizations TO your_db_user;
-- GRANT ALL ON users TO your_db_user;
-- GRANT ALL ON user_organizations TO your_db_user;
-- GRANT ALL ON oauth_tokens TO your_db_user;
-- GRANT ALL ON todos TO your_db_user;
