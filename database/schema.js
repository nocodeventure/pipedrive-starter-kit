const { pgTable, uuid, integer, text, boolean, timestamp, index, unique } = require('drizzle-orm/pg-core');

// Organizations table - stores Pipedrive company information
const organizations = pgTable('organizations', {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: integer('company_id').notNull().unique(),
    companyName: text('company_name').notNull(),
    companyDomain: text('company_domain').notNull(),
    companyCountry: text('company_country'),
    apiDomain: text('api_domain').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Users table - stores Pipedrive user information
const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    pipedriveUserId: integer('pipedrive_user_id').notNull().unique(),
    email: text('email').notNull(),
    name: text('name').notNull(),
    locale: text('locale'),
    language: text('language'),
    timezone: text('timezone'),
    isAdmin: boolean('is_admin').default(false).notNull(),
    activeFlag: boolean('active_flag').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User-Organization junction table - many-to-many relationship
const userOrganizations = pgTable('user_organizations', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    role: text('role').notNull().default('member'), // 'owner', 'admin', 'member'
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    userOrgUnique: unique('user_org_unique').on(table.userId, table.organizationId),
}));

// OAuth tokens table - stores OAuth credentials per user-organization
const oauthTokens = pgTable('oauth_tokens', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    accessToken: text('access_token').notNull(),
    refreshToken: text('refresh_token').notNull(),
    tokenType: text('token_type').notNull(),
    scope: text('scope').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    userOrgTokenUnique: unique('user_org_token_unique').on(table.userId, table.organizationId),
}));

// Todos table - stores todo items
const todos = pgTable('todos', {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    dealId: text('deal_id').notNull(),
    title: text('title').notNull(),
    checked: boolean('checked').default(false).notNull(),
    deleted: boolean('deleted').default(false).notNull(),
    displayOrder: integer('display_order').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    orgDealIdx: index('org_deal_idx').on(table.organizationId, table.dealId, table.deleted),
}));

module.exports = {
    organizations,
    users,
    userOrganizations,
    oauthTokens,
    todos,
};
