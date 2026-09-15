-- ============================================================================
-- PRAVAHA: Multi-Company Authentication, Organization Members & RLS Migration
-- ============================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    full_name TEXT,
    phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'utc')
);

-- Ensure created_by column on industries / companies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'industries' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE industries ADD COLUMN created_by UUID;
    END IF;
END $$;

-- 2. Organization Members (Company Workspaces & Role Mapping)
CREATE TABLE IF NOT EXISTS organization_members (
    company_id INTEGER NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'engineer', 'viewer')),
    joined_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'utc'),
    PRIMARY KEY (company_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_company_id ON organization_members(company_id);
CREATE INDEX IF NOT EXISTS idx_industries_created_by ON industries(created_by);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE substations ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE threats ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- RLS Policies
-- ----------------------------------------------------------------------------

-- PROFILES
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- ORGANIZATION MEMBERS
DROP POLICY IF EXISTS "Users can view their own memberships" ON organization_members;
CREATE POLICY "Users can view their own memberships"
    ON organization_members FOR SELECT
    USING (auth.uid() = user_id);

-- INDUSTRIES / COMPANIES
DROP POLICY IF EXISTS "Users can view companies they belong to" ON industries;
CREATE POLICY "Users can view companies they belong to"
    ON industries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.company_id = industries.id
            AND organization_members.user_id = auth.uid()
        )
    );

-- SUBSTATIONS
DROP POLICY IF EXISTS "Users can view substations for their companies" ON substations;
CREATE POLICY "Users can view substations for their companies"
    ON substations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.company_id = substations.industry_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- ASSETS
DROP POLICY IF EXISTS "Users can view assets for their companies" ON assets;
CREATE POLICY "Users can view assets for their companies"
    ON assets FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM substations
            JOIN organization_members ON organization_members.company_id = substations.industry_id
            WHERE substations.id = assets.substation_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- THREATS
DROP POLICY IF EXISTS "Users can view threats for their companies" ON threats;
CREATE POLICY "Users can view threats for their companies"
    ON threats FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM assets
            JOIN substations ON substations.id = assets.substation_id
            JOIN organization_members ON organization_members.company_id = substations.industry_id
            WHERE assets.id = threats.asset_id
            AND organization_members.user_id = auth.uid()
        )
    );
