-- USERS TABLE
CREATE TABLE Users (
    user_id VARCHAR(25) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    contact_num VARCHAR(20),
    account_type VARCHAR(20) CHECK (account_type IN ('INDIVIDUAL', 'ORGANIZATION')),
    role_id INT REFERENCES roles(role_id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    region_id INTEGER REFERENCES table_region(region_id),
    province_id INTEGER REFERENCES table_province(province_id),
    municipality_id INTEGER REFERENCES table_municipality(municipality_id),
    barangay_id INTEGER REFERENCES table_barangay(barangay_id),
    parish_id INT REFERENCES Parishes(parish_id),
	vicariate_id INT REFERENCES Vicariates(vicariate_id),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	created_by VARCHAR(25) REFERENCES Users(user_id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    profile_picture_url TEXT,
    bio TEXT  
);

ALTER TABLE Users
ADD COLUMN is_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN approved_by VARCHAR(25) REFERENCES Users(user_id),
ADD COLUMN approved_at TIMESTAMP;

-- LOGIN CREDENTIALS TABLE
CREATE TABLE Login_Credentials (
    credential_id SERIAL PRIMARY KEY,
    user_id VARCHAR(25) NOT NULL UNIQUE REFERENCES Users(user_id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP
);

CREATE TABLE UserActivityLogs (
    log_id SERIAL PRIMARY KEY,
    user_id VARCHAR(25) NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    -- What happened
    action VARCHAR(100) NOT NULL,         -- e.g. 'login', 'logout', 'donation_submitted', etc.
    description TEXT NOT NULL,            -- Human-readable explanation
    -- When it happened
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE DonationRequests (
    donation_id SERIAL PRIMARY KEY,
    user_id VARCHAR(25) NOT NULL REFERENCES Users(user_id), -- references Donors table (assuming you have one)
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, Rejected
    notes TEXT, -- Purpose of the donation request
	delivery_method VARCHAR(20),
	appointment_id INT NOT NULL REFERENCES Appointments(appointment_id),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 	approved_by VARCHAR(25) REFERENCES Users(user_id),
	approved_at TIMESTAMP,
	is_walkin BOOLEAN DEFAULT FALSE,
    pickup_address TEXT;
);

CREATE TABLE DonationItems (
    item_id SERIAL PRIMARY KEY,
    donation_id INT NOT NULL REFERENCES DonationRequests(donation_id) ON DELETE CASCADE,
    itemtype_id INT NOT NULL REFERENCES ItemType(itemtype_id) ON DELETE SET NULL,
    
    quantity INT NOT NULL DEFAULT 1,
    declared_value NUMERIC(12,2) DEFAULT 0.00,  -- donor-declared value
    description TEXT,                           -- condition notes, brand, etc.
    
    selected_condition VARCHAR(10) NOT NULL DEFAULT 'New',  -- New, Good, Fair, Poor
    condition_multiplier NUMERIC(5,2) DEFAULT 1.00,        -- fetched from ItemType by default
    calculated_fmv NUMERIC(12,2) DEFAULT 0.00,            -- quantity × avg_retail_price × condition_multiplier
    
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE Beneficiaries (
    beneficiary_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50), -- Individual, Organization
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(50),
    address TEXT,
    notes TEXT
);

CREATE TABLE Inventory (
    inventory_id SERIAL PRIMARY KEY,
    itemtype_id INT REFERENCES ItemType(itemtype_id),
    quantity_available INT DEFAULT 0,
    total_fmv_value NUMERIC(12,2) DEFAULT 0.00,
    location VARCHAR(255),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Available'
        CHECK (status IN ('Available', 'Low Stock', 'No Stock', 'Reserved', 'Bazaar'))
);

CREATE TABLE BazaarLogs (
    bazaar_log_id SERIAL PRIMARY KEY,
    inventory_id INT REFERENCES Inventory(inventory_id),
    quantity_sold INT NOT NULL,
    bazaar_date DATE NOT NULL,
    recorded_by VARCHAR(25) REFERENCES Users(user_id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE BeneficiaryRequests (
    request_id SERIAL PRIMARY KEY,
    beneficiary_id INT NOT NULL REFERENCES Beneficiaries(beneficiary_id) ON DELETE CASCADE,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Fulfilled','Rejected')),
	urgency VARCHAR(50) CHECK (urgency IN ('Low', 'Medium', 'High')),
    purpose TEXT,     -- Reason for request or project
    notes TEXT
	created_by VARCHAR(25) REFERENCES Users(user_id),
	updated_by VARCHAR(25) REFERENCES Users(user_id),
	created_at VARCHAR(25) TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at VARCHAR(25) TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE BeneficiaryRequestItems (
    request_item_id SERIAL PRIMARY KEY,
    request_id INT REFERENCES BeneficiaryRequests(request_id) ON DELETE CASCADE,
    itemtype_id INT REFERENCES ItemType(itemtype_id),
    quantity_requested INT NOT NULL,
    quantity_approved INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE DistributionPlans (
    plan_id SERIAL PRIMARY KEY,
    request_id INT REFERENCES BeneficiaryRequests(request_id) ON DELETE CASCADE,
    planned_date DATE,
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft','Approved','Ongoing','Completed','Cancelled')),
    created_by VARCHAR(25) REFERENCES Users(user_id),
    approved_by VARCHAR(25) REFERENCES Users(user_id),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	approved_at TIMESTAMP,
    remarks TEXT
);

CREATE TABLE DistributionPlanItems (
    plan_item_id SERIAL PRIMARY KEY,
    plan_id INT REFERENCES DistributionPlans(plan_id) ON DELETE CASCADE,
    inventory_id INT REFERENCES Inventory(inventory_id),
    quantity INT NOT NULL,
    allocated_value NUMERIC(12,2),
    notes TEXT
);

CREATE TABLE DistributionLogs (
    distribution_id SERIAL PRIMARY KEY,
    plan_id INT REFERENCES DistributionPlans(plan_id) ON DELETE CASCADE,
    beneficiary_id INT REFERENCES Beneficiaries(beneficiary_id),
    itemtype_id INT REFERENCES ItemType(itemtype_id),
    quantity_distributed INT NOT NULL,
    distribution_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    distributed_by VARCHAR(25) REFERENCES Users(user_id),
    remarks TEXT
);

CREATE TABLE Appointments (
    appointment_id SERIAL PRIMARY KEY,
    appointment_date DATE NOT NULL,
    appointment_time TIME,
    description TEXT, -- description shown on calendar
    status VARCHAR(20) DEFAULT 'Scheduled', -- Scheduled, Rescheduled, Completed, Cancelled
    remarks TEXT, -- notes from admin or donor
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE ItemCategory (
   itemcategory_id SERIAL PRIMARY KEY,
   category_name VARCHAR(50),
   description TEXT
); 


CREATE TABLE ItemType (
	itemtype_id SERIAL PRIMARY KEY,
	itemtype_name VARCHAR(40),
	itemcategory_id INT REFERENCES ItemCategory(itemcategory_id),
	avg_retail_price NUMERIC(12,2),
    min_fmv NUMERIC(12,2),
    max_fmv NUMERIC(12,2),
  	condition_factor_new NUMERIC(3,2) DEFAULT 1.00,
 	condition_factor_good NUMERIC(3,2) DEFAULT 0.75,
    condition_factor_fair NUMERIC(3,2) DEFAULT 0.50,
    condition_factor_poor NUMERIC(3,2) DEFAULT 0.25
);



CREATE TABLE Roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
);

CREATE TABLE Permissions (
    permission_id SERIAL PRIMARY KEY,
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);


CREATE TABLE RolePermissions (  
    role_id INT REFERENCES roles(role_id) ON DELETE CASCADE,
    permission_id INT REFERENCES permissions(permission_id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);



CREATE TABLE IF NOT EXISTS table_barangay (
  barangay_id SERIAL PRIMARY KEY,
  municipality_id INTEGER NOT NULL,
  barangay_name VARCHAR(100) NOT NULL,
  CONSTRAINT UQT_barangay UNIQUE (municipality_id, barangay_name),
  CONSTRAINT FK_table_barangay_table_municipality
      FOREIGN KEY (municipality_id)
      REFERENCES table_municipality (municipality_id)
);

CREATE INDEX IDX_barangay_name ON table_barangay (barangay_name);



CREATE TABLE IF NOT EXISTS table_municipality (
  municipality_id SERIAL PRIMARY KEY,
  province_id INTEGER REFERENCES table_province(province_id),
  municipality_name VARCHAR(100),
  CONSTRAINT UQT_municipality UNIQUE (province_id, municipality_name)
);

-- Optional but recommended: create separate indexes
CREATE INDEX IF NOT EXISTS IDX_province_id ON table_municipality (province_id);
CREATE INDEX IF NOT EXISTS IDX_municipality_name ON table_municipality (municipality_name);

CREATE TABLE IF NOT EXISTS table_province (
  province_id SERIAL PRIMARY KEY,
  region_id INTEGER NOT NULL REFERENCES table_region(region_id),
  province_name VARCHAR(100) NOT NULL,
  CONSTRAINT UQT_provincename UNIQUE (region_id, province_name)
);

-- Optional but recommended indexes (BTREE is default in PostgreSQL)
CREATE INDEX IF NOT EXISTS IDX_province_name ON table_province (province_name);
CREATE INDEX IF NOT EXISTS IDX_region_id ON table_province (region_id);


CREATE TABLE IF NOT EXISTS table_region (
    region_id SERIAL PRIMARY KEY,
    region_name VARCHAR(50) NOT NULL UNIQUE,
    region_description VARCHAR(100) NOT NULL
);


CREATE TABLE Vicariates (
    vicariate_id SERIAL PRIMARY KEY,
    vicariate_name VARCHAR(150) UNIQUE NOT NULL
);


CREATE TABLE Parishes (
	parish_id SERIAL PRIMARY KEY,
    parish_name VARCHAR(150) NOT NULL,
    parish_priest VARCHAR(100),
    vicariate_id INT REFERENCES Vicariates(vicariate_id)
);

CREATE INDEX idx_vicariates_name ON Vicariates(vicariate_name);
CREATE INDEX idx_parishes_name ON Parishes(parish_name);

CREATE TABLE IF NOT EXISTS Notifications (
    notification_id VARCHAR(20) PRIMARY KEY,
    recipient_user_id VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'general',
    priority VARCHAR(20) NOT NULL DEFAULT 'normal',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (recipient_user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read 
ON Notifications(recipient_user_id, is_read);


INSERT INTO roles (role_name) VALUES 
('Donor'),
('Resource Staff'),
('Executive Admin');

INSERT INTO permissions (permission_name, perm_description) VALUES
('account_registration','Can register an account'),
('review_account_registration','Can approve or deny account registration request'),
('edit_profile','Can update credentials'),
('make_donation_request','Can make a scheduled donation request'),
('cancel_own_donation_request','Can cancel personal donation request'),
('view_own_donation_request','Can view personal donation request'),
('edit_own_donation_request','Can edit personal donation request'),
('view_donation_request','Can view list of donation request'),
('edit_donation_request_schedule','Can edit or modify donation request schedule'),
('review_donation_request','Can approve or deny donation request'),
('view_donation_inventory','Can view donation inventory'),
('add_walkin_donation','Can add donation from walk-ins'),
('register_walkin_donor','Can register a walk in donor'),
('add_user','Can add a user directly without registration request'),
('edit_user_roles','Can edit or update user roles'),
('activate_user','Can activate or reactivate user'),
('deactivate_user','Can deactivate a user'),
('delete_user','Can delete a user'),
('view_user_logs','Can track user activity'),
('add_beneficiary_request','Can add beneficiary requests'),
('edit_beneficiary_request','Can edit beneficiary request depending on approval'),
('view_beneficiary_request','Can view list of beneficiary requests'),
('generate_distribution_plan','Can generate a distribution plan from beneficiary requests'),
('edit_distribution_plan','Can edit distribution plan'),
('cancel_distribution_plan','Can cancel distribution plan'),	
('view_distribution_logs','Can view distribution logs'),
('review_distribution_plan','Can approve or deny a distribution plan'),
('generate_receipt','Can generate acknowledgement receipts for donations'),
('generate_report','Can generate reports'),
('add_calendar_event','Can add an event in the calendar'),
('view_calendar_event','Can view present and future events in the calendar');



INSERT INTO Vicariates (vicariate_name) VALUES
('Vicariate of St. Francis Xavier'),
('Vicariate of Immaculate Conception'),
('Vicariate of St. Roche'),
('Vicariate of Our Lady of Caysasay'),
('Vicariate of St. Francis of Paola'),
('Vicariate of Holy Cross'),
('Vicariate of Sto. Niño'),
('Vicariate of St. Michael the Archangel'),
('Vicariate of Our Lady of the Holy Rosary'),
('Vicariate of St. Joseph the Patriarch'),
('Vicariate of St. Vincent Ferrer'),
('Vicariate of St. Sebastian'),
('Vicariate of St. John the Evangelist'),
('Vicariate of St. William the Hermit');

INSERT INTO Parishes (parish_name, parish_priest, vicariate_id) VALUES
('St. Francis Xavier Parish', 'Rev. Fr. Cecilio Arce', 1),
('Sto. Domingo De Silos Parish', 'Rev. Fr. Edilberto Ramos Jr.', 1),
('St. John the Baptist Parish', 'Rev. Fr. Noel Salanguit', 1),
('St. Vincent Ferrer Parish', 'Rev. Fr. Edgardo Leo Villostas', 1),
('Nuestra Señora De La Paz Y Buen Viaje Parish', 'Rev. Fr. Antoni Umali, Jr.', 1),
('Immaculate Conception Parish', 'Rev. Fr. Eugenio Peñalosa III', 2),
('St. Raphael the Archangel Parish', 'Rev. Fr. Noel Abutal', 2),
('Visitation of the Blessed Virgin Mary Parish', 'Rev. Fr. Lauro Abante', 2),
('St. Anthony of Padua Parish', 'Rev. Fr. Quini Magpantay', 2),
('St. Nicolas de Tolentino Parish', 'Rev. Fr. Magno Casala, Jr.', 3),
('Our Mother of Perpetual Help Parish', 'Rev. Fr. Eriberto Cabrera', 3),
('Our Lady of the Miraculous Medal Parish', 'Rev. Fr. Jose Pedro Fernando Sudario', 3),
('St. Roche Parish', 'Rev. Fr. Joseph Rodem Ramos', 3),
('Mahal na Poon ng Banal na Krus Parish', 'Rev. Fr. Wilfredo Rosales', 3),
('Basilica of St. Martin de Tours', 'Rev. Fr. Conrado Castillo', 4),
('San Isidro Labrador Parish', 'Rev. Fr. Hermogenes Rodelas', 4),
('Invencion De La Sta. Cruz Parish', 'Rev. Fr. Edgardo Pagcaliuangan', 4),
('San Isidro Labrador Parish', 'Rev. Fr. Armando Lubis', 4),
('St. Therese of the Child Jesus and of the Holy Face Parish', 'Rev. Fr. Ariel Gonzales', 4),
('Archdiocesan Shrine of Our Lady of Caysasay', 'Rev. Fr. Raul Francisco Martinez (Rector)', 4),
('St. Francis of Paola Parish', 'Rev. Fr. Aloysius Buensalida', 5),
('St. Roche Parish', 'Rev. Fr. Eusebio Bobot Hernandez', 5),
('Holy Family Parish', 'Rev. Fr. Emmanuel Vergara', 5),
('Immaculate Conception Parish', 'Rev. Fr. Federico Magboo', 6),
('Our Mother of Perpetual Help Parish', 'Rev. Fr. Eric Joaquin Arada', 6),
('St. Mary Magdalene Parish', 'Rev. Fr. Roy Macatangay', 6),
('San Pascual Baylon Parish', 'Rev. Fr. Mateo Orario', 6),
('Basilica of the Immaculate Conception', 'Rev. Fr. Angel Marcelo Pastor', 7),
('St. Mary Euphrasia Parish', 'Rev. Fr. Ildefonso Dimaano', 7),
('Most Holy Trinity Parish', 'Rev. Fr. Rogelio Maynardo Beredo, Jr.', 7),
('Sta. Rita de Cascia Parish', 'Rev. Fr. Sabas Titular', 7),
('St. Isidore Parish', 'Rev. Fr. Gerardo Garcia', 7),
('San Lorenzo Ruiz Parish', 'Rev. Fr. Julius Lacaran', 8),
('Nuestra Senora de la Merced Parish', 'Rev. Fr. Oscar Larry Famarin', 8),
('St. Michael the Archangel', 'Rev. Fr. Rochester Charles Resuello', 8),
('St. Paul the Apostle', 'Rev. Fr. Renante Ilagan', 8),
('St. Michael the Archangel', 'Rev. Fr. Armando Panganiban', 8),
('Our Lady of the Holy Rosary Parish', 'Rev. Fr. Delbert Jardinaso, OSJ', 9),
('Holy Family Parish', 'Rev. Fr. Den Mark Malabuyoc, OSJ', 9),
('San Juan Nepomuceno', 'Rev. Fr. Alexius Magtibay, OSJ', 9),
('Most Holy Rosary Parish', 'Rev. Fr. Arnold Rosal, OSJ', 9),
('St. Joseph the Patriarch Parish', 'Rev. Fr. Servando Sentales, OSJ', 10),
('St. James the Greater Parish', 'Rev. Fr. Allen Vic Cartagena, OSJ', 10),
('St. Anthony of Padua Parish', 'Rev. Fr. Nemer Chua', 10),
('Our Lady of Peace and Good Voyage Parish', 'Rev. Fr. Estelito Africa Jr.', 10),
('Sto. Nino Parish', 'Rev. Fr. Gregorio Landicho', 11),
('Immaculate Conception Parish', 'Rev. Fr. Aurelio Oscar Dimaapi', 11),
('Divina Pastora Parish', 'Rev. Fr. Godofredo Mendoza', 11),
('St. Vincent Ferrer Parish', 'Rev. Fr. Bernard Aguila', 11),
('Nuestra Señora De La Paz Y Buen Viaje Parish', 'Rev. Fr. Gerardo Gil Lipat', 11),
('St. Sebastian Cathedral', 'Msgr. Ruben Dimaculangan (Rector)', 12),
('Mary Mediatrix of All Graces Parish', 'Rev. Fr. Jayson Alcaraz', 12),
('Sto. Niño Parish', 'Rev. Fr. Miguel Samaniego', 12),
('St. Therese of the Child Jesus Parish', 'Rev. Fr. Froilan Careon, Jr.', 12),
('St. Isidore Parish', 'Rev. Fr. Ephraim Cabrera', 12),
('St. Joseph the Worker Proposed Parish', 'Rev. Fr. Dale Anthony Barretto Ko', 12),
('Immaculate Conception Parish', 'Rev. Fr. Rustam Sabularse', 13),
('Nuestra Señora de la Soledad Parish', 'Rev. Fr. Donaldo Dimaandal', 13),
('St. John the Evangelist Parish', 'Rev. Fr. Timoteo Gameline Balita', 13),
('St. Thomas Aquinas Parish', 'Rev. Fr. Onofre Bimbo Pantoja', 13),
('St. Clare Assisi Parish', 'Rev. Fr. Jonathan Tamayo', 13),
('St. Padre Pio National Shrine and Parish', 'Rev. Fr. Oscar Andal', 13),
('St. Augustine of Hippo Parish', 'Rev. Fr. Russell Matuloy', 14),
('Queen of All Saints Parish', 'Rev. Fr. Richard Hernandez', 14),
('Holy Family Flight to Egypt Parish', 'Rev. Fr. Joseph Mendoza', 14),
('San Guillermo Parish', 'Rev. Fr. Milo Malabuyoc', 14),
('Immaculate Conception Parish', 'Rev. Fr. Gerald Macalinao', 14);


INSERT INTO RolePermissions (role_id, permission_id) VALUES
-- DONOR --
(3, 1),  -- account_registration
(3, 3),  -- edit_profile
(3, 4),  -- make_donation_request
(3, 5),  -- cancel_own_donation_request
(3, 6),  -- view_own_donation_request
(3, 7),  -- edit_own_donation_request
(3, 31), -- view_calendar_event

-- RESOURCE STAFF --
-- Donations & Inventory
(2, 11),  -- view_donation_inventory
(2, 12),  -- add_walkin_donation
(2, 13),  -- register_walkin_donor

-- Beneficiary management
(2, 20),  -- add_beneficiary_request
(2, 21),  -- edit_beneficiary_request
(2, 22),  -- view_beneficiary_request
-- Distribution
(2, 23),  -- generate_distribution_plan
(2, 24),  -- edit_distribution_plan
(2, 25),  -- cancel_distribution_plan
(2, 26),  -- view_distribution_logs
-- Receipts
(2, 28),  -- generate_receipt
-- Calendar
(2, 30),  -- add_calendar_event
(2, 31),  -- view_calendar_event
-- EXECUTIVE ADMIN --
(1, 2),   -- review_account_registration
(1, 14),  -- add_user
(1, 15),  -- edit_user_roles
(1, 16),  -- activate_user
(1, 17),  -- deactivate_user
(1, 18),  -- delete_user
(1, 19),  -- view_user_logs
-- Approvals and oversight
(1, 10),  -- review_donation_request
(1, 27),  -- review_distribution_plan
-- Reports and events
(1, 29),  -- generate_report
(1, 30),  -- add_calendar_event
(1, 31);  -- view_calendar_event

INSERT INTO ItemCategory (category_name, description) VALUES
('Food Items', 'Canned goods, rice, noodles, and other basic food supplies'),
('Household Essentials/Personal Care', 'Personal care, hygiene, and household items'),
('Clothing', 'New or gently used clothing and footwear'),
('Shelter Materials', 'Emergency shelter and construction materials'),
('Educational Materials', 'School supplies and learning materials'),
('Kitchen Utensils', 'Cooking and eating utensils'),    
('Medical Supplies', 'Basic medicines, first aid items, and protective medical gear');

-- ==================================
-- CATEGORY 1: Food Items
-- ==================================
INSERT INTO ItemType (itemtype_name, itemcategory_id, avg_retail_price, min_fmv, max_fmv, condition_factor_new, condition_factor_good, condition_factor_fair, condition_factor_poor) VALUES
('Canned Goods', 1, 70.00, 50.00, 90.00, 1.00, 0.75, 0.50, 0.25),
('Rice (10kg)', 1, 350.00, 300.00, 450.00, 1.00, 0.80, 0.60, 0.40),
('Rice (25kg)', 1, 800.00, 700.00, 1000.00, 1.00, 0.80, 0.60, 0.40),
('Noodles', 1, 50.00, 35.00, 80.00, 1.00, 0.75, 0.50, 0.25),
('Cooking Oil', 1, 200.00, 150.00, 300.00, 1.00, 0.75, 0.50, 0.25),
('Sugar', 1, 60.00, 40.00, 90.00, 1.00, 0.75, 0.50, 0.25),
('Salt', 1, 30.00, 20.00, 50.00, 1.00, 0.75, 0.50, 0.25),
('Coffee', 1, 150.00, 100.00, 250.00, 1.00, 0.75, 0.50, 0.25),
('Milk Powder', 1, 350.00, 250.00, 500.00, 1.00, 0.75, 0.50, 0.25),
('Biscuits', 1, 70.00, 50.00, 100.00, 1.00, 0.75, 0.50, 0.25),
('Dried Fish', 1, 150.00, 100.00, 250.00, 1.00, 0.75, 0.50, 0.25),
('Bread', 1, 40.00, 25.00, 60.00, 1.00, 0.75, 0.50, 0.25),
('Pasta', 1, 100.00, 70.00, 150.00, 1.00, 0.75, 0.50, 0.25),
('Cereals', 1, 150.00, 100.00, 250.00, 1.00, 0.75, 0.50, 0.25),
('Other Food Items', 1, 100.00, 50.00, 200.00, 1.00, 0.75, 0.50, 0.25);

-- ==================================
-- CATEGORY 2: Household Essentials/Personal Care
-- ==================================
INSERT INTO ItemType (itemtype_name, itemcategory_id, avg_retail_price, min_fmv, max_fmv, condition_factor_new, condition_factor_good, condition_factor_fair, condition_factor_poor) VALUES
('Soap', 2, 50.00, 30.00, 80.00, 1.00, 0.75, 0.50, 0.25),
('Shampoo', 2, 150.00, 100.00, 250.00, 1.00, 0.75, 0.50, 0.25),
('Toothpaste', 2, 80.00, 50.00, 120.00, 1.00, 0.75, 0.50, 0.25),
('Toothbrush', 2, 50.00, 30.00, 80.00, 1.00, 0.75, 0.50, 0.25),
('Toilet Paper', 2, 100.00, 70.00, 150.00, 1.00, 0.75, 0.50, 0.25),
('Detergent', 2, 150.00, 100.00, 250.00, 1.00, 0.75, 0.50, 0.25),
('Sanitary Pads', 2, 100.00, 70.00, 150.00, 1.00, 0.75, 0.50, 0.25),
('Diapers', 2, 200.00, 150.00, 300.00, 1.00, 0.75, 0.50, 0.25),
('Face Masks', 2, 150.00, 100.00, 250.00, 1.00, 0.75, 0.50, 0.25),
('Alcohol', 2, 100.00, 70.00, 150.00, 1.00, 0.75, 0.50, 0.25),
('Hand Sanitizer', 2, 150.00, 100.00, 250.00, 1.00, 0.75, 0.50, 0.25),
('Tissues', 2, 80.00, 50.00, 120.00, 1.00, 0.75, 0.50, 0.25),
('Other Hygiene Items', 2, 100.00, 50.00, 200.00, 1.00, 0.75, 0.50, 0.25);

-- ==================================
-- CATEGORY 3: Clothing
-- ==================================
INSERT INTO ItemType (itemtype_name, itemcategory_id, avg_retail_price, min_fmv, max_fmv, condition_factor_new, condition_factor_good, condition_factor_fair, condition_factor_poor) VALUES
('T-Shirts', 3, 200.00, 150.00, 300.00, 1.00, 0.75, 0.50, 0.25),
('Pants', 3, 300.00, 200.00, 500.00, 1.00, 0.75, 0.50, 0.25),
('Dresses', 3, 400.00, 300.00, 600.00, 1.00, 0.75, 0.50, 0.25),
('Shorts', 3, 200.00, 150.00, 300.00, 1.00, 0.75, 0.50, 0.25),
('Underwear (New Only)', 3, 100.00, 70.00, 150.00, 1.00, 0.75, 0.50, 0.25),
('Socks', 3, 50.00, 30.00, 80.00, 1.00, 0.75, 0.50, 0.25),
('Shoes', 3, 500.00, 300.00, 700.00, 1.00, 0.75, 0.50, 0.25),
('Jackets', 3, 600.00, 400.00, 900.00, 1.00, 0.75, 0.50, 0.25),
('School Uniforms', 3, 800.00, 600.00, 1000.00, 1.00, 0.75, 0.50, 0.25),
('Baby Clothes', 3, 300.00, 200.00, 500.00, 1.00, 0.75, 0.50, 0.25),
('Sleepwear', 3, 200.00, 150.00, 300.00, 1.00, 0.75, 0.50, 0.25),
('Other Clothing', 3, 250.00, 150.00, 400.00, 1.00, 0.75, 0.50, 0.25);

-- ==================================
-- CATEGORY 4: Shelter Materials
-- ==================================
INSERT INTO ItemType (itemtype_name, itemcategory_id, avg_retail_price, min_fmv, max_fmv, condition_factor_new, condition_factor_good, condition_factor_fair, condition_factor_poor) VALUES
('Blankets', 4, 500.00, 350.00, 700.00, 1.00, 0.75, 0.50, 0.25),
('Tents', 4, 4000.00, 3000.00, 5000.00, 1.00, 0.75, 0.50, 0.25),
('Tarpaulins', 4, 1200.00, 800.00, 1500.00, 1.00, 0.75, 0.50, 0.25),
('Pillows', 4, 300.00, 200.00, 500.00, 1.00, 0.75, 0.50, 0.25),
('Bed Sheets', 4, 400.00, 250.00, 600.00, 1.00, 0.75, 0.50, 0.25),
('Mosquito Nets', 4, 600.00, 400.00, 800.00, 1.00, 0.75, 0.50, 0.25),
('Jerry Cans', 4, 200.00, 150.00, 300.00, 1.00, 0.75, 0.50, 0.25),
('Plastic Containers', 4, 150.00, 100.00, 250.00, 1.00, 0.75, 0.50, 0.25),
('Emergency Kits', 4, 1200.00, 800.00, 1500.00, 1.00, 0.75, 0.50, 0.25),
('Sleeping Bags', 4, 1500.00, 1000.00, 2000.00, 1.00, 0.75, 0.50, 0.25),
('Mats', 4, 300.00, 200.00, 500.00, 1.00, 0.75, 0.50, 0.25),
('Other Shelter Items', 4, 500.00, 300.00, 800.00, 1.00, 0.75, 0.50, 0.25);

-- ==================================
-- CATEGORY 5: Educational Materials
-- ==================================
INSERT INTO ItemType (itemtype_name, itemcategory_id, avg_retail_price, min_fmv, max_fmv, condition_factor_new, condition_factor_good, condition_factor_fair, condition_factor_poor) VALUES
('Notebooks', 5, 80.00, 50.00, 120.00, 1.00, 0.75, 0.50, 0.25),
('Ballpens', 5, 25.00, 15.00, 40.00, 1.00, 0.75, 0.50, 0.25),
('Pencils', 5, 15.00, 10.00, 25.00, 1.00, 0.75, 0.50, 0.25),
('Crayons (12 pcs)', 5, 60.00, 40.00, 90.00, 1.00, 0.75, 0.50, 0.25),
('Coloring Materials (Markers/Paints)', 5, 180.00, 100.00, 300.00, 1.00, 0.75, 0.50, 0.25),
('Ruler/Compass/Protractor Set', 5, 80.00, 50.00, 120.00, 1.00, 0.75, 0.50, 0.25),
('Backpacks/School Bags', 5, 600.00, 400.00, 800.00, 1.00, 0.75, 0.50, 0.25),
('Textbooks', 5, 500.00, 300.00, 800.00, 1.00, 0.75, 0.50, 0.25),
('Storybooks', 5, 300.00, 150.00, 500.00, 1.00, 0.75, 0.50, 0.25),
('Paper Reams (Bond Paper)', 5, 300.00, 200.00, 400.00, 1.00, 0.75, 0.50, 0.25),
('Folders/Binder Sets', 5, 150.00, 100.00, 250.00, 1.00, 0.75, 0.50, 0.25),
('Chalk/Whiteboard Markers', 5, 120.00, 80.00, 200.00, 1.00, 0.75, 0.50, 0.25),
('Educational Toys (Preschool)', 5, 600.00, 300.00, 1000.00, 1.00, 0.75, 0.50, 0.25),
('Tablet/Basic Laptop (for learning)', 5, 12000.00, 8000.00, 15000.00, 1.00, 0.75, 0.50, 0.25),
('Other Educational Materials', 5, 300.00, 150.00, 600.00, 1.00, 0.75, 0.50, 0.25);

-- ==================================
-- CATEGORY 6: Kitchen Utensils
-- ==================================
INSERT INTO ItemType (itemtype_name, itemcategory_id, avg_retail_price, min_fmv, max_fmv, condition_factor_new, condition_factor_good, condition_factor_fair, condition_factor_poor) VALUES
('Cooking Pots (medium)', 6, 1200.00, 800.00, 2000.00, 1.00, 0.75, 0.50, 0.25),
('Frying Pan', 6, 900.00, 600.00, 1500.00, 1.00, 0.75, 0.50, 0.25),
('Cooking Utensil Set (spoon, ladle, etc.)', 6, 600.00, 400.00, 1000.00, 1.00, 0.75, 0.50, 0.25),
('Cutlery Set (forks, spoons, knives)', 6, 800.00, 500.00, 1200.00, 1.00, 0.75, 0.50, 0.25),
('Plates (set of 6)', 6, 800.00, 500.00, 1200.00, 1.00, 0.75, 0.50, 0.25),
('Bowls (set of 6)', 6, 600.00, 400.00, 900.00, 1.00, 0.75, 0.50, 0.25),
('Cups/Glasses (set)', 6, 500.00, 300.00, 800.00, 1.00, 0.75, 0.50, 0.25),
('Cooking Knife', 6, 350.00, 200.00, 600.00, 1.00, 0.75, 0.50, 0.25),
('Chopping Board', 6, 250.00, 150.00, 400.00, 1.00, 0.75, 0.50, 0.25),
('Rice Cooker', 6, 2000.00, 1500.00, 2500.00, 1.00, 0.75, 0.50, 0.25),
('Water Jug/Pitcher', 6, 300.00, 200.00, 500.00, 1.00, 0.75, 0.50, 0.25),
('Thermos Flask', 6, 700.00, 400.00, 1000.00, 1.00, 0.75, 0.50, 0.25),
('Serving Tray', 6, 300.00, 200.00, 500.00, 1.00, 0.75, 0.50, 0.25),
('Plastic Containers (food storage)', 6, 400.00, 200.00, 600.00, 1.00, 0.75, 0.50, 0.25),
('Other Kitchen Items', 6, 500.00, 250.00, 800.00, 1.00, 0.75, 0.50, 0.25);

-- ==================================
-- CATEGORY 7: Medical Supplies
-- ==================================
INSERT INTO ItemType (itemtype_name, itemcategory_id, avg_retail_price, min_fmv, max_fmv, condition_factor_new, condition_factor_good, condition_factor_fair, condition_factor_poor) VALUES
('First Aid Kit', 7, 1200.00, 800.00, 2000.00, 1.00, 0.75, 0.50, 0.25),
('Bandages', 7, 200.00, 150.00, 300.00, 1.00, 0.75, 0.50, 0.25),
('Antiseptic Solution', 7, 150.00, 100.00, 250.00, 1.00, 0.75, 0.50, 0.25),
('Basic Medicines', 7, 500.00, 300.00, 800.00, 1.00, 0.75, 0.50, 0.25),
('Gloves (Disposable)', 7, 100.00, 70.00, 150.00, 1.00, 0.75, 0.50, 0.25),
('Face Masks', 7, 150.00, 100.00, 250.00, 1.00, 0.75, 0.50, 0.25),
('Thermometer', 7, 600.00, 400.00, 900.00, 1.00, 0.75, 0.50, 0.25),
('Stethoscope', 7, 1200.00, 800.00, 2000.00, 1.00, 0.75, 0.50, 0.25),
('Other Medical Supplies', 7, 500.00, 300.00, 800.00, 1.00, 0.75, 0.50, 0.25);






















-- Run this query after downloading the CSV files (run in psql Shell)
\copy table_region(region_id, region_name, region_description) FROM 'C:\Users\ASUS\Downloads\table_region.csv' DELIMITER ',' CSV HEADER;
\copy table_province(province_id, region_id, province_name) FROM 'C:\Users\ASUS\Downloads\table_province.csv' DELIMITER ',' CSV HEADER;
\copy table_municipality(municipality_id, province_id, municipality_name) FROM 'C:\Users\ASUS\Downloads\table_municipality.csv' DELIMITER ',' CSV HEADER;
\copy table_barangay(barangay_id, municipality_id, barangay_name) FROM 'C:\Users\ASUS\Downloads\table_barangay.csv' DELIMITER ',' CSV HEADER;








SELECT * FROM roles;
SELECT * FROM permissions;
SELECT * FROM rolepermissions;
SELECT * FROM table_region;
SELECT * FROM table_province;
SELECT * FROM table_municipality;
SELECT * FROM table_barangay;
SELECT * FROM Vicariates;
SELECT * FROM Parishes;
SELECT * FROM Users;
SELECT * FROM Login_Credentials;
SELECT * FROM UserActivityLogs;
SELECT * FROM Notifications
SELECT * FROM DonationRequests;
SELECT * FROM DonationItems;
SELECT * FROM Appointments;
SELECT * FROM Inventory;
SELECT * FROM ItemCategory;
SELECT * FROM ItemType;
SELECT * FROM DistributionPlans;
SELECT * FROM DistributionLogs;
SELECT * FROM BeneficiaryRequests;
SELECT * FROM Beneficiaries;
SELECT * FROM BeneficiaryRequestItems;

SELECT 
    r.role_name,
    p.permission_name,
    p.perm_description
FROM RolePermissions rp
JOIN Roles r ON r.role_id = rp.role_id
JOIN Permissions p ON p.permission_id = rp.permission_id
WHERE r.role_name = 'Resource Staff'
ORDER BY p.permission_name;

SELECT 
    r.role_name,
    p.permission_name,
    p.perm_description
FROM RolePermissions rp
JOIN Roles r ON r.role_id = rp.role_id
JOIN Permissions p ON p.permission_id = rp.permission_id
WHERE r.role_name = 'Donor'
ORDER BY p.permission_name;

SELECT 
    r.role_name,
    p.permission_name,
    p.perm_description
FROM RolePermissions rp
JOIN Roles r ON r.role_id = rp.role_id
JOIN Permissions p ON p.permission_id = rp.permission_id
WHERE r.role_name = 'Executive Admin'
ORDER BY p.permission_name;






-- Insert test user
INSERT INTO Users (user_id, full_name, email, role_id, status, is_approved, email_verified) 
VALUES (
    'TEST_ADMIN_001', 
    'Test Admin', 
    'admin@test.com', 
    (SELECT role_id FROM Roles WHERE role_name = 'Executive Admin'),
    'active', 
    true, 
    true
);

-- Use the hashes generated by the script above
INSERT INTO Users (
    user_id, full_name, email, account_type, role_id, status, is_approved, email_verified
) VALUES 
('TEST_ADMIN_001', 'Test Admin', 'admin@test.com', 'INDIVIDUAL', 
 (SELECT role_id FROM Roles WHERE role_name = 'Executive Admin'), 'active', true, true),
('TEST_STAFF_001', 'Test Staff', 'staff@test.com', 'INDIVIDUAL', 
 (SELECT role_id FROM Roles WHERE role_name = 'Resource Staff'), 'active', true, true),
('TEST_DONOR_001', 'Test Donor', 'donor@test.com', 'INDIVIDUAL', 
 (SELECT role_id FROM Roles WHERE role_name = 'Donor'), 'active', true, true);

-- Insert the hashed passwords (replace with actual hashes from script output)
INSERT INTO Login_Credentials (user_id, password_hash, login_attempts) VALUES 
('TEST_ADMIN_001', '$2b$10$Arziy1RUKTWPpEaWhXFpQOHZnmX102lMAtnSBMWjRiYR.KW2JtlMq', 0),
('TEST_STAFF_001', '$2b$10$82.JxGkwCwW0HiuP7Fxhg.tv.bK.OLnnfkJmUHIOEo4r.1179pTcG', 0),
('TEST_DONOR_001', '$2b$10$QKvYn08WA8z5A8ixgXAumuu/48P4LaomzoVgxPlCEuXs.4/jEzpf6', 0);

TRUNCATE TABLE DonationRequest, Login_Credentials RESTART IDENTITY;







SELECT lc.user_id, lc.password_hash 
FROM Login_Credentials lc 
JOIN Users u ON u.user_id = lc.user_id 
WHERE u.email = 'admin@test.com';

INSERT INTO Users (
    user_id, full_name, email, account_type, role_id, status, is_approved, email_verified
) VALUES 
('TEST_DONOR_002', 'John Vincent Borbon', 'borbonjv@gmail.com', 'INDIVIDUAL', 
 (SELECT role_id FROM Roles WHERE role_name = 'Donor'), 'active', true, true);

 SELECT * FROM ItemType;


-- Add to DonationRequests
ALTER TABLE BeneficiaryRequests 
ADD COLUMN created_by VARCHAR(25) REFERENCES Users(user_id),
ADD COLUMN updated_by VARCHAR(25) REFERENCES Users(user_id),
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
ADD COLUMN approved_by VARCHAR(25) REFERENCES Users(user_id),
ADD COLUMN approved_at TIMESTAMP;

ALTER TABLE DonationRequests 
ADD COLUMN created_by VARCHAR(25) REFERENCES Users(user_id),
ADD COLUMN updated_by VARCHAR(25) REFERENCES Users(user_id),


ALTER TABLE Appointments
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- For resetting purposes only --
TRUNCATE TABLE rolepermissions, permissions RESTART IDENTITY;

 TRUNCATE TABLE 
    UserActivityLogs,
    DonationItems,
    DonationRequests,
    Appointments,
	BazaarLogs,
	DistributionPlanItems,
    Inventory
RESTART IDENTITY CASCADE;

TRUNCATE TABLE 
	Beneficiaries,
	BeneficiaryRequests,
	DistributionLogs,
	DistributionLogs,
	DistributionPlanItems
RESTART IDENTITY CASCADE;

UPDATE DonationRequests
SET status = 'Approved'
WHERE status = 'Completed'

ALTER TABLE Users
ADD COLUMN new_parish_id INT,
ADD COLUMN new_vicariate_id INT;

DROP TABLE ItemType

UPDATE Users u
SET new_parish_id = p.parish_id
FROM Parishes p
WHERE u.parish_id = p.parish_name;

UPDATE Users u
SET new_vicariate_id = v.vicariate_id
FROM Vicariates v
WHERE u.vicariate_id = v.vicariate_name;

ALTER TABLE Users
DROP COLUMN parish_id,
DROP COLUMN vicariate_id;

ALTER TABLE Users
RENAME COLUMN new_parish_id TO parish_id;

ALTER TABLE Users
RENAME COLUMN new_vicariate_id TO vicariate_id;



ALTER TABLE ItemType
DROP COLUMN fmv_Value

ALTER TABLE ItemType
 ADD COLUMN avg_retail_price NUMERIC(12,2),
 ADD COLUMN min_fmv NUMERIC(12,2),
 ADD COLUMN max_fmv NUMERIC(12,2),
 ADD COLUMN	condition_factor_new NUMERIC(3,2) DEFAULT 1.00,
 ADD COLUMN condition_factor_good NUMERIC(3,2) DEFAULT 0.75,
 ADD COLUMN condition_factor_fair NUMERIC(3,2) DEFAULT 0.50,
 ADD COLUMN condition_factor_poor NUMERIC(3,2) DEFAULT 0.25

ALTER TABLE DonationItems
ADD COLUMN selected_condition VARCHAR(10) NOT NULL DEFAULT 'New',  -- New, Good, Fair, Poor
ADD COLUMN condition_multiplier NUMERIC(5,2) DEFAULT 1.00,        -- fetched from ItemType by default
ADD COLUMN calculated_fmv NUMERIC(12,2) DEFAULT 0.00,            -- quantity × avg_retail_price × condition_multiplier


DROP TABLE DonationItems;
DROP TABLE DistributionPlans;
DROP TABLE DistributionPlanItems;
DROP TABLE DistributionLogs;
DROP TABLE BazaarLogs;
DROP TABLE Inventory;
DROP TABLE ItemType;


ALTER TABLE Users
DROP COLUMN profile_picture_url
ADD COLUMN is_walkin_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN temp_email_generated BOOLEAN DEFAULT FALSE;

ALTER TABLE DonationRequests 
ADD COLUMN is_walkin BOOLEAN DEFAULT FALSE;

ALTER TABLE DonationRequests ADD COLUMN created_by VARCHAR(25) REFERENCES Users(user_id);
