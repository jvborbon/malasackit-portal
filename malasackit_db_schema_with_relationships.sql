-- Enhanced PostgreSQL Schema with Explicit Relationship Documentation
-- This script includes detailed comments for ERD tools
-- For draw.io: Import this into PostgreSQL first, then use draw.io's SQL import feature

BEGIN;

-- ============================================================================
-- BASE TABLES (No Dependencies)
-- ============================================================================

-- Table: roles
-- Description: User roles for access control
CREATE TABLE IF NOT EXISTS public.roles
(
    role_id serial NOT NULL,
    role_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT roles_pkey PRIMARY KEY (role_id),
    CONSTRAINT roles_role_name_key UNIQUE (role_name)
);
COMMENT ON TABLE public.roles IS 'User roles for access control';

-- Table: permissions
-- Description: Available permissions in the system
CREATE TABLE IF NOT EXISTS public.permissions
(
    permission_id serial NOT NULL,
    permission_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    perm_description text COLLATE pg_catalog."default",
    CONSTRAINT permissions_pkey PRIMARY KEY (permission_id),
    CONSTRAINT permissions_permission_name_key UNIQUE (permission_name)
);
COMMENT ON TABLE public.permissions IS 'Available permissions in the system';

-- Table: rolepermissions
-- Description: Many-to-many relationship between roles and permissions
CREATE TABLE IF NOT EXISTS public.rolepermissions
(
    role_id integer NOT NULL,
    permission_id integer NOT NULL,
    CONSTRAINT rolepermissions_pkey PRIMARY KEY (role_id, permission_id)
);
COMMENT ON TABLE public.rolepermissions IS 'Junction table: roles ←→ permissions (many-to-many)';

-- Table: vicariates
-- Description: Church vicariates
CREATE TABLE IF NOT EXISTS public.vicariates
(
    vicariate_id serial NOT NULL,
    vicariate_name character varying(150) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT vicariates_pkey PRIMARY KEY (vicariate_id),
    CONSTRAINT vicariates_vicariate_name_key UNIQUE (vicariate_name)
);
COMMENT ON TABLE public.vicariates IS 'Church vicariates';

-- Table: parishes
-- Description: Church parishes (many parishes → one vicariate)
CREATE TABLE IF NOT EXISTS public.parishes
(
    parish_id serial NOT NULL,
    parish_name character varying(150) COLLATE pg_catalog."default" NOT NULL,
    parish_priest character varying(100) COLLATE pg_catalog."default",
    vicariate_id integer,
    CONSTRAINT parishes_pkey PRIMARY KEY (parish_id)
);
COMMENT ON TABLE public.parishes IS 'Church parishes';
COMMENT ON COLUMN public.parishes.vicariate_id IS 'FK: vicariate_id → vicariates.vicariate_id (many-to-one)';

-- Table: table_region
-- Description: Philippine regions
CREATE TABLE IF NOT EXISTS public.table_region
(
    region_id serial NOT NULL,
    region_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    region_description character varying(100) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT table_region_pkey PRIMARY KEY (region_id),
    CONSTRAINT table_region_region_name_key UNIQUE (region_name)
);
COMMENT ON TABLE public.table_region IS 'Philippine regions';

-- Table: table_province
-- Description: Philippine provinces (many provinces → one region)
CREATE TABLE IF NOT EXISTS public.table_province
(
    province_id serial NOT NULL,
    region_id integer NOT NULL,
    province_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT table_province_pkey PRIMARY KEY (province_id),
    CONSTRAINT uqt_provincename UNIQUE (region_id, province_name)
);
COMMENT ON TABLE public.table_province IS 'Philippine provinces';
COMMENT ON COLUMN public.table_province.region_id IS 'FK: region_id → table_region.region_id (many-to-one)';

-- Table: table_municipality
-- Description: Philippine municipalities (many municipalities → one province)
CREATE TABLE IF NOT EXISTS public.table_municipality
(
    municipality_id serial NOT NULL,
    province_id integer,
    municipality_name character varying(100) COLLATE pg_catalog."default",
    CONSTRAINT table_municipality_pkey PRIMARY KEY (municipality_id),
    CONSTRAINT uqt_municipality UNIQUE (province_id, municipality_name)
);
COMMENT ON TABLE public.table_municipality IS 'Philippine municipalities';
COMMENT ON COLUMN public.table_municipality.province_id IS 'FK: province_id → table_province.province_id (many-to-one)';

