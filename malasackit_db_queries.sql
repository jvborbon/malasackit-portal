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
    parish_id VARCHAR(255),
    vicariate_id VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
	appointment_id INT NOT NULL REFERENCES Appointments(appointment_id)
);


CREATE TABLE DonationItems (
    item_id SERIAL PRIMARY KEY,
    donation_id INT NOT NULL REFERENCES DonationRequests(donation_id) ON DELETE CASCADE,
    item_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_value NUMERIC(12,2) DEFAULT 0.00, -- FMV or estimated value
    category VARCHAR(50),
    description TEXT
);

CREATE TABLE Beneficiaries (

);

CREATE TABLE BeneficiaryRequests (

);

CREATE TABLE DistributionPlans (

);

CREATE TABLE DistributionPlanItems (

);

CREATE TABLE DistributionLogs (

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

CREATE TABLE ItemType (

);

CREATE TABLE ItemCategory (

);

CREATE TABLE ItemRefValue (

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



-- For resetting purposes only --
TRUNCATE TABLE rolepermissions, permissions RESTART IDENTITY;