-- Table: table_barangay
-- Description: Philippine barangays (many barangays → one municipality)
CREATE TABLE IF NOT EXISTS public.table_barangay
(
    barangay_id serial NOT NULL,
    municipality_id integer NOT NULL,
    barangay_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT table_barangay_pkey PRIMARY KEY (barangay_id),
    CONSTRAINT uqt_barangay UNIQUE (municipality_id, barangay_name)
);
COMMENT ON TABLE public.table_barangay IS 'Philippine barangays';
COMMENT ON COLUMN public.table_barangay.municipality_id IS 'FK: municipality_id → table_municipality.municipality_id (many-to-one)';

-- Table: appointments
-- Description: Appointment schedule entries
CREATE TABLE IF NOT EXISTS public.appointments
(
    appointment_id serial NOT NULL,
    appointment_date date NOT NULL,
    appointment_time time without time zone,
    description text COLLATE pg_catalog."default",
    status character varying(20) COLLATE pg_catalog."default" DEFAULT 'Scheduled'::character varying,
    remarks text COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT appointments_pkey PRIMARY KEY (appointment_id)
);
COMMENT ON TABLE public.appointments IS 'Appointment schedule entries';

-- Table: users
-- Description: System users (donors, staff, beneficiaries)
CREATE TABLE IF NOT EXISTS public.users
(
    user_id character varying(25) COLLATE pg_catalog."default" NOT NULL,
    full_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    contact_num character varying(20) COLLATE pg_catalog."default",
    account_type character varying(20) COLLATE pg_catalog."default",
    role_id integer,
    status character varying(20) COLLATE pg_catalog."default" DEFAULT 'active'::character varying,
    region_id integer,
    province_id integer,
    municipality_id integer,
    barangay_id integer,
    email_verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp without time zone,
    bio text COLLATE pg_catalog."default",
    is_approved boolean DEFAULT false,
    approved_by character varying(25) COLLATE pg_catalog."default",
    approved_at timestamp without time zone,
    parish_id integer,
    vicariate_id integer,
    is_walkin_generated boolean DEFAULT false,
    temp_email_generated boolean DEFAULT false,
    streetaddress text COLLATE pg_catalog."default",
    is_online boolean DEFAULT false,
    last_logout timestamp without time zone,
    CONSTRAINT users_pkey PRIMARY KEY (user_id),
    CONSTRAINT users_email_key UNIQUE (email)
);
COMMENT ON TABLE public.users IS 'System users (donors, staff, beneficiaries)';
COMMENT ON COLUMN public.users.role_id IS 'FK: role_id → roles.role_id (many-to-one)';
COMMENT ON COLUMN public.users.region_id IS 'FK: region_id → table_region.region_id (many-to-one)';
COMMENT ON COLUMN public.users.province_id IS 'FK: province_id → table_province.province_id (many-to-one)';
COMMENT ON COLUMN public.users.municipality_id IS 'FK: municipality_id → table_municipality.municipality_id (many-to-one)';
COMMENT ON COLUMN public.users.barangay_id IS 'FK: barangay_id → table_barangay.barangay_id (many-to-one)';
COMMENT ON COLUMN public.users.approved_by IS 'FK: approved_by → users.user_id (self-referencing, many-to-one)';
COMMENT ON COLUMN public.users.parish_id IS 'FK: parish_id → parishes.parish_id (many-to-one)';
COMMENT ON COLUMN public.users.vicariate_id IS 'FK: vicariate_id → vicariates.vicariate_id (many-to-one)';

-- Table: login_credentials
-- Description: User authentication credentials (one-to-one with users)
CREATE TABLE IF NOT EXISTS public.login_credentials
(
    credential_id serial NOT NULL,
    user_id character varying(25) COLLATE pg_catalog."default" NOT NULL,
    password_hash character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password_reset_token character varying(255) COLLATE pg_catalog."default",
    password_reset_expires timestamp without time zone,
    login_attempts integer DEFAULT 0,
    locked_until timestamp without time zone,
    email_verification_token character varying(255) COLLATE pg_catalog."default",
    email_verification_expires timestamp without time zone,
    CONSTRAINT login_credentials_pkey PRIMARY KEY (credential_id),
    CONSTRAINT login_credentials_user_id_key UNIQUE (user_id)
);
COMMENT ON TABLE public.login_credentials IS 'User authentication credentials';
COMMENT ON COLUMN public.login_credentials.user_id IS 'FK: user_id → users.user_id (one-to-one)';

-- Table: notifications
-- Description: User notifications (many notifications → one user)
CREATE TABLE IF NOT EXISTS public.notifications
(
    notification_id character varying(64) COLLATE pg_catalog."default" NOT NULL,
    recipient_user_id character varying(25) COLLATE pg_catalog."default" NOT NULL,
    title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    message text COLLATE pg_catalog."default" NOT NULL,
    type character varying(50) COLLATE pg_catalog."default" NOT NULL DEFAULT 'general'::character varying,
    priority character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT 'normal'::character varying,
    link character varying(500) COLLATE pg_catalog."default",
    is_read boolean NOT NULL DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    read_at timestamp without time zone,
    CONSTRAINT notifications_pkey PRIMARY KEY (notification_id)
);
COMMENT ON TABLE public.notifications IS 'User notifications';
COMMENT ON COLUMN public.notifications.recipient_user_id IS 'FK: recipient_user_id → users.user_id (many-to-one)';

-- Table: useractivitylogs
-- Description: Activity audit log (many logs → one user)
CREATE TABLE IF NOT EXISTS public.useractivitylogs
(
    log_id serial NOT NULL,
    user_id character varying(25) COLLATE pg_catalog."default" NOT NULL,
    action character varying(100) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT useractivitylogs_pkey PRIMARY KEY (log_id)
);
COMMENT ON TABLE public.useractivitylogs IS 'Activity audit log';
COMMENT ON COLUMN public.useractivitylogs.user_id IS 'FK: user_id → users.user_id (many-to-one)';

-- Table: beneficiaries
-- Description: Beneficiary organizations/individuals
CREATE TABLE IF NOT EXISTS public.beneficiaries
(
    beneficiary_id serial NOT NULL,
    name character varying(150) COLLATE pg_catalog."default" NOT NULL,
    type character varying(50) COLLATE pg_catalog."default",
    contact_person character varying(100) COLLATE pg_catalog."default",
    email character varying(100) COLLATE pg_catalog."default",
    phone character varying(50) COLLATE pg_catalog."default",
    address text COLLATE pg_catalog."default",
    notes text COLLATE pg_catalog."default",
    CONSTRAINT beneficiaries_pkey PRIMARY KEY (beneficiary_id)
);
COMMENT ON TABLE public.beneficiaries IS 'Beneficiary organizations/individuals';

-- Table: itemcategory
-- Description: Item categories for classification
CREATE TABLE IF NOT EXISTS public.itemcategory
(
    itemcategory_id serial NOT NULL,
    category_name character varying(50) COLLATE pg_catalog."default",
    description text COLLATE pg_catalog."default",
    CONSTRAINT itemcategory_pkey PRIMARY KEY (itemcategory_id)
);
COMMENT ON TABLE public.itemcategory IS 'Item categories for classification';

-- Table: itemtype
-- Description: Types of donation items (many itemtypes → one category)
CREATE TABLE IF NOT EXISTS public.itemtype
(
    itemtype_id serial NOT NULL,
    itemtype_name character varying(40) COLLATE pg_catalog."default",
    itemcategory_id integer,
    avg_retail_price numeric(12, 2),
    min_fmv numeric(12, 2),
    max_fmv numeric(12, 2),
    condition_factor_new numeric(3, 2) DEFAULT 1.00,
    condition_factor_good numeric(3, 2) DEFAULT 0.75,
    condition_factor_fair numeric(3, 2) DEFAULT 0.50,
    condition_factor_poor numeric(3, 2) DEFAULT 0.25,
    CONSTRAINT itemtype_pkey PRIMARY KEY (itemtype_id)
);
COMMENT ON TABLE public.itemtype IS 'Types of donation items';
COMMENT ON COLUMN public.itemtype.itemcategory_id IS 'FK: itemcategory_id → itemcategory.itemcategory_id (many-to-one)';

-- ============================================================================
-- DONATION WORKFLOW TABLES
-- ============================================================================

-- Table: donationrequests
-- Description: Donation requests from users (many donations → one user, one appointment)
CREATE TABLE IF NOT EXISTS public.donationrequests
(
    donation_id serial NOT NULL,
    user_id character varying(25) COLLATE pg_catalog."default" NOT NULL,
    status character varying(50) COLLATE pg_catalog."default" DEFAULT 'Pending'::character varying,
    notes text COLLATE pg_catalog."default",
    delivery_method character varying(20) COLLATE pg_catalog."default",
    appointment_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    approved_by character varying(25) COLLATE pg_catalog."default",
    approved_at timestamp without time zone,
    is_walkin boolean DEFAULT false,
    created_by character varying(25) COLLATE pg_catalog."default",
    pickup_address text COLLATE pg_catalog."default",
    donation_method character varying(20) COLLATE pg_catalog."default" DEFAULT 'Individual'::character varying,
    container_type character varying(50) COLLATE pg_catalog."default",
    container_count integer,
    CONSTRAINT donationrequests_pkey PRIMARY KEY (donation_id)
);
COMMENT ON TABLE public.donationrequests IS 'Donation requests from users';
COMMENT ON COLUMN public.donationrequests.user_id IS 'FK: user_id → users.user_id (many-to-one)';
COMMENT ON COLUMN public.donationrequests.appointment_id IS 'FK: appointment_id → appointments.appointment_id (many-to-one)';
COMMENT ON COLUMN public.donationrequests.approved_by IS 'FK: approved_by → users.user_id (many-to-one)';
COMMENT ON COLUMN public.donationrequests.created_by IS 'FK: created_by → users.user_id (many-to-one)';

-- Table: donationitems
-- Description: Individual items in a donation (many items → one donation, one itemtype)
CREATE TABLE IF NOT EXISTS public.donationitems
(
    item_id serial NOT NULL,
    donation_id integer NOT NULL,
    itemtype_id integer NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    declared_value numeric(12, 2) DEFAULT 0.00,
    description text COLLATE pg_catalog."default",
    selected_condition character varying(10) COLLATE pg_catalog."default" NOT NULL DEFAULT 'New'::character varying,
    condition_multiplier numeric(5, 2) DEFAULT 1.00,
    calculated_fmv numeric(12, 2) DEFAULT 0.00,
    date_added timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    quantity_per_container integer,
    is_estimated boolean DEFAULT false,
    CONSTRAINT donationitems_pkey PRIMARY KEY (item_id)
);
COMMENT ON TABLE public.donationitems IS 'Individual items in a donation';
COMMENT ON COLUMN public.donationitems.donation_id IS 'FK: donation_id → donationrequests.donation_id (many-to-one, cascade delete)';
COMMENT ON COLUMN public.donationitems.itemtype_id IS 'FK: itemtype_id → itemtype.itemtype_id (many-to-one)';

-- ============================================================================
-- INVENTORY TABLES
-- ============================================================================

-- Table: inventory
-- Description: Current inventory stock (one inventory row → one itemtype)
CREATE TABLE IF NOT EXISTS public.inventory
(
    inventory_id serial NOT NULL,
    itemtype_id integer,
    quantity_available integer DEFAULT 0,
    total_fmv_value numeric(12, 2) DEFAULT 0.00,
    location character varying(255) COLLATE pg_catalog."default",
    last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) COLLATE pg_catalog."default" DEFAULT 'Available'::character varying,
    CONSTRAINT inventory_pkey PRIMARY KEY (inventory_id)
);
COMMENT ON TABLE public.inventory IS 'Current inventory stock';
COMMENT ON COLUMN public.inventory.itemtype_id IS 'FK: itemtype_id → itemtype.itemtype_id (many-to-one)';

-- ============================================================================
-- BENEFICIARY REQUEST WORKFLOW
-- ============================================================================

-- Table: beneficiaryrequests
-- Description: Requests from beneficiaries (many requests → one beneficiary)
CREATE TABLE IF NOT EXISTS public.beneficiaryrequests
(
    request_id serial NOT NULL,
    beneficiary_id integer NOT NULL,
    request_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(50) COLLATE pg_catalog."default" DEFAULT 'Pending'::character varying,
    urgency character varying(50) COLLATE pg_catalog."default",
    purpose text COLLATE pg_catalog."default",
    notes text COLLATE pg_catalog."default",
    created_by character varying(25) COLLATE pg_catalog."default",
    updated_by character varying(25) COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    individuals_served integer DEFAULT 1,
    CONSTRAINT beneficiaryrequests_pkey PRIMARY KEY (request_id)
);
COMMENT ON TABLE public.beneficiaryrequests IS 'Requests from beneficiaries';
COMMENT ON COLUMN public.beneficiaryrequests.beneficiary_id IS 'FK: beneficiary_id → beneficiaries.beneficiary_id (many-to-one, cascade delete)';
COMMENT ON COLUMN public.beneficiaryrequests.created_by IS 'FK: created_by → users.user_id (many-to-one)';
COMMENT ON COLUMN public.beneficiaryrequests.updated_by IS 'FK: updated_by → users.user_id (many-to-one)';

-- Table: beneficiaryrequestitems
-- Description: Items requested in a beneficiary request (many items → one request, one itemtype)
CREATE TABLE IF NOT EXISTS public.beneficiaryrequestitems
(
    request_item_id serial NOT NULL,
    request_id integer,
    itemtype_id integer,
    quantity_requested integer NOT NULL,
    quantity_approved integer DEFAULT 0,
    notes text COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT beneficiaryrequestitems_pkey PRIMARY KEY (request_item_id)
);
COMMENT ON TABLE public.beneficiaryrequestitems IS 'Items requested in a beneficiary request';
COMMENT ON COLUMN public.beneficiaryrequestitems.request_id IS 'FK: request_id → beneficiaryrequests.request_id (many-to-one, cascade delete)';
COMMENT ON COLUMN public.beneficiaryrequestitems.itemtype_id IS 'FK: itemtype_id → itemtype.itemtype_id (many-to-one)';

-- ============================================================================
-- DISTRIBUTION WORKFLOW
-- ============================================================================

-- Table: distributionplans
-- Description: Plans for distributing items (many plans → one request)
CREATE TABLE IF NOT EXISTS public.distributionplans
(
    plan_id serial NOT NULL,
    request_id integer,
    planned_date date,
    status character varying(50) COLLATE pg_catalog."default" DEFAULT 'Draft'::character varying,
    created_by character varying(25) COLLATE pg_catalog."default",
    approved_by character varying(25) COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    approved_at timestamp without time zone,
    remarks text COLLATE pg_catalog."default",
    CONSTRAINT distributionplans_pkey PRIMARY KEY (plan_id)
);
COMMENT ON TABLE public.distributionplans IS 'Plans for distributing items';
COMMENT ON COLUMN public.distributionplans.request_id IS 'FK: request_id → beneficiaryrequests.request_id (many-to-one, cascade delete)';
COMMENT ON COLUMN public.distributionplans.created_by IS 'FK: created_by → users.user_id (many-to-one)';
COMMENT ON COLUMN public.distributionplans.approved_by IS 'FK: approved_by → users.user_id (many-to-one)';

-- Table: distributionplanitems
-- Description: Items in a distribution plan (many items → one plan, one inventory)
CREATE TABLE IF NOT EXISTS public.distributionplanitems
(
    plan_item_id serial NOT NULL,
    plan_id integer,
    inventory_id integer,
    quantity integer NOT NULL,
    allocated_value numeric(12, 2),
    notes text COLLATE pg_catalog."default",
    CONSTRAINT distributionplanitems_pkey PRIMARY KEY (plan_item_id)
);
COMMENT ON TABLE public.distributionplanitems IS 'Items in a distribution plan';
COMMENT ON COLUMN public.distributionplanitems.plan_id IS 'FK: plan_id → distributionplans.plan_id (many-to-one, cascade delete)';
COMMENT ON COLUMN public.distributionplanitems.inventory_id IS 'FK: inventory_id → inventory.inventory_id (many-to-one)';

-- Table: distributionlogs
-- Description: Log of actual distributions (many logs → one plan, one beneficiary, one itemtype)
CREATE TABLE IF NOT EXISTS public.distributionlogs
(
    distribution_id serial NOT NULL,
    plan_id integer,
    beneficiary_id integer,
    itemtype_id integer,
    quantity_distributed integer NOT NULL,
    distribution_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    distributed_by character varying(25) COLLATE pg_catalog."default",
    remarks text COLLATE pg_catalog."default",
    CONSTRAINT distributionlogs_pkey PRIMARY KEY (distribution_id)
);
COMMENT ON TABLE public.distributionlogs IS 'Log of actual distributions';
COMMENT ON COLUMN public.distributionlogs.plan_id IS 'FK: plan_id → distributionplans.plan_id (many-to-one, cascade delete)';
COMMENT ON COLUMN public.distributionlogs.beneficiary_id IS 'FK: beneficiary_id → beneficiaries.beneficiary_id (many-to-one)';
COMMENT ON COLUMN public.distributionlogs.itemtype_id IS 'FK: itemtype_id → itemtype.itemtype_id (many-to-one)';
COMMENT ON COLUMN public.distributionlogs.distributed_by IS 'FK: distributed_by → users.user_id (many-to-one)';

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Role Permissions
ALTER TABLE IF EXISTS public.rolepermissions
    ADD CONSTRAINT rolepermissions_role_id_fkey FOREIGN KEY (role_id)
    REFERENCES public.roles (role_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.rolepermissions
    ADD CONSTRAINT rolepermissions_permission_id_fkey FOREIGN KEY (permission_id)
    REFERENCES public.permissions (permission_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

-- Parishes
ALTER TABLE IF EXISTS public.parishes
    ADD CONSTRAINT parishes_vicariate_id_fkey FOREIGN KEY (vicariate_id)
    REFERENCES public.vicariates (vicariate_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

-- Location Hierarchy
ALTER TABLE IF EXISTS public.table_province
    ADD CONSTRAINT table_province_region_id_fkey FOREIGN KEY (region_id)
    REFERENCES public.table_region (region_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;
CREATE INDEX IF NOT EXISTS idx_region_id
    ON public.table_province(region_id);

ALTER TABLE IF EXISTS public.table_municipality
    ADD CONSTRAINT table_municipality_province_id_fkey FOREIGN KEY (province_id)
    REFERENCES public.table_province (province_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;
CREATE INDEX IF NOT EXISTS idx_province_id
    ON public.table_municipality(province_id);

ALTER TABLE IF EXISTS public.table_barangay
    ADD CONSTRAINT fk_table_barangay_table_municipality FOREIGN KEY (municipality_id)
    REFERENCES public.table_municipality (municipality_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

-- Users
ALTER TABLE IF EXISTS public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id)
    REFERENCES public.roles (role_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public.users
    ADD CONSTRAINT users_region_id_fkey FOREIGN KEY (region_id)
    REFERENCES public.table_region (region_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public.users
    ADD CONSTRAINT users_province_id_fkey FOREIGN KEY (province_id)
    REFERENCES public.table_province (province_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public.users
    ADD CONSTRAINT users_municipality_id_fkey FOREIGN KEY (municipality_id)
    REFERENCES public.table_municipality (municipality_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public.users
    ADD CONSTRAINT users_barangay_id_fkey FOREIGN KEY (barangay_id)
    REFERENCES public.table_barangay (barangay_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public.users
    ADD CONSTRAINT users_approved_by_fkey FOREIGN KEY (approved_by)
    REFERENCES public.users (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

-- Login Credentials
ALTER TABLE IF EXISTS public.login_credentials
    ADD CONSTRAINT login_credentials_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.users (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS login_credentials_user_id_key
    ON public.login_credentials(user_id);

-- Notifications
ALTER TABLE IF EXISTS public.notifications
    ADD CONSTRAINT notifications_recipient_user_id_fkey FOREIGN KEY (recipient_user_id)
    REFERENCES public.users (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

-- User Activity Logs
ALTER TABLE IF EXISTS public.useractivitylogs
    ADD CONSTRAINT useractivitylogs_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.users (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

-- Item Type
ALTER TABLE IF EXISTS public.itemtype
    ADD CONSTRAINT itemtype_itemcategory_id_fkey FOREIGN KEY (itemcategory_id)
    REFERENCES public.itemcategory (itemcategory_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

-- Donation Requests
ALTER TABLE IF EXISTS public.donationrequests
    ADD CONSTRAINT donationrequests_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.users (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public.donationrequests
    ADD CONSTRAINT donationrequests_appointment_id_fkey FOREIGN KEY (appointment_id)
    REFERENCES public.appointments (appointment_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public.donationrequests
    ADD CONSTRAINT donationrequests_approved_by_fkey FOREIGN KEY (approved_by)
    REFERENCES public.users (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public.donationrequests
    ADD CONSTRAINT donationrequests_created_by_fkey FOREIGN KEY (created_by)
    REFERENCES public.users (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

-- Donation Items
ALTER TABLE IF EXISTS public.donationitems
    ADD CONSTRAINT donationitems_donation_id_fkey FOREIGN KEY (donation_id)
    REFERENCES public.donationrequests (donation_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.donationitems
    ADD CONSTRAINT donationitems_itemtype_id_fkey FOREIGN KEY (itemtype_id)
    REFERENCES public.itemtype (itemtype_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE SET NULL;

-- Inventory
ALTER TABLE IF EXISTS public.inventory
    ADD CONSTRAINT inventory_itemtype_id_fkey FOREIGN KEY (itemtype_id)
    REFERENCES public.itemtype (itemtype_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

-- Beneficiary Requests
ALTER TABLE IF EXISTS public.beneficiaryrequests
    ADD CONSTRAINT beneficiaryrequests_beneficiary_id_fkey FOREIGN KEY (beneficiary_id)
    REFERENCES public.beneficiaries (beneficiary_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.beneficiaryrequests
    ADD CONSTRAINT beneficiaryrequests_created_by_fkey FOREIGN KEY (created_by)
    REFERENCES public.users (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public.beneficiaryrequests
    ADD CONSTRAINT beneficiaryrequests_updated_by_fkey FOREIGN KEY (updated_by)
    REFERENCES public.users (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

-- Beneficiary Request Items
ALTER TABLE IF EXISTS public.beneficiaryrequestitems
    ADD CONSTRAINT beneficiaryrequestitems_request_id_fkey FOREIGN KEY (request_id)
    REFERENCES public.beneficiaryrequests (request_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.beneficiaryrequestitems
    ADD CONSTRAINT beneficiaryrequestitems_itemtype_id_fkey FOREIGN KEY (itemtype_id)
    REFERENCES public.itemtype (itemtype_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

-- Distribution Plans
ALTER TABLE IF EXISTS public.distributionplans
    ADD CONSTRAINT distributionplans_request_id_fkey FOREIGN KEY (request_id)
    REFERENCES public.beneficiaryrequests (request_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.distributionplans
    ADD CONSTRAINT distributionplans_created_by_fkey FOREIGN KEY (created_by)
    REFERENCES public.users (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public.distributionplans
    ADD CONSTRAINT distributionplans_approved_by_fkey FOREIGN KEY (approved_by)
    REFERENCES public.users (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

-- Distribution Plan Items
ALTER TABLE IF EXISTS public.distributionplanitems
    ADD CONSTRAINT distributionplanitems_plan_id_fkey FOREIGN KEY (plan_id)
    REFERENCES public.distributionplans (plan_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.distributionplanitems
    ADD CONSTRAINT distributionplanitems_inventory_id_fkey FOREIGN KEY (inventory_id)
    REFERENCES public.inventory (inventory_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

-- Distribution Logs
ALTER TABLE IF EXISTS public.distributionlogs
    ADD CONSTRAINT distributionlogs_plan_id_fkey FOREIGN KEY (plan_id)
    REFERENCES public.distributionplans (plan_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.distributionlogs
    ADD CONSTRAINT distributionlogs_beneficiary_id_fkey FOREIGN KEY (beneficiary_id)
    REFERENCES public.beneficiaries (beneficiary_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public.distributionlogs
    ADD CONSTRAINT distributionlogs_itemtype_id_fkey FOREIGN KEY (itemtype_id)
    REFERENCES public.itemtype (itemtype_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public.distributionlogs
    ADD CONSTRAINT distributionlogs_distributed_by_fkey FOREIGN KEY (distributed_by)
    REFERENCES public.users (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

END;
