-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS CUST_USER CASCADE;
DROP TABLE IF EXISTS CUST_ACCOUNT CASCADE;
DROP TABLE IF EXISTS OP_USER CASCADE;
DROP TABLE IF EXISTS LOGIN_USER CASCADE;
DROP TABLE IF EXISTS SECTOR CASCADE;
DROP TABLE IF EXISTS COUNTRY CASCADE;
DROP TABLE IF EXISTS LOGIN_USER CASCADE;
DROP TABLE IF EXISTS CITY CASCADE;
DROP TABLE IF EXISTS LOGIN_STATS CASCADE;
DROP TABLE IF EXISTS FILES_REPO_TYPEoF CASCADE;
DROP TABLE IF EXISTS FILES_REPO CASCADE;
DROP TABLE IF EXISTS CUST_ACCOUNT_FILES CASCADE;
DROP TABLE IF EXISTS "ORDER" CASCADE;
DROP TABLE IF EXISTS ORDER_STATUS CASCADE;
DROP TABLE IF EXISTS GLOBAL_SETTINGS CASCADE;
DROP TABLE IF EXISTS HISTO_ORDER CASCADE;
DROP TABLE IF EXISTS TRANSPORT_MODE CASCADE;
DROP TABLE IF EXISTS UNIT_WEIGHT CASCADE;
DROP TABLE IF EXISTS RECIPIENT_ACCOUNT CASCADE;
DROP TABLE IF EXISTS ORD_CERTIF_ORI CASCADE;
DROP TABLE IF EXISTS ORD_CERTIF_GOODS CASCADE;
DROP TABLE IF EXISTS SERVICES_CHARGES CASCADE;
DROP TABLE IF EXISTS CURRENCY CASCADE;
DROP TABLE IF EXISTS ORD_COM_INVOICE CASCADE;

CREATE TABLE CURRENCY (
    ID_CURRENCY INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    SYMBOL VARCHAR(8) NOT NULL,                 -- Non nullable
    CODE VARCHAR(16) NOT NULL,                  -- Non nullable
    EXCHANGE_RATE FLOAT DEFAULT 0 NOT NULL      -- Non nullable avec valeur par défaut
);

CREATE TABLE LOGIN_USER (
    ID_LOGIN_USER INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    USERNAME VARCHAR(32) NOT NULL UNIQUE,              -- Non nullable
    PWD VARCHAR(128) NOT NULL,                  -- Non nullable
    IsADMIN_LOGIN BOOLEAN DEFAULT FALSE NOT NULL, -- Non nullable avec valeur par défaut
    DEACTIVATION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '100 years' NOT NULL,  -- Non nullable avec valeur par défaut
    LASTLOGIN_TIME TIMESTAMP NULL               -- Nullable
);


-- Create SECTOR table
CREATE TABLE SECTOR (
    ID_SECTOR INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    SYMBOL_FR VARCHAR(64) NOT NULL,             -- Non nullable
    SYMBOL_ENG VARCHAR(64) NOT NULL,            -- Non nullable
    DEACTIVATION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '100 years' NOT NULL -- Non nullable with default value
);

-- Create COUNTRY table
CREATE TABLE COUNTRY (
    ID_COUNTRY INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    SYMBOL_FR VARCHAR(64) NOT NULL,             -- Non nullable
    SYMBOL_ENG VARCHAR(64) NOT NULL,            -- Non nullable
    DEACTIVATION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '100 years' NOT NULL -- Non nullable with default value
);

CREATE TABLE CITY (
    ID_CITY INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    ID_COUNTRY INT NOT NULL,                    -- Non nullable
    SYMBOL_FR VARCHAR(64) NOT NULL,             -- Non nullable
    SYMBOL_ENG VARCHAR(64) NOT NULL,            -- Non nullable
    DEACTIVATION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '100 years' NOT NULL, -- Non nullable avec valeur par défaut
    FOREIGN KEY (ID_COUNTRY) REFERENCES COUNTRY(ID_COUNTRY)
);

CREATE TABLE LOGIN_STATS (
    ID_LOGIN_STATS INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    IDLOGIN INT NOT NULL,                         -- Non nullable
    LOGIN_TIME TIMESTAMP NOT NULL,               -- Non nullable
    FOREIGN KEY (IDLOGIN) REFERENCES LOGIN_USER(ID_LOGIN_USER)
);

CREATE TABLE OP_USER (
    ID_OP_USER INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    ID_LOGIN_USER INT NOT NULL,               -- Non nullable
    GENDER INT NOT NULL,                      -- Non nullable
    FULL_NAME VARCHAR(96) NOT NULL,           -- Non nullable
    ROLES INT DEFAULT 0 NOT NULL,             -- Non nullable avec valeur par défaut
    EMAIL VARCHAR(32) NOT NULL,               -- Non nullable
    PHONE_NUMBER VARCHAR(32) NULL,            -- Nullable
    MOBILE_NUMBER VARCHAR(12) NULL,           -- Nullable
    IDLOGIN_INSERT INT NOT NULL,              -- Non nullable
    INSERTDATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,  -- Non nullable avec valeur par défaut
    DEACTIVATION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '100 years' NOT NULL, -- Non nullable avec valeur par défaut
    FOREIGN KEY (IDLOGIN_INSERT) REFERENCES LOGIN_USER(ID_LOGIN_USER),
    FOREIGN KEY (ID_LOGIN_USER) REFERENCES LOGIN_USER(ID_LOGIN_USER)
);

CREATE TABLE CUST_ACCOUNT (
    ID_CUST_ACCOUNT INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    LEGAL_FORM VARCHAR(32) NOT NULL,              -- Non nullable
    CUST_NAME VARCHAR(96) NOT NULL,               -- Non nullable
    TRADE_REGISTRATION_NUM VARCHAR(32) NOT NULL,  -- Non nullable
    IN_FREE_ZONE BOOLEAN DEFAULT FALSE NOT NULL,  -- Non nullable avec valeur par défaut
    IDENTIFICATION_NUMBER VARCHAR(32) NOT NULL,   -- Non nullable
    REGISTER_NUMBER VARCHAR(32),
    FULL_ADDRESS VARCHAR(160) NOT NULL,           -- Non nullable
    ID_SECTOR INT,
    OTHER_SECTOR VARCHAR(64), 
    ID_COUNTRY INT,                                  -- Non nullable  
    STATUT_FLAG INT DEFAULT 1 NOT NULL,           -- Non nullable avec valeur par défaut
    INSERTDATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Non nullable avec valeur par défaut
    ACTIVATION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Non nullable avec valeur par défaut
    DEACTIVATION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '100 years' NOT NULL, -- Non nullable avec valeur par défaut
    IDLOGIN_INSERT INT NOT NULL,                  -- Non nullable
    LASTMODIFIED TIMESTAMP NULL,                  -- Nullable
    IDLOGIN_MODIFY INT NULL,                      -- Nullable
    BILLED_CUST_NAME VARCHAR(96) NULL,            -- Nullable
    BILL_FULL_ADDRESS VARCHAR(160) NULL,          -- Nullable
    BILL_COUNTRY VARCHAR(32) NULL,                -- Nullable
    FOREIGN KEY (ID_COUNTRY) REFERENCES COUNTRY(ID_COUNTRY),
    FOREIGN KEY (ID_SECTOR) REFERENCES SECTOR(ID_SECTOR),
    FOREIGN KEY (IDLOGIN_INSERT) REFERENCES LOGIN_USER(ID_LOGIN_USER),
    FOREIGN KEY (IDLOGIN_MODIFY) REFERENCES LOGIN_USER(ID_LOGIN_USER)
);

CREATE TABLE CUST_USER (
    ID_CUST_USER INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    ID_CUST_ACCOUNT INT NOT NULL,             -- Non nullable
    ID_LOGIN_USER INT NOT NULL,               -- Non nullable
    GENDER INT NOT NULL,                      -- Non nullable
    FULL_NAME VARCHAR(96) NOT NULL,           -- Non nullable
    IsMAIN_USER BOOLEAN DEFAULT FALSE NOT NULL, -- Non nullable avec valeur par défaut
    EMAIL VARCHAR(32) NOT NULL,               -- Non nullable
    PHONE_NUMBER VARCHAR(32) NULL,            -- Nullable
    MOBILE_NUMBER VARCHAR(12) NULL,           -- Nullable
    USER_POSITION VARCHAR(64) NULL,
    IDLOGIN_INSERT INT NOT NULL,              -- Non nullable
    INSERTDATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,  -- Non nullable avec valeur par défaut
    DEACTIVATION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '100 years' NOT NULL, -- Non nullable avec valeur par défaut
    FOREIGN KEY (ID_CUST_ACCOUNT) REFERENCES CUST_ACCOUNT(ID_CUST_ACCOUNT),
    FOREIGN KEY (ID_LOGIN_USER) REFERENCES LOGIN_USER(ID_LOGIN_USER),
    FOREIGN KEY (IDLOGIN_INSERT) REFERENCES LOGIN_USER(ID_LOGIN_USER)
);




CREATE TABLE FILES_REPO_TYPEoF (
    ID_FILES_REPO_TYPEoF INT PRIMARY KEY /*GENERATED ALWAYS AS IDENTITY*/,
    TXT_DESCRIPTION_FR VARCHAR(64) NOT NULL,       -- Non nullable
    TXT_DESCRIPTION_ENG VARCHAR(64) NOT NULL,       -- Non nullable
    IsMANDATORY BOOLEAN DEFAULT FALSE NOT NULL  
);


CREATE TABLE FILES_REPO (
    ID_FILES_REPO INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    IDFILES_REPO_TYPEoF INT NOT NULL,             -- Non nullable
    FILE_ORIGIN_NAME VARCHAR(160) NOT NULL,       -- Non nullable
    FILE_GUID VARCHAR(64) NOT NULL,               -- Non nullable
    FILE_PATH VARCHAR(256) NOT NULL,              -- Non nullable
    INSERTDATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Non nullable avec valeur par défaut
    IDLOGIN_INSERT INT NOT NULL,                  -- Non nullable
    LASTMODIFIED TIMESTAMP NULL,                  -- Nullable
    IDLOGIN_MODIFY INT NULL,                      -- Nullable
    DEACTIVATION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '100 years' NOT NULL, -- Non nullable avec valeur par défaut
    FOREIGN KEY (IDFILES_REPO_TYPEoF) REFERENCES FILES_REPO_TYPEoF(ID_FILES_REPO_TYPEoF),
    FOREIGN KEY (IDLOGIN_INSERT) REFERENCES LOGIN_USER(ID_LOGIN_USER),
    FOREIGN KEY (IDLOGIN_MODIFY) REFERENCES LOGIN_USER(ID_LOGIN_USER)
);


CREATE TABLE CUST_ACCOUNT_FILES (
    ID_CUST_ACCOUNT_FILES INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    ID_FILES_REPO INT NOT NULL,                   -- Non nullable
    ID_CUST_ACCOUNT INT NOT NULL,                 -- Non nullable
    DEACTIVATION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '100 years' NOT NULL, -- Non nullable avec valeur par défaut
    FOREIGN KEY (ID_FILES_REPO) REFERENCES FILES_REPO(ID_FILES_REPO),
    FOREIGN KEY (ID_CUST_ACCOUNT) REFERENCES CUST_ACCOUNT(ID_CUST_ACCOUNT)
);


CREATE TABLE ORDER_STATUS (
    ID_ORDER_STATUS INT PRIMARY KEY,
    TXT_ORDER_STATUS_FR VARCHAR(64) NOT NULL,       -- Non nullable
    TXT_ORDER_STATUS_ENG VARCHAR(64) NOT NULL,       -- Non nullable
    NOTE VARCHAR(64) NULL                        -- Nullable
);

CREATE TABLE "ORDER" (
    ID_ORDER INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    ID_CUST_ACCOUNT INT NOT NULL,                 -- Non nullable
    ORDER_TITLE VARCHAR(32) NOT NULL,            -- Non nullable
    ID_ORDER_STATUS INT,
    IDLOGIN_OWNER INT,
    IDLOGIN_SPARE INT,
    DATE_OWNER TIMESTAMP,
    DATE_SPARE TIMESTAMP,
    DATE_LAST_SUBMISSION TIMESTAMP,
    DATE_LAST_RETURN TIMESTAMP,
    DATE_VALIDATION TIMESTAMP,
    INSERTDATE TIMESTAMP,
    IDLOGIN_INSERT INT,
    LASTMODIFIED TIMESTAMP,
    IDLOGIN_MODIFY INT,
    TYPEoF INT DEFAULT 0 NOT NULL,               -- Non nullable avec valeur par défaut
   
    FOREIGN KEY (ID_CUST_ACCOUNT) REFERENCES CUST_ACCOUNT(ID_CUST_ACCOUNT),
    FOREIGN KEY (ID_ORDER_STATUS) REFERENCES ORDER_STATUS(ID_ORDER_STATUS),
    FOREIGN KEY (IDLOGIN_INSERT) REFERENCES LOGIN_USER(ID_LOGIN_USER),
    FOREIGN KEY (IDLOGIN_MODIFY) REFERENCES LOGIN_USER(ID_LOGIN_USER),
    FOREIGN KEY (IDLOGIN_OWNER) REFERENCES LOGIN_USER(ID_LOGIN_USER),
    FOREIGN KEY (IDLOGIN_SPARE) REFERENCES LOGIN_USER(ID_LOGIN_USER)
);


CREATE TABLE GLOBAL_SETTINGS (
    ID_GLOBAL_SETTINGS INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    CODE INT NOT NULL,                                -- Non nullable
    IDLOGIN INT NULL,                                -- Nullable
    ID_ORDER INT NULL,                              -- Nullable
    ID_CUST_ACCOUNT INT NULL,                       -- Nullable
    ID_FILES_REPO INT NULL,                         -- Nullable
    FREE_TXT1 VARCHAR(128) NULL,                    -- Nullable
    FREE_TXT2 VARCHAR(128) NULL,                    -- Nullable
    FREE_TXT3 VARCHAR(128) NULL,                    -- Nullable
    FREE_MEMO TEXT NULL,                            -- Nullable
    FREE_FLOAT1 FLOAT NULL,                         -- Nullable
    FREE_FLOAT2 FLOAT NULL,                         -- Nullable
    FREE_FLOAT3 FLOAT NULL,                         -- Nullable
    FREE_DATE1 TIMESTAMP NULL,                      -- Nullable
    FREE_DATE2 TIMESTAMP NULL,                      -- Nullable
    FREE_DATE3 TIMESTAMP NULL,                      -- Nullable
    INSERTDATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Non nullable avec valeur par défaut
    LASTMODIFIED TIMESTAMP NULL,                    -- Nullable
    ACTIVATION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Non nullable avec valeur par défaut
    DEACTIVATION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '100 years' NOT NULL, -- Non nullable avec valeur par défaut
    FREE_BIT1 BOOLEAN,
    FREE_BIT2 BOOLEAN,
    FOREIGN KEY (IDLOGIN) REFERENCES LOGIN_USER(ID_LOGIN_USER),
    FOREIGN KEY (ID_ORDER) REFERENCES "ORDER"(ID_ORDER),
    FOREIGN KEY (ID_CUST_ACCOUNT) REFERENCES CUST_ACCOUNT(ID_CUST_ACCOUNT),
    FOREIGN KEY (ID_FILES_REPO) REFERENCES FILES_REPO(ID_FILES_REPO)
);


CREATE TABLE HISTO_ORDER (
    ID_HISTO_ORDER INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    ID_ORDER INT,
    ID_CUST_ACCOUNT INT,
    ORDER_TITLE VARCHAR(32),
    ID_ORDER_STATUS INT,
    IDLOGIN_OWNER INT,
    IDLOGIN_SPARE INT,
    DATE_OWNER TIMESTAMP,
    DATE_SPARE TIMESTAMP,
    DATE_LAST_SUBMISSION TIMESTAMP,
    DATE_LAST_RETURN TIMESTAMP,
    DATE_VALIDATION TIMESTAMP,
    INSERTDATE TIMESTAMP,
    IDLOGIN_INSERT INT,
    LASTMODIFIED TIMESTAMP,
    IDLOGIN_MODIFY INT,
    TYPEoF INT DEFAULT 1,
    ORDER_HISTO_ACTION INT,              -- Non nullable
    INSERTDATE_HISTO TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Non nullable avec valeur par défaut
    IDLOGIN_INSERT_HISTO INT NOT NULL,                  -- Non nullable
    
    FOREIGN KEY (ID_ORDER) REFERENCES "ORDER"(ID_ORDER),
    FOREIGN KEY (ID_CUST_ACCOUNT) REFERENCES CUST_ACCOUNT(ID_CUST_ACCOUNT),
    FOREIGN KEY (ID_ORDER_STATUS) REFERENCES ORDER_STATUS(ID_ORDER_STATUS),
    FOREIGN KEY (IDLOGIN_INSERT) REFERENCES LOGIN_USER(ID_LOGIN_USER),
    FOREIGN KEY (IDLOGIN_MODIFY) REFERENCES LOGIN_USER(ID_LOGIN_USER),
    FOREIGN KEY (IDLOGIN_OWNER) REFERENCES LOGIN_USER(ID_LOGIN_USER),
    FOREIGN KEY (IDLOGIN_SPARE) REFERENCES LOGIN_USER(ID_LOGIN_USER),
    FOREIGN KEY (IDLOGIN_INSERT_HISTO) REFERENCES LOGIN_USER(ID_LOGIN_USER)
);

CREATE TABLE TRANSPORT_MODE (
    ID_TRANSPORT_MODE INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    SYMBOL_FR VARCHAR(64) NOT NULL,             -- Non nullable
    SYMBOL_ENG VARCHAR(64) NOT NULL,            -- Non nullable
    DEACTIVATION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '100 years' NOT NULL -- Non nullable avec valeur par défaut
);

CREATE TABLE UNIT_WEIGHT (
    ID_UNIT_WEIGHT INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    SYMBOL_FR VARCHAR(64) NOT NULL,             -- Non nullable
    SYMBOL_ENG VARCHAR(64) NOT NULL,            -- Non nullable
    DEACTIVATION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '100 years' NOT NULL -- Non nullable avec valeur par défaut
);


CREATE TABLE RECIPIENT_ACCOUNT (
    ID_RECIPIENT_ACCOUNT INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    ID_CUST_ACCOUNT INT,
    RECIPIENT_NAME VARCHAR(96),
    ADDRESS_1 VARCHAR(160),
    ADDRESS_2 VARCHAR(160) NULL,    -- Nullable
    ADDRESS_3 VARCHAR(160) NULL,    -- Nullable
    ID_CITY INT,
    STATUT_FLAG INT DEFAULT 1 NOT NULL,   -- Valeur par défaut
    INSERTDATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,   -- Non nullable
    ACTIVATION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,   -- Non nullable
    DEACTIVATION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '100 years' NOT NULL,  -- Non nullable
    IDLOGIN_INSERT INT NOT NULL,
    LASTMODIFIED TIMESTAMP NULL,   -- Nullable
    IDLOGIN_MODIFY INT NULL,      -- Nullable
    FOREIGN KEY (ID_CUST_ACCOUNT) REFERENCES CUST_ACCOUNT(ID_CUST_ACCOUNT),
    FOREIGN KEY (IDLOGIN_INSERT) REFERENCES LOGIN_USER(ID_LOGIN_USER),
    FOREIGN KEY (ID_CITY) REFERENCES CITY(ID_CITY),
    FOREIGN KEY (IDLOGIN_MODIFY) REFERENCES LOGIN_USER(ID_LOGIN_USER)
);


CREATE TABLE ORD_CERTIF_ORI (
    ID_ORD_CERTIF_ORI INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    ID_ORDER INT NOT NULL,                                -- Non nullable
    ID_RECIPIENT_ACCOUNT INT,
    ID_COUNTRY_ORIGIN INT NOT NULL,                       -- Non nullable
    ID_COUNTRY_DESTINATION INT NOT NULL,                  -- Non nullable
    TRANSPORT_REMARKS VARCHAR(160) NULL,                  -- Nullable
    NOTES VARCHAR(256) NULL,                              -- Nullable
    COPY_COUNT INT DEFAULT 0 NOT NULL,                    -- Non nullable avec valeur par défaut
    EQUIVALENT_AMOUNT REAL DEFAULT 1 NOT NULL,            -- Non nullable
    INSERTDATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Non nullable avec valeur par défaut
    DEACTIVATION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '100 years' NOT NULL, -- Non nullable avec valeur par défaut
    IDLOGIN_INSERT INT NOT NULL,                          -- Non nullable
    DATE_VALIDATION TIMESTAMP,
    LASTMODIFIED TIMESTAMP NULL,                          -- Nullable
    IDLOGIN_MODIFY INT NULL,                              -- Nullable
    TYPEoF INT DEFAULT 1,
    FOREIGN KEY (ID_ORDER) REFERENCES "ORDER"(ID_ORDER),
    FOREIGN KEY (ID_RECIPIENT_ACCOUNT) REFERENCES RECIPIENT_ACCOUNT(ID_RECIPIENT_ACCOUNT),
    FOREIGN KEY (ID_COUNTRY_ORIGIN) REFERENCES COUNTRY(ID_COUNTRY),
    FOREIGN KEY (ID_COUNTRY_DESTINATION) REFERENCES COUNTRY(ID_COUNTRY),
    FOREIGN KEY (IDLOGIN_INSERT) REFERENCES LOGIN_USER(ID_LOGIN_USER),
    FOREIGN KEY (IDLOGIN_MODIFY) REFERENCES LOGIN_USER(ID_LOGIN_USER)
);


CREATE TABLE ORD_CERTIF_GOODS (
    ID_ORD_CERTIF_GOODS INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    ID_ORD_CERTIF_ORI INT NOT NULL,                -- Non nullable
    GOOD_DESCRIPTION VARCHAR(256) NOT NULL,       -- Non nullable
    GOOD_REFERENCES VARCHAR(160) NULL,            -- Nullable
    DOC_REFERENCES VARCHAR(256) NULL,
    WEIGHT_QTY FLOAT NOT NULL,                    -- Non nullable
    ID_UNIT_WEIGHT INT NOT NULL,                  -- Non nullable
    DEACTIVATION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '100 years' NOT NULL, -- Non nullable avec valeur par défaut
    FOREIGN KEY (ID_ORD_CERTIF_ORI) REFERENCES ORD_CERTIF_ORI(ID_ORD_CERTIF_ORI),
    FOREIGN KEY (ID_UNIT_WEIGHT) REFERENCES UNIT_WEIGHT(ID_UNIT_WEIGHT)
);


CREATE TABLE SERVICES_CHARGES (
    ID_SERVICES_CHARGES INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    DESCRIPTION_FR VARCHAR(96) NOT NULL,             -- Non nullable
    DESCRIPTION_ENG VARCHAR(96) NOT NULL,             -- Non nullable
    TYPEoF INT DEFAULT 1 NOT NULL,               -- Non nullable avec valeur par défaut
    UNIT_PRICE REAL DEFAULT 1 NOT NULL,                   -- Non nullable
    UNIT_PERCENT REAL DEFAULT 1 NOT NULL,
    AMOUNT_LOWER_LIMIT REAL DEFAULT 0,
    AMOUNT_UPPER_LIMIT REAL DEFAULT 9999999999999999,
    WITH_TAX_STAMP BOOLEAN DEFAULT FALSE,
    UNIT_PRICE_STAMP REAL DEFAULT 0,
    WITH_COPIES BOOLEAN DEFAULT FALSE,
    UNIT_PRICE_COPIES REAL DEFAULT 10,
    ID_CURRENCY INT NOT NULL,                    -- Non nullable
    ACTIVATION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Non nullable avec valeur par défaut
    DEACTIVATION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '100 years' NOT NULL, -- Non nullable avec valeur par défaut
    FOREIGN KEY (ID_CURRENCY) REFERENCES CURRENCY(ID_CURRENCY)
);



CREATE TABLE ORD_LEGALIZATION (
    ID_ORD_LEGALIZATION INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    ID_ORDER INT,
    NOTES VARCHAR(256) NULL,
    COPY_COUNT INT DEFAULT 0,
    EQUIVALENT_AMOUNT REAL DEFAULT 1,
    INSERTDATE TIMESTAMP,
    DEACTIVATION_DATE TIMESTAMP,
    IDLOGIN_INSERT INT,
    DATE_VALIDATION TIMESTAMP,
    LASTMODIFIED TIMESTAMP NULL,
    IDLOGIN_MODIFY INT NULL,
    TYPEoF INT DEFAULT 10,

    FOREIGN KEY (ID_ORDER) REFERENCES "ORDER"(ID_ORDER),
    FOREIGN KEY (IDLOGIN_INSERT) REFERENCES LOGIN_USER(ID_LOGIN_USER),
    FOREIGN KEY (IDLOGIN_MODIFY) REFERENCES LOGIN_USER(ID_LOGIN_USER)
);


CREATE TABLE ORD_COM_INVOICE (
    ID_ORD_COM_INVOICE INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    ID_ORDER INT,
    NOTES VARCHAR(256),
    COPY_COUNT INT DEFAULT 0,
    ID_CURRENCY INT,
    CURRENCY_AMOUNT REAL,
    CURRENCY_RATES REAL DEFAULT 1,
    EQUIVALENT_AMOUNT REAL DEFAULT 1,
    INSERTDATE TIMESTAMP,
    DEACTIVATION_DATE TIMESTAMP,
    IDLOGIN_INSERT INT,
    DATE_VALIDATION TIMESTAMP,
    LASTMODIFIED TIMESTAMP,
    IDLOGIN_MODIFY INT,
    TYPEoF INT DEFAULT 100,

    FOREIGN KEY (ID_ORDER) REFERENCES "ORDER"(ID_ORDER),
    FOREIGN KEY (ID_CURRENCY) REFERENCES CURRENCY(ID_CURRENCY),
    FOREIGN KEY (IDLOGIN_INSERT) REFERENCES LOGIN_USER(ID_LOGIN_USER),
    FOREIGN KEY (IDLOGIN_MODIFY) REFERENCES LOGIN_USER(ID_LOGIN_USER)
);


DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'view_login') THEN
        DROP VIEW view_login;
    END IF;
END $$ LANGUAGE plpgsql;

CREATE VIEW view_login AS
SELECT 
    lu.id_login_user,
    uv.idforeign, 
    lu.username AS username, 
    lu.pwd, 
    CASE
     WHEN uv.isopuser = TRUE THEN lu.isadmin_login 
    ELSE FALSE 
    END AS isadmin_login, 
    uv.role_user,
    uv.isopuser,
    uv.isavailable_user,
    CASE 
        WHEN lu.deactivation_date >= CURRENT_DATE THEN 1
        ELSE 0 
    END AS isavailable_login,
    lu.lastlogin_time,
    uv.full_name AS full_name,
    uv.companyname AS companyname,
    uv.id_cust_account AS id_cust_account,
    uv.email AS email
FROM 
    login_user lu
INNER JOIN (
    SELECT 
        opu.id_login_user, 
        opu.id_op_user AS idforeign, 
        1 AS type_login, 
        'CCI' AS companyname, 
        opu.full_name AS full_name, 
        opu.phone_number AS tel, 
        opu.email AS email, 
        opu.roles AS role_user,
        TRUE AS isopuser,
        CASE 
            WHEN opu.deactivation_date >= CURRENT_DATE THEN 1
            ELSE 0 
        END AS isavailable_user,
        0 AS id_cust_account
    FROM 
        op_user opu
    UNION ALL
    SELECT 
        cu.id_login_user, 
        cu.id_cust_user AS idforeign, 
        2 AS type_login, 
        ca.cust_name AS companyname, 
        cu.full_name AS full_name, 
        cu.phone_number AS tel, 
        cu.email AS email, 
        cu.ismain_user::integer AS role_user,
        FALSE AS isopuser,
        CASE 
            WHEN cu.deactivation_date >= CURRENT_DATE AND ca.statut_flag=2 THEN 1
            ELSE 0 
        END AS isavailable_user,
        cu.id_cust_account AS id_cust_account
    FROM 
        cust_user cu
    INNER JOIN 
        cust_account ca ON ca.id_cust_account = cu.id_cust_account
) AS uv
ON lu.id_login_user = uv.id_login_user;


DROP FUNCTION IF EXISTS spSel_Credentials;
CREATE FUNCTION spSel_Credentials(
    p_username VARCHAR(40),
    p_pwd VARCHAR(40),
    p_login_stat_FLAG BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
id_login_user INT,
idforeign INT,
full_name VARCHAR(96),
email VARCHAR(32),
companyname VARCHAR(96),
username VARCHAR(32),
isadmin_login BOOLEAN,
role_user INT,
isopuser BOOLEAN,
id_cust_account INT,
isavailable_user INT,
isavailable_login INT,
lastlogin_time TIMESTAMP
)
AS $$
DECLARE
    rows_found INT;
BEGIN
RETURN QUERY
	SELECT 
	vl."id_login_user", 
	vl."idforeign", 
	vl."full_name", 
	vl."email", 
	vl."companyname", 
	vl."username", 
    vl."isadmin_login", 
	vl."role_user", 
	vl."isopuser", 
	vl."id_cust_account", 
	vl."isavailable_user", 
	vl."isavailable_login", 
	vl."lastlogin_time"
    FROM view_login vl
    WHERE vl."username" = p_username
      AND pwd = p_pwd
      AND vl."isavailable_user" = 1
      AND vl."isavailable_login" = 1;
    
    GET DIAGNOSTICS rows_found = ROW_COUNT;
    IF rows_found = 1 THEN
        UPDATE login_user lu
        SET lastlogin_time = CURRENT_TIMESTAMP
        WHERE lu."username" = p_username
          AND pwd = pwd;
	  
        IF p_login_stat_FLAG THEN
            INSERT INTO login_stats (idlogin, login_time)
            SELECT lu."id_login_user", CURRENT_TIMESTAMP 
            FROM login_user lu
            WHERE lu."username" = p_username
              AND pwd = pwd;
        END IF;
    ELSE
        RAISE EXCEPTION 'LOGIN NOT IDENTIFIED';
    END IF;
END ;
$$ LANGUAGE plpgsql;


DROP PROCEDURE IF EXISTS add_Subscription; 
CREATE OR REPLACE PROCEDURE add_Subscription(
    p_legal_form VARCHAR(32),
    p_cust_name VARCHAR(96),
    p_trade_registration_num VARCHAR(32),
    p_in_free_zone BOOLEAN,
    p_identification_number VARCHAR(32),
    p_register_number VARCHAR(32),
    p_full_address VARCHAR(160),
    p_id_sector INT,
    p_other_sector VARCHAR(64),
    p_id_country INT,
    p_statut_flag INT,
    p_idlogin INT,
    p_billed_cust_name VARCHAR(96),
    p_bill_full_address VARCHAR(160),

    p_gender INT,
    p_full_name VARCHAR(96),
    p_ismain_user BOOLEAN,
    p_email VARCHAR(32),
    p_password VARCHAR(128),
    p_phone_number VARCHAR(32),
    p_mobile_number VARCHAR(12),
    p_position VARCHAR(64),

    INOUT p_id_cust_account INT
)
AS
$$
BEGIN


    IF EXISTS ( SELECT 1 FROM "login_user" WHERE username = p_email) THEN
        RAISE EXCEPTION 'Email non valide (risque de doublon) / Invalid email (duplication)';
    END IF;

	/*faut-il contrôler p_trade_registration_num   et p_identification_number  et  p_register_number*/
    --IF EXISTS ( SELECT 1 FROM "login_user" WHERE username = p_email) THEN
    --    RAISE EXCEPTION 'Email non valide (risque de doublon) / Invalid email (duplication)';
    --END IF;


	INSERT INTO cust_account (
		"legal_form",
		"cust_name",
		"trade_registration_num",
		"in_free_zone", 
		"identification_number",
		"register_number",
		"full_address",
		"id_sector",
		"other_sector",
		"id_country",
		"statut_flag",
		"insertdate",
		"idlogin_insert",
		"billed_cust_name",
		"bill_full_address"
		) VALUES (
		p_legal_form,
		p_cust_name,
		p_trade_registration_num,
		p_in_free_zone, 
		p_identification_number,
		p_register_number,
		p_full_address,
		p_id_sector,
		p_other_sector,
		p_id_country,
		p_statut_flag,
		CURRENT_TIMESTAMP,
		p_idlogin,
		p_billed_cust_name,
		p_bill_full_address
	)
	RETURNING id_cust_account INTO p_id_cust_account;


     CALL  set_cust_user(
		0/*p_id_cust_user*/,
		p_id_cust_account,
		p_gender,
		p_full_name,
		p_ismain_user,
		p_email,
		p_password,
		p_phone_number,
		p_mobile_number,
		p_idlogin,
		p_position
	);
END;
$$ LANGUAGE plpgsql;

DROP PROCEDURE IF EXISTS upd_cust_account;
CREATE OR REPLACE PROCEDURE upd_cust_account(
    p_id_cust_account INT,
    p_legal_form VARCHAR(32),
    p_cust_name VARCHAR(96),
    p_trade_registration_num VARCHAR(32),
    p_in_free_zone BOOLEAN,
    p_identification_number VARCHAR(32),
    p_register_number VARCHAR(32),
    p_full_address VARCHAR(160),
    p_id_sector INT,
    p_other_sector VARCHAR(64),
    p_id_country INT,
    p_statut_flag INT,
    p_idlogin INT,
    p_billed_cust_name VARCHAR(96),
    p_bill_full_address VARCHAR(160)
)
AS
$$
BEGIN
    IF p_id_cust_account IS NULL OR p_id_cust_account = 0 THEN
        RAISE EXCEPTION 'identifiant incorrect / incorrect identifier ';
    ELSE
        UPDATE cust_account
        SET
            "legal_form" = p_legal_form,
            "cust_name" = p_cust_name,
            "trade_registration_num" = p_trade_registration_num,
            "in_free_zone" = p_in_free_zone,  
            "identification_number" = p_identification_number,
	    "register_number" = p_register_number,
            "full_address" = p_full_address,
            "id_sector" = p_id_sector,
	    "other_sector" = p_other_sector,
	    "id_country" = p_id_country,
            "statut_flag" = p_statut_flag,
            "idlogin_modify" = p_idlogin,
            "lastmodified" = NOW(),
            "billed_cust_name" = p_billed_cust_name,
            "bill_full_address" = p_bill_full_address
        WHERE "id_cust_account" = p_id_cust_account;
    END IF;
END;
$$ LANGUAGE plpgsql;


DROP PROCEDURE IF EXISTS upd_cust_account_statut;
CREATE OR REPLACE PROCEDURE upd_cust_account_statut(
    p_id_cust_account INT,
    p_statut_flag INT,
    p_idlogin INT
)
AS
$$
BEGIN
    IF p_id_cust_account IS NULL OR p_id_cust_account = 0 THEN
        RAISE EXCEPTION 'identifiant incorrect / incorrect identifier ';
    ELSE
        UPDATE cust_account
        SET
            "statut_flag" = p_statut_flag,
            "idlogin_modify" = p_idlogin,
            "lastmodified" = NOW()
        WHERE "id_cust_account" = p_id_cust_account;
    END IF;
END;
$$ LANGUAGE plpgsql;


DROP FUNCTION IF EXISTS get_files_repo_typeof_info;
CREATE OR REPLACE FUNCTION get_files_repo_typeof_info(
    p_id_files_repo_typeof_list TEXT,
    p_id_files_repo_typeof_first int,
    p_id_files_repo_typeof_last int,
	p_ismandatory BOOLEAN
)
RETURNS TABLE(
    id_files_repo_typeof INT,
    txt_description_fr VARCHAR(64),
    txt_description_eng VARCHAR(64),
	ismandatory BOOLEAN

) AS
$$
BEGIN
    RETURN QUERY
    SELECT
        ft."id_files_repo_typeof",
        ft."txt_description_fr",
        ft."txt_description_eng",
		ft."ismandatory"
    FROM
        files_repo_typeof ft
    WHERE 
        (p_id_files_repo_typeof_list IS NULL OR ft."id_files_repo_typeof" = ANY (string_to_array(p_id_files_repo_typeof_list, ',')::INT[]))
    AND 
        (p_ismandatory IS NULL OR ft."ismandatory" = p_ismandatory)
    AND 
        (p_id_files_repo_typeof_first IS NULL OR ft."id_files_repo_typeof" >= p_id_files_repo_typeof_first)
    AND 
        ( p_id_files_repo_typeof_last IS NULL OR ft."id_files_repo_typeof" <=  p_id_files_repo_typeof_last)
    ;
END;
$$ LANGUAGE plpgsql;



DROP FUNCTION IF EXISTS get_cust_account_files;
CREATE OR REPLACE FUNCTION get_cust_account_files(
    p_id_cust_account_files_list TEXT,
    p_id_cust_account_list TEXT,
    p_id_files_repo_list TEXT,
    p_id_files_repo_typeof_list TEXT,
    p_id_files_repo_typeof_first INT,
    p_id_files_repo_typeof_last INT,
    p_isactive BOOLEAN
)
RETURNS TABLE(
    id_cust_account_files INT,
    id_cust_account INT,
    cust_name VARCHAR(32),
    id_files_repo INT,
    id_files_repo_typeof INT,
    file_origin_name VARCHAR(160),
    file_guid VARCHAR(64),
    file_path VARCHAR(256),
    insertdate TIMESTAMP,
    idlogin_insert INT,
    lastmodified TIMESTAMP,
    idlogin_modify INT,
    deactivation_date TIMESTAMP,
    txt_description_fr VARCHAR(64),
    txt_description_eng VARCHAR(64),
    ismandatory BOOLEAN
) AS
$$
BEGIN
    RETURN QUERY
    SELECT
        caf."id_cust_account_files",
        caf."id_cust_account",
        ca."cust_name",
        caf."id_files_repo",
        fr."idfiles_repo_typeof",
        fr."file_origin_name",
        fr."file_guid",
        fr."file_path",
        fr."insertdate",
        fr."idlogin_insert",
        fr."lastmodified",
        fr."idlogin_modify",
        fr."deactivation_date",
        ft."txt_description_fr",
        ft."txt_description_eng",
        ft."ismandatory" 
    FROM
        cust_account_files caf
    JOIN 
        cust_account ca ON caf."id_cust_account" = ca."id_cust_account"
    JOIN 
        files_repo fr ON caf."id_files_repo" = fr."id_files_repo" 
    JOIN
        files_repo_typeof ft ON fr."idfiles_repo_typeof" = ft."id_files_repo_typeof"  -- Corrected column name
    WHERE 
        (p_id_cust_account_files_list IS NULL OR caf."id_cust_account_files" = ANY (string_to_array(p_id_cust_account_files_list, ',')::INT[]))
    AND 
        (p_id_cust_account_list IS NULL OR caf."id_cust_account" = ANY(string_to_array(p_id_cust_account_list, ',')::INT[]))
    AND 
        (p_id_files_repo_list IS NULL OR caf."id_files_repo" = ANY(string_to_array(p_id_files_repo_list, ',')::INT[]))
    AND 
        (p_id_files_repo_typeof_list IS NULL OR ft."id_files_repo_typeof" = ANY (string_to_array(p_id_files_repo_typeof_list, ',')::INT[]))  -- Corrected column name
    AND 
        (p_id_files_repo_typeof_first IS NULL OR ft."id_files_repo_typeof" >= p_id_files_repo_typeof_first)  -- Corrected column name
    AND 
        (p_id_files_repo_typeof_last IS NULL OR ft."id_files_repo_typeof" <= p_id_files_repo_typeof_last)  -- Corrected column name
    AND (
         p_isactive IS NULL
         OR (p_isactive IS NOT TRUE AND caf."deactivation_date" <= CURRENT_DATE)
         OR (p_isactive IS TRUE AND caf."deactivation_date" > CURRENT_DATE)
    );
END;
$$ LANGUAGE plpgsql;


DROP PROCEDURE IF EXISTS set_cust_user;
CREATE OR REPLACE PROCEDURE set_cust_user(
    p_id_cust_user INT,
    p_id_cust_account INT,
    p_gender INT,
    p_full_name VARCHAR(96),
    p_ismain_user BOOLEAN,
    p_email VARCHAR(32),
    p_password VARCHAR(128),
    p_phone_number VARCHAR(32),
    p_mobile_number VARCHAR(12),
    p_idlogin INT,
    p_position VARCHAR(64)
	)
AS
$$
DECLARE
    new_id_login INT;
BEGIN
    IF p_id_cust_user IS NULL OR p_id_cust_user = 0 THEN
        IF p_email IS NULL OR LENGTH(TRIM(p_email, ' '))=0 OR p_password IS NULL OR LENGTH(TRIM(p_password, ' '))=0 THEN
         RAISE EXCEPTION 'ERROR : CREDENTIALS NOT AVAILABLE';
        END IF;
        INSERT INTO login_user(
         "username",
         "pwd",
         "isadmin_login"
          ) VALUES (
         p_email,
         p_password,
         FALSE
         )
          RETURNING id_login_user INTO new_id_login;
        INSERT INTO cust_user (
	    "id_cust_account",
            "id_login_user",
            "gender",
            "full_name",
            "ismain_user",
            "email",
            "phone_number",
            "mobile_number",
            "idlogin_insert",
	    "user_position"
        ) VALUES (
	    p_id_cust_account,
            new_id_login,
            p_gender,
            p_full_name,
            p_ismain_user,
            p_email,
            p_phone_number,
            p_mobile_number,
            p_idlogin,
	    p_position
        );
    ELSE
IF p_email IS NOT NULL AND LENGTH(TRIM(p_email, ' '))>0 AND p_password IS NOT NULL OR LENGTH(TRIM(p_password, ' '))>0
     THEN
     UPDATE login_user 
     SET 
        username = p_email,
        pwd = p_password 
     FROM cust_user 
     WHERE login_user."id_login_user" = cust_user."id_login_user" AND cust_user."id_cust_user" = p_id_cust_user;
       END IF;
        UPDATE cust_user
        SET
	    "id_cust_account" = p_id_cust_account,
            "gender" = p_gender,
            "full_name" = p_full_name,
            "ismain_user" = p_ismain_user,
            "email" = p_email,
            "phone_number" = p_phone_number,
            "mobile_number" = p_mobile_number,
	    "user_position" = p_position
        WHERE "id_cust_user" = p_id_cust_user;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS get_custuser_info;
CREATE OR REPLACE FUNCTION get_custuser_info(
    p_id_listCA TEXT,
    p_statutflag INT,
    p_isactiveCA BOOLEAN,
    p_isactiveCU BOOLEAN,
    p_id_listCU TEXT,
    p_ismain_user BOOLEAN
)
RETURNS TABLE(
    id_cust_user INT,
    id_cust_account INT,
    id_login_user INT,
    gender INT,
    full_name VARCHAR(96),
    ismain_user BOOLEAN,
    email VARCHAR(32),
    phone_number VARCHAR(32),
    mobile_number VARCHAR(12),
    "position" VARCHAR(64), -- Correct alias for user_position
    idlogin_insert INT,
    insertdate TIMESTAMP,
    deactivation_date TIMESTAMP,
    username VARCHAR(32),
    lastlogin_time TIMESTAMP
) AS
$$
BEGIN
    RETURN QUERY
    SELECT 
        cu."id_cust_user",
        cu."id_cust_account",
        cu."id_login_user",
        cu."gender",
        cu."full_name",
        cu."ismain_user",
        cu."email",
        cu."phone_number",
        cu."mobile_number",
        cu."user_position" AS "position", -- Correct alias applied
        cu."idlogin_insert",
        cu."insertdate",
        cu."deactivation_date",
        lu."username",
        lu."lastlogin_time"
    FROM 
        cust_user cu
    JOIN 
        login_user lu ON cu."id_login_user" = lu."id_login_user"
    JOIN 
        cust_account ca ON cu."id_cust_account" = ca."id_cust_account"
    WHERE 
        (p_id_listCA IS NULL OR ca."id_cust_account"::TEXT = ANY(STRING_TO_ARRAY(p_id_listCA, ',')))
        AND (p_id_listCU IS NULL OR cu."id_cust_user"::TEXT = ANY(STRING_TO_ARRAY(p_id_listCU, ',')))
        AND (p_statutflag IS NULL OR ca."statut_flag" = p_statutflag)
        AND (p_ismain_user IS NULL OR cu."ismain_user" = p_ismain_user)
        AND (
            p_isactiveCA IS NULL
            OR (p_isactiveCA IS NOT TRUE AND (
                ca."deactivation_date" <= CURRENT_DATE 
                OR lu."deactivation_date" <= CURRENT_DATE
            ))
            OR (p_isactiveCA IS TRUE AND (
                ca."deactivation_date" > CURRENT_DATE 
                AND lu."deactivation_date" > CURRENT_DATE
            ))
        )
        AND (
            p_isactiveCU IS NULL
            OR (p_isactiveCU IS NOT TRUE AND (
                cu."deactivation_date" <= CURRENT_DATE 
                OR lu."deactivation_date" <= CURRENT_DATE
            ))
            OR (p_isactiveCU IS TRUE AND (
                cu."deactivation_date" > CURRENT_DATE 
                AND lu."deactivation_date" > CURRENT_DATE
            ))
        );
END;
$$ LANGUAGE plpgsql;


DROP PROCEDURE IF EXISTS set_op_user;
CREATE OR REPLACE PROCEDURE set_op_user(
    p_id_op_user INT,
    p_gender INT,
    p_full_name VARCHAR(96),
    p_roles INT,
    p_isadmin BOOLEAN,
    p_email VARCHAR(32),
    p_password VARCHAR(128),
    p_phone_number VARCHAR(32),
    p_mobile_number VARCHAR(12),
    p_idlogin INT
	)
AS
$$
DECLARE
    num_rows bigint;
    new_id_login INT;
BEGIN
    IF p_id_op_user IS NULL OR p_id_op_user = 0 THEN
       IF p_email IS NULL OR LENGTH(TRIM(p_email, ' '))=0 OR p_password IS NULL OR LENGTH(TRIM(p_password, ' '))=0 THEN
         RAISE EXCEPTION 'ERROR : CREDENTIALS NOT AVAILABLE';
        END IF;

 	IF p_idlogin IS NULL OR p_idlogin = 0 THEN 
           SELECT COUNT(login_user.id_login_user)
           FROM login_user
           INTO num_rows;
           IF num_rows > 0 THEN RAISE EXCEPTION 'ERROR : a login_insert is required';
           END IF;
         END IF;

		INSERT INTO login_user(
         "username",
         "pwd",
         "isadmin_login"
          ) VALUES (
         p_email,
         p_password,
         p_isadmin
         )
          RETURNING id_login_user INTO new_id_login;
           IF p_idlogin IS NULL OR p_idlogin = 0 THEN 
           p_idlogin = new_id_login;
           END IF;
		 INSERT INTO op_user(
            "id_login_user",
            "gender",
            "full_name",
            "roles",
            "email",
            "phone_number",
            "mobile_number",
            "idlogin_insert"
        ) VALUES (
            new_id_login,
            p_gender,
            p_full_name,
            p_roles,
            p_email,
            p_phone_number,
            p_mobile_number,
            p_idlogin
        );
    ELSE
     IF p_email IS NOT NULL AND LENGTH(TRIM(p_email, ' '))>0 AND p_password IS NOT NULL OR LENGTH(TRIM(p_password, ' '))>0
     THEN
        UPDATE login_user 
        SET 
            username = p_email,
            pwd = p_password 
        WHERE login_user."id_login_user" = (
            SELECT "id_login_user"
            FROM op_user
            WHERE "id_op_user" = p_id_op_user
        );
       END IF; 
     UPDATE op_user
        SET
            "gender" = p_gender,
            "full_name" = p_full_name,
            "roles" = p_roles,
            "email" = p_email,
            "phone_number" = p_phone_number,
            "mobile_number" = p_mobile_number
        WHERE "id_op_user" = p_id_op_user;
    END IF;
END;
$$ LANGUAGE plpgsql;


DROP PROCEDURE IF EXISTS set_sector;
CREATE OR REPLACE PROCEDURE set_sector(
    p_id_sector INT,
    p_symbol_fr VARCHAR(96),
    p_symbol_eng VARCHAR(96)
)
AS
$$
BEGIN
    IF p_id_sector IS NULL OR p_id_sector = 0 THEN
        INSERT INTO sector (
            "symbol_fr",
	    	"symbol_eng"
        ) VALUES (
            p_symbol_fr,
			p_symbol_eng
        );
    ELSE
        UPDATE sector
        SET
            "symbol_fr" = p_symbol_fr,
			"symbol_eng" = p_symbol_eng
        WHERE "id_sector" = p_id_sector;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP PROCEDURE IF EXISTS set_city;
CREATE OR REPLACE PROCEDURE set_city(
    p_id_city INT,
	p_id_country INT,
    p_symbol_fr VARCHAR(96),
    p_symbol_eng VARCHAR(96)
)
AS
$$
BEGIN
    IF p_id_city IS NULL OR p_id_city = 0 THEN
        INSERT INTO city (
			"id_country",
            "symbol_fr",
	    	"symbol_eng"
        ) VALUES (
			p_id_country,
            p_symbol_fr,
			p_symbol_eng
        );
    ELSE
        UPDATE city
        SET
			"id_country" = p_id_country,
            "symbol_fr" = p_symbol_fr,
			"symbol_eng" = p_symbol_eng
        WHERE "id_city" = p_id_city;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP PROCEDURE IF EXISTS set_country;
CREATE OR REPLACE PROCEDURE set_country(
	p_id_country INT,
    p_symbol_fr VARCHAR(96),
    p_symbol_eng VARCHAR(96)
)
AS
$$
BEGIN
    IF p_id_country IS NULL OR p_id_country = 0 THEN
        INSERT INTO country (
			"symbol_fr",
	    	"symbol_eng"
        ) VALUES (
			p_symbol_fr,
			p_symbol_eng
        );
    ELSE
        UPDATE country
        SET
			"symbol_fr" = p_symbol_fr,
			"symbol_eng" = p_symbol_eng
        WHERE "id_country" = p_id_country;
    END IF;
END;
$$ LANGUAGE plpgsql;


DROP FUNCTION IF EXISTS get_custaccount_info;
CREATE OR REPLACE FUNCTION get_custaccount_info(
    p_id_list TEXT,
    p_statutflag INT,
    p_isactive BOOLEAN
)
RETURNS TABLE(
    id_cust_account INT,
    legal_form VARCHAR(32),
    cust_name VARCHAR(96),
    trade_registration_num VARCHAR(32),
    in_free_zone BOOLEAN,
    identification_number VARCHAR(32),
    register_number VARCHAR(32),        -- Colonne 7
    full_address VARCHAR(160),           -- Colonne 8
    id_sector INT,
    other_sector VARCHAR(64),
    id_country INT,
    statut_flag INT,
    insertdate TIMESTAMP,
    activation_date TIMESTAMP,
    deactivation_date TIMESTAMP,
    idlogin_insert INT,
    lastmodified TIMESTAMP,
    idlogin_modify INT,
    billed_cust_name VARCHAR(96),
    bill_full_address VARCHAR(160),
    co_symbol_fr VARCHAR(64),
    co_symbol_eng VARCHAR(64),
    co_deactivation_date TIMESTAMP      -- Colonne 23
) AS
$$
BEGIN
    RETURN QUERY
    SELECT 
        ca."id_cust_account",
        ca."legal_form",
        ca."cust_name",
        ca."trade_registration_num",
        ca."in_free_zone",
        ca."identification_number",
        ca."register_number",                -- Ajouté
        ca."full_address",
        ca."id_sector",
        ca."other_sector",
        ca."id_country",
        ca."statut_flag",
        ca."insertdate",
        ca."activation_date",
        ca."deactivation_date",
        ca."idlogin_insert",
        ca."lastmodified",
        ca."idlogin_modify",
        ca."billed_cust_name",
        ca."bill_full_address",
        co."symbol_fr" as co_symbol_fr,
        co."symbol_eng" as co_symbol_eng,
        co."deactivation_date" as co_deactivation_date  -- Ajouté
    FROM
        cust_account ca
    JOIN 
        country co ON ca."id_country" = co."id_country"
    WHERE 
        (p_id_list IS NULL OR ca."id_cust_account" = ANY (string_to_array(p_id_list, ',')::INT[]))
    AND 
        (p_statutflag IS NULL OR ca."statut_flag" = p_statutflag)
    AND (
         p_isactive IS NULL
        OR (p_isactive IS NOT TRUE AND ca."deactivation_date" <= CURRENT_DATE)
        OR (p_isactive IS TRUE AND ca."deactivation_date" > CURRENT_DATE)
    );
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS get_custuser_info;
CREATE OR REPLACE FUNCTION get_custuser_info(
    p_id_listCA TEXT,
    p_statutflag INT,
    p_isactiveCA BOOLEAN,
    p_isactiveCU BOOLEAN,
    p_id_listCU TEXT,
    p_ismain_user BOOLEAN  -- if NULL, return all; if TRUE, return main users; if FALSE, return non-main users
)
RETURNS TABLE(
    id_cust_user INT,
    id_cust_account INT,
    id_login_user INT,
    gender INT,
    full_name VARCHAR(96),
    ismain_user BOOLEAN,
    email VARCHAR(32),
    phone_number VARCHAR(32),
    mobile_number VARCHAR(12),
    "position" VARCHAR(64),
    idlogin_insert INT,
    insertdate TIMESTAMP,
    deactivation_date TIMESTAMP,
    username VARCHAR(32),
    lastlogin_time TIMESTAMP
) AS
$$
BEGIN
    RETURN QUERY
    SELECT 
        cu."id_cust_user",
        cu."id_cust_account",
        cu."id_login_user",
        cu."gender",
        cu."full_name",
        cu."ismain_user",
        cu."email",
        cu."phone_number",
        cu."mobile_number",
        cu."user_position" AS "position",  -- Using user_position column and aliasing it as "position"
        cu."idlogin_insert",
        cu."insertdate",
        cu."deactivation_date",
        lu."username",
        lu."lastlogin_time"
    FROM 
        cust_user cu
    JOIN 
        login_user lu ON cu."id_login_user" = lu."id_login_user"
    JOIN 
        cust_account ca ON cu."id_cust_account" = ca."id_cust_account"
    WHERE 
        (p_id_listCA IS NULL OR ca."id_cust_account"::TEXT = ANY(STRING_TO_ARRAY(p_id_listCA, ',')))
        AND (p_id_listCU IS NULL OR cu."id_cust_user"::TEXT = ANY(STRING_TO_ARRAY(p_id_listCU, ',')))
        AND (p_statutflag IS NULL OR ca."statut_flag" = p_statutflag)
        -- If p_ismain_user is NULL, this condition is always true (i.e. return both main and non-main)
        AND (p_ismain_user IS NULL OR cu."ismain_user" = p_ismain_user)
        AND (
            p_isactiveCA IS NULL
            OR (p_isactiveCA IS NOT TRUE AND (
                ca."deactivation_date" <= CURRENT_DATE 
                OR lu."deactivation_date" <= CURRENT_DATE
            ))
            OR (p_isactiveCA IS TRUE AND (
                ca."deactivation_date" > CURRENT_DATE 
                AND lu."deactivation_date" > CURRENT_DATE
            ))
        )
        AND (
            p_isactiveCU IS NULL
            OR (p_isactiveCU IS NOT TRUE AND (
                cu."deactivation_date" <= CURRENT_DATE 
                OR lu."deactivation_date" <= CURRENT_DATE
            ))
            OR (p_isactiveCU IS TRUE AND (
                cu."deactivation_date" > CURRENT_DATE 
                AND lu."deactivation_date" > CURRENT_DATE
            ))
        );
END;
$$ LANGUAGE plpgsql;


DROP FUNCTION IF EXISTS get_country_info;
CREATE OR REPLACE FUNCTION get_country_info(id_list TEXT)
RETURNS TABLE(id_country INT, symbol_fr VARCHAR, symbol_eng VARCHAR, deactivation_date TIMESTAMP) AS
$$
BEGIN
    
    RETURN QUERY
    SELECT c."id_country", c."symbol_fr", c."symbol_eng", c."deactivation_date"
    FROM country c
    WHERE id_list is null OR c."id_country" = ANY (string_to_array(id_list, ',')::INT[]);
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS get_sector_info;
CREATE OR REPLACE FUNCTION get_sector_info(
    p_id_list TEXT
)
RETURNS TABLE(
    id_sector INT,
	symbol_fr VARCHAR(64),
	symbol_eng VARCHAR(64),
	deactivation_date TIMESTAMP
) AS
$$
BEGIN
    
    RETURN QUERY
    SELECT s."id_sector", s."symbol_fr", s."symbol_eng", s."deactivation_date"
    FROM sector s
    WHERE p_id_list is null OR s."id_sector" = ANY (string_to_array(p_id_list, ',')::INT[]);
END;
$$ LANGUAGE plpgsql;




DROP PROCEDURE IF EXISTS add_files_repo_typeof;
CREATE OR REPLACE PROCEDURE add_files_repo_typeof(
    p_id_files_repo_typeof INT,
    p_txt_description_fr VARCHAR(64),
    p_txt_description_eng VARCHAR(64),
	p_ismandatory BOOLEAN
)
AS
$$
BEGIN
    IF p_id_files_repo_typeof IS NULL OR p_id_files_repo_typeof = 0 THEN
		RAISE EXCEPTION 'typeOf invalide';
	ELSE
        INSERT INTO files_repo_typeof (
	    "id_files_repo_typeof",
        "txt_description_fr",
		"txt_description_eng",
		"ismandatory"
        ) VALUES (
			p_id_files_repo_typeof,
            p_txt_description_fr,
			p_txt_description_eng,
			p_ismandatory
        );
    END IF;
END;
$$ LANGUAGE plpgsql;


DROP PROCEDURE IF EXISTS upd_files_repo_typeof;
CREATE OR REPLACE PROCEDURE upd_files_repo_typeof(
    p_id_files_repo_typeof INT,
    p_txt_description_fr VARCHAR(64),
    p_txt_description_eng VARCHAR(64),
	p_ismandatory BOOLEAN
)
AS
$$
BEGIN
    IF p_id_files_repo_typeof IS NULL OR p_id_files_repo_typeof = 0 THEN
		RAISE EXCEPTION 'typeOf invalide';
	ELSE
        UPDATE files_repo_typeof
        SET
         "txt_description_fr" = p_txt_description_fr,
         "txt_description_eng" = p_txt_description_eng,
		 "ismandatory" = p_ismandatory
        WHERE "idfiles_repo_typeof" = p_id_files_repo_typeof;
    END IF;
END;
$$ LANGUAGE plpgsql;



DROP PROCEDURE IF EXISTS set_files_repo;
CREATE OR REPLACE PROCEDURE set_files_repo(
    p_idfiles_repo_typeof INT,
    p_file_origin_name VARCHAR(160),
    p_file_guid VARCHAR(64),
    p_file_path VARCHAR(256),
    --p_insertdate TIMESTAMP,
    p_idlogin_insert INT,
    --p_lastmodified TIMESTAMP,
    --p_idlogin_modify INT,
    --p_deactivation_date TIMESTAMP,
    INOUT p_id INT
)
LANGUAGE plpgsql
AS
$$
BEGIN
    INSERT INTO files_repo(
            idfiles_repo_typeof,
            file_origin_name,
            file_guid,
            file_path,
            --insertdate,
            idlogin_insert
            --lastmodified,
            --idlogin_modify,
            --deactivation_date
        ) VALUES (
            p_idfiles_repo_typeof,
            p_file_origin_name,
            p_file_guid,
            p_file_path,
            --p_insertdate,
            p_idlogin_insert
            --p_lastmodified,
            --p_idlogin_modify,
            --p_deactivation_date 
        ) 
	RETURNING id_files_repo INTO p_id;
END;
$$;


DROP PROCEDURE IF EXISTS del_files_repo;
CREATE OR REPLACE PROCEDURE del_files_repo(
    p_id_files_repo INT,
    p_mode INT
)
LANGUAGE plpgsql
AS
$$
BEGIN
    IF p_mode IS NULL OR p_mode = 0 THEN
        UPDATE files_repo
        SET
            deactivation_date = CURRENT_TIMESTAMP - INTERVAL '1 day'
        WHERE id_files_repo = p_id_files_repo;
    ELSE
        DELETE FROM files_repo
        WHERE id_files_repo = p_id_files_repo;
    END IF;
END;
$$;


DROP PROCEDURE IF EXISTS set_cust_account_files;
CREATE OR REPLACE PROCEDURE set_cust_account_files(
    p_id_cust_account INT,
    p_idfiles_repo_typeof INT,
    p_file_origin_name VARCHAR(160),
    p_file_guid VARCHAR(64),
    p_file_path VARCHAR(256),
    --p_insertdate TIMESTAMP,
    p_idlogin_insert INT,
    --p_lastmodified TIMESTAMP,
    --p_idlogin_modify INT,
    --p_deactivation_date TIMESTAMP,
	INOUT p_id INT
)
LANGUAGE plpgsql
AS
$$
BEGIN
    CALL set_files_repo(
        p_idfiles_repo_typeof,
        p_file_origin_name,
        p_file_guid,
        p_file_path,
        --p_insertdate,
        p_idlogin_insert,
        --p_lastmodified,
        --p_idlogin_modify,
        --p_deactivation_date,
        p_id
    );

    
    INSERT INTO CUST_ACCOUNT_FILES (ID_FILES_REPO, ID_CUST_ACCOUNT/*, DEACTIVATION_DATE*/)
    VALUES (p_id, p_id_cust_account/*, p_deactivation_date*/);

END;
$$;


DROP PROCEDURE IF EXISTS del_cust_account_files;
CREATE OR REPLACE PROCEDURE del_cust_account_files(
    p_id_cust_account_files INT,
    p_mode INT
)
LANGUAGE plpgsql
AS
$$
DECLARE
    v_id_files_repo INT;
BEGIN
    
    SELECT id_files_repo
    INTO v_id_files_repo
    FROM cust_account_files
    WHERE id_cust_account_files = p_id_cust_account_files;

    
    CALL del_files_repo(v_id_files_repo, p_mode);

    
    IF p_mode IS NULL OR p_mode = 0 THEN
        UPDATE cust_account_files
        SET
            deactivation_date = CURRENT_TIMESTAMP - INTERVAL '1 day'
        WHERE id_cust_account_files = p_id_cust_account_files;
    ELSE
        DELETE FROM cust_account_files
        WHERE id_cust_account_files = p_id_cust_account_files;
    END IF;
END;
$$;


DROP PROCEDURE IF EXISTS upd_cust_account_statut;
CREATE OR REPLACE PROCEDURE upd_cust_account_statut(
    p_id_cust_account INT,
    p_statut_flag INT,
    p_idlogin INT
)
AS
$$
BEGIN
    IF p_id_cust_account IS NULL OR p_id_cust_account = 0 THEN
        RAISE EXCEPTION 'identifiant incorrect / incorrect identifier ';
    ELSE
        UPDATE cust_account
        SET
            "statut_flag" = p_statut_flag,
            "idlogin_modify" = p_idlogin,
            "lastmodified" = NOW()
        WHERE "id_cust_account" = p_id_cust_account;
    END IF;
END;
$$ LANGUAGE plpgsql;


DROP PROCEDURE IF EXISTS add_TokenResetPwd_Settings;
CREATE OR REPLACE PROCEDURE add_TokenResetPwd_Settings(
    p_token VARCHAR(128),
    p_login VARCHAR(32),
    p_email VARCHAR(32),
    p_activation_date TIMESTAMP,
    p_deactivation_date TIMESTAMP,
    p_id INOUT INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    p_id_login_user INT;
    p_idForeign INT;
    p_id_cust_account INT;
    p_code INT := 1052;
BEGIN
    -- Vérification des paramètres
    IF p_token IS NULL OR p_login IS NULL OR p_email IS NULL THEN
        RAISE EXCEPTION 'token, login et email ne doivent pas être nuls.';
    END IF;

    -- Récupération des informations utilisateur
    SELECT 
        id_login_user, 
        idforeign, 
        id_cust_account
    INTO 
        p_id_login_user, 
        p_idForeign, 
        p_id_cust_account
    FROM 
        view_login
    WHERE 
        USERNAME = p_login 
        AND EMAIL = RTRIM(LTRIM(p_email))
        AND isavailable_user = 1
        AND isavailable_login = 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Utilisateur non trouvé ou indisponible.';
    END IF;

    -- Validation de id_cust_account avec valeur par défaut si 0
    IF p_id_cust_account = 0 THEN
        p_id_cust_account := NULL; -- Remplacez par NULL
    END IF;

    -- Récupération de l'ID de la configuration existante
    SELECT ID_GLOBAL_SETTINGS INTO p_id
    FROM GLOBAL_SETTINGS
    WHERE 
        CODE = p_code
        AND IDLOGIN = p_id_login_user
        AND FREE_FLOAT1 = p_idForeign;

    -- Insertion ou mise à jour des données
    IF p_id IS NULL THEN
        INSERT INTO GLOBAL_SETTINGS (
            FREE_TXT1, FREE_TXT2, FREE_TXT3, FREE_MEMO, FREE_FLOAT1, FREE_FLOAT2, 
            FREE_FLOAT3, FREE_DATE1, FREE_DATE2, FREE_DATE3, FREE_BIT1, FREE_BIT2, 
            CODE, IDLOGIN, ACTIVATION_DATE, DEACTIVATION_DATE,
            ID_ORDER, ID_CUST_ACCOUNT, ID_FILES_REPO
        )
        VALUES (
            p_token, NULL, NULL, NULL, p_idForeign, NULL, NULL, 
            NULL, NULL, NULL, NULL, NULL, p_code, p_id_login_user, 
            p_activation_date, p_deactivation_date, 
            NULL, p_id_cust_account, NULL
        )
        RETURNING ID_GLOBAL_SETTINGS INTO p_id;
    ELSE
        UPDATE GLOBAL_SETTINGS
        SET 
            FREE_TXT1 = p_token,
            ACTIVATION_DATE = p_activation_date,
            DEACTIVATION_DATE = p_deactivation_date,
            LASTMODIFIED = NOW()
        WHERE CODE = p_code 
          AND ID_GLOBAL_SETTINGS = p_id;
    END IF;
END;
$$;



DROP PROCEDURE IF EXISTS spChange_Credentials;
CREATE OR REPLACE PROCEDURE spChange_Credentials(
    p_login VARCHAR(32),
    p_pwd VARCHAR(128),
    p_pwd_old VARCHAR(128),
    p_id_login_user INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_login IS NULL OR p_pwd IS NULL OR p_pwd_old IS NULL OR p_id_login_user IS NULL THEN
        RAISE EXCEPTION 'Tous les paramètres doivent être fournis et ne doivent pas être vides.';
    END IF;

    IF p_login = '' OR p_pwd = '' OR p_pwd_old = '' THEN
        RAISE EXCEPTION 'Tous les paramètres doivent être non vides.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM LOGIN_USER
        WHERE ID_LOGIN_USER = p_id_login_user
          AND USERNAME = p_login
          AND PWD = p_pwd_old
          AND DEACTIVATION_DATE >= CURRENT_TIMESTAMP
    ) THEN
        RAISE EXCEPTION 'Demande non autorisée : l\utilisateur ou l\ancien mot de passe est incorrect.';
    END IF;

    UPDATE LOGIN_USER
    SET PWD = p_pwd
    WHERE ID_LOGIN_USER = p_id_login_user
      AND USERNAME = p_login
      AND PWD = p_pwd_old
      AND DEACTIVATION_DATE >= CURRENT_TIMESTAMP;

    RAISE NOTICE 'Mot de passe modifié avec succès pour l\utilisateur %', p_login;

END;
$$;

DROP PROCEDURE IF EXISTS set_ResetPwd_Settings;
CREATE OR REPLACE PROCEDURE set_ResetPwd_Settings(
    p_token VARCHAR(128),
    p_login INT,               -- Changed to INT
    p_pwd VARCHAR(128)
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_token IS NULL OR p_login IS NULL OR p_pwd IS NULL THEN
        RAISE EXCEPTION 'ERROR: Les paramètres p_token, p_login ou p_pwd ne peuvent pas être nuls';
    END IF;

    -- Verify the token is valid and retrieve associated login
    PERFORM 1 FROM GLOBAL_SETTINGS
    WHERE CODE = 1052
      AND FREE_TXT1 = p_token
      AND ACTIVATION_DATE <= CURRENT_TIMESTAMP
      AND DEACTIVATION_DATE > CURRENT_TIMESTAMP;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'ERROR: pas de token valide';
    END IF;

    -- Update the user's password
    UPDATE LOGIN_USER
    SET PWD = p_pwd
    WHERE ID_LOGIN_USER = p_login
      AND DEACTIVATION_DATE >= CURRENT_TIMESTAMP;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'ERROR: Utilisateur non trouvé ou indisponible.';
    END IF;

    -- Invalidate the token by updating DEACTIVATION_DATE
    UPDATE GLOBAL_SETTINGS
    SET DEACTIVATION_DATE = CURRENT_TIMESTAMP -- or another appropriate value
    WHERE CODE = 1052
      AND FREE_TXT1 = p_token;
END;
$$;


CALL set_sector(0, 'ALIMENTAIRE','FOODS');

CALL set_sector(0, 'INDUSTRIE','INDUSTRY');

CALL set_sector(0, 'AUTRES','OTHERS');


DO $$
DECLARE
    new_id INT;
BEGIN
    INSERT INTO COUNTRY (SYMBOL_FR, SYMBOL_ENG)
    VALUES ('REP. DE DJIBOUTI', 'REP. DE DJIBOUTI')
    RETURNING ID_COUNTRY INTO new_id;
    INSERT INTO CITY (ID_COUNTRY, SYMBOL_FR, SYMBOL_ENG)
    VALUES (new_id, 'Djibouti Ville', 'Djibouti City');
    INSERT INTO CITY (ID_COUNTRY, SYMBOL_FR, SYMBOL_ENG)
    VALUES (new_id, 'Tadjourah','Tadjourah');
END $$;

DO $$
DECLARE
    new_id INT;
BEGIN
    INSERT INTO COUNTRY (SYMBOL_FR, SYMBOL_ENG)
    VALUES ('ETHIOPIE', 'ETHIOPIA')
    RETURNING ID_COUNTRY INTO new_id;
    INSERT INTO CITY (ID_COUNTRY, SYMBOL_FR, SYMBOL_ENG)
    VALUES (new_id, 'Addis-Abeba', 'Addis-Abeba');
    INSERT INTO CITY (ID_COUNTRY, SYMBOL_FR, SYMBOL_ENG)
    VALUES (new_id, 'Dire Dawa', 'Dire Dawa');
END $$;

DO $$
DECLARE
    new_id INT;
BEGIN
    INSERT INTO COUNTRY (SYMBOL_FR, SYMBOL_ENG)
    VALUES ('Emirats arabes unis', 'United Arab Emirates')
    RETURNING ID_COUNTRY INTO new_id;
    INSERT INTO CITY (ID_COUNTRY, SYMBOL_FR, SYMBOL_ENG)
    VALUES (new_id, 'Dubai', 'Dubai');
END $$;

DROP FUNCTION IF EXISTS get_op_user;
CREATE OR REPLACE FUNCTION get_op_user(
    p_id_list TEXT,
    p_role_list TEXT,
    p_isactive BOOLEAN
)
RETURNS TABLE(
    id_op_user INT,
    id_login_user INT,
    gender INT,
    full_name VARCHAR(96),
    roles INT,
    email VARCHAR(32),
    phone_number VARCHAR(32),
    mobile_number VARCHAR(12),
    idlogin_insert INT,
    insertdate TIMESTAMP,
    deactivation_date TIMESTAMP,
    username VARCHAR(32),
    lastlogin_time TIMESTAMP
) AS
$$
BEGIN
    RETURN QUERY
    SELECT 
        ou."id_op_user",
        ou."id_login_user",
        ou."gender",
        ou."full_name",
        ou."roles",
        ou."email",
        ou."phone_number",
        ou."mobile_number",
        ou."idlogin_insert",
        ou."insertdate",
        ou."deactivation_date",
        lu."username",
        lu."lastlogin_time"
    FROM 
        op_user ou
    JOIN 
        login_user lu ON ou."id_login_user" = lu."id_login_user"
    WHERE 
        (p_id_list IS NULL OR ou."id_op_user" = ANY (string_to_array(p_id_list, ',')::INT[]))
    AND 
        (p_role_list IS NULL OR ou."roles" = ANY (string_to_array(p_role_list, ',')::INT[]))
    AND (
	     p_isactive IS NULL
        -- Si p_isactive = 0, je verifie si une des deux dates de désactivation est avant la date du jour
        OR(p_isactive IS NOT TRUE AND (
            ou."deactivation_date" <= CURRENT_DATE 
            OR lu."deactivation_date" <= CURRENT_DATE
        ))
        -- Si p_isactive = 1, je verifie que les deux dates de désactivation sont après la date du jour
        OR (p_isactive IS TRUE AND (
            ( ou."deactivation_date" > CURRENT_DATE)
            AND (lu."deactivation_date" > CURRENT_DATE)
        ))
        
    );
END;
$$ LANGUAGE plpgsql;



DROP PROCEDURE IF EXISTS set_histo_order;
CREATE OR REPLACE PROCEDURE set_histo_order(
    p_id_order INT,
    p_id_login_histo INT,
    p_order_histo_action INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_id_order IS NOT NULL THEN
        INSERT INTO HISTO_ORDER (
            ID_ORDER,
            ID_CUST_ACCOUNT,
            ORDER_TITLE,
            ID_ORDER_STATUS,
            IDLOGIN_OWNER,
            IDLOGIN_SPARE,
            DATE_OWNER,
            DATE_SPARE,
            DATE_LAST_SUBMISSION,
            DATE_LAST_RETURN,
            DATE_VALIDATION,
			INSERTDATE,
			IDLOGIN_INSERT,
			LASTMODIFIED,
			IDLOGIN_MODIFY,
			TYPEoF,
            IDLOGIN_INSERT_HISTO,
            ORDER_HISTO_ACTION
        )
        SELECT 
            o.ID_ORDER,
            o.ID_CUST_ACCOUNT,
            o.ORDER_TITLE,
            o.ID_ORDER_STATUS,
            o.IDLOGIN_OWNER,
            o.IDLOGIN_SPARE,
            o.DATE_OWNER,
            o.DATE_SPARE,
            o.DATE_LAST_SUBMISSION,
            o.DATE_LAST_RETURN,
            o.DATE_VALIDATION,
			o.INSERTDATE,
			o.IDLOGIN_INSERT,
			o.LASTMODIFIED,
			o.IDLOGIN_MODIFY,
			o.TYPEoF,
            p_id_login_histo,
            p_order_histo_action
        FROM "ORDER" o
        WHERE o.ID_ORDER = p_id_order;
    END IF;
END;
$$;


-- CREATE ORDER
---
---

DROP PROCEDURE IF EXISTS add_order;
CREATE OR REPLACE PROCEDURE add_order(
    p_id_cust_account INT,
    p_order_title VARCHAR,
    p_idlogin_insert INT,
    INOUT p_new_order_id INT
)
LANGUAGE plpgsql
AS $$
BEGIN
   
    INSERT INTO "ORDER" (
        ID_CUST_ACCOUNT,
        ORDER_TITLE,
        ID_ORDER_STATUS,
        IDLOGIN_INSERT,
        TYPEoF,
        INSERTDATE
    )
    VALUES (
        p_id_cust_account,
        p_order_title,
        1,
        p_idlogin_insert,
        0,
        NOW()
    )
    RETURNING ID_ORDER INTO p_new_order_id;

    
    CALL set_histo_order(
        p_new_order_id,
        p_idlogin_insert,
        1 
    );
END;
$$;

CREATE OR REPLACE FUNCTION add_order_wrapper(
    p_id_cust_account INT,
    p_order_title VARCHAR,
    p_idlogin_insert INT
) RETURNS INT AS $$
DECLARE
    new_order_id INT;
BEGIN
    CALL add_order(p_id_cust_account, p_order_title, p_idlogin_insert, new_order_id);
    RETURN new_order_id;
END;
$$ LANGUAGE plpgsql;


DROP FUNCTION IF EXISTS get_orderstatus_info;
CREATE OR REPLACE FUNCTION get_orderstatus_info(id_list TEXT)
RETURNS TABLE(id_order_status INT, txt_order_status_fr VARCHAR(32), txt_order_status_eng VARCHAR(32), note VARCHAR(32)) AS
$$
BEGIN
    
    RETURN QUERY
    SELECT os."id_order_status", os."txt_order_status_fr", os."txt_order_status_eng", os."note"
    FROM order_status os
    WHERE id_list is null OR os."id_order_status" = ANY (string_to_array(id_list, ',')::INT[]);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE set_order_status(
    p_id_order_status INT,
    p_txt_order_status_fr VARCHAR(32),
    p_txt_order_status_eng VARCHAR(32),
    p_note VARCHAR(32)
)
AS
$$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM order_status WHERE "id_order_status" = p_id_order_status
    ) THEN
        INSERT INTO order_status (
            "id_order_status",
            "txt_order_status_fr",
            "txt_order_status_eng",
            "note"
        ) VALUES (
            p_id_order_status,
            p_txt_order_status_fr,
            p_txt_order_status_eng,
            p_note
        );
    ELSE
        UPDATE order_status
        SET
            "txt_order_status_fr" = p_txt_order_status_fr,
            "txt_order_status_eng" = p_txt_order_status_eng,
            "note" = p_note
        WHERE "id_order_status" = p_id_order_status;
    END IF;
END;
$$ LANGUAGE plpgsql;



DROP PROCEDURE IF EXISTS set_transport_mode;
CREATE OR REPLACE PROCEDURE set_transport_mode(
    p_id_transport_mode INT,
    p_symbol_fr VARCHAR(64),
	p_symbol_eng VARCHAR (64)
)
AS
$$
BEGIN
    IF p_id_transport_mode IS NULL OR p_id_transport_mode = 0 THEN
        INSERT INTO transport_mode (
		    "symbol_fr",
            "symbol_eng"
        ) VALUES (
			p_symbol_fr,
            p_symbol_eng
        );
    ELSE
        UPDATE transport_mode
        SET
			"symbol_fr" = p_symbol_fr,
            "symbol_eng" = p_symbol_eng
        WHERE "id_transport_mode" = p_id_transport_mode;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS get_transmode_info;
CREATE OR REPLACE FUNCTION get_transmode_info(
    p_id_list TEXT,
    p_isactive BOOLEAN
)
RETURNS TABLE(
    id_transport_mode INT,
    symbol_fr VARCHAR(64),
    symbol_eng VARCHAR(64),
	deactivation_date TIMESTAMP
) AS
$$
BEGIN
    RETURN QUERY
    SELECT 
        tp."id_transport_mode",
        tp."symbol_fr",
        tp."symbol_eng",
        tp."deactivation_date"
    FROM 
        transport_mode tp
    WHERE 
        (p_id_list IS NULL OR tp."id_transport_mode" = ANY (string_to_array(p_id_list, ',')::INT[]))
    AND (
	     p_isactive IS NULL
        OR(p_isactive IS NOT TRUE AND tp."deactivation_date" <= CURRENT_DATE
        )
        OR (p_isactive IS TRUE AND tp."deactivation_date" > CURRENT_DATE
        )
    );
END;
$$ LANGUAGE plpgsql;


DROP PROCEDURE IF EXISTS set_unitweight;
CREATE OR REPLACE PROCEDURE set_unitweight(
    p_id_unit_weight INT,
    p_symbol_fr VARCHAR(64),
    p_symbol_eng VARCHAR (64)
)
AS
$$
BEGIN
    IF p_id_unit_weight IS NULL OR p_id_unit_weight = 0 THEN
        INSERT INTO unit_weight (
	    "symbol_fr",
            "symbol_eng"
        ) VALUES (
	    p_symbol_fr,
            p_symbol_eng
        );
    ELSE
        UPDATE unit_weight
        SET
	    "symbol_fr" = p_symbol_fr,
            "symbol_eng" = p_symbol_eng
        WHERE "id_unit_weight" = p_id_unit_weight;
    END IF;
END;
$$ LANGUAGE plpgsql;


DROP FUNCTION IF EXISTS get_unitweight_info;
CREATE OR REPLACE FUNCTION get_unitweight_info(
    p_id_list TEXT,
    p_isactive BOOLEAN
)
RETURNS TABLE(
    id_unit_weight INT,
    symbol_fr VARCHAR(64),
    symbol_eng VARCHAR(64),
	deactivation_date TIMESTAMP
) AS
$$
BEGIN
    RETURN QUERY
    SELECT 
        uw."id_unit_weight",
        uw."symbol_fr",
        uw."symbol_eng",
        uw."deactivation_date"
    FROM 
        unit_weight uw
    WHERE 
        (p_id_list IS NULL OR uw."id_unit_weight" = ANY (string_to_array(p_id_list, ',')::INT[]))
    AND (
	     p_isactive IS NULL
        OR(p_isactive IS NOT TRUE AND (
            uw."deactivation_date" <= CURRENT_DATE
        ))
        OR (p_isactive IS TRUE AND (
            ( uw."deactivation_date" > CURRENT_DATE)
        ))
    );
END;
$$ LANGUAGE plpgsql;


DROP FUNCTION IF EXISTS get_recipient_info;
CREATE OR REPLACE FUNCTION get_recipient_info(
    p_id_list_r TEXT,
    p_id_list_ca TEXT,
    p_isactive_r BOOLEAN,
    p_isactive_ca BOOLEAN,
    p_statut_flag_r INT,
    p_statut_flag_ca INT
)
RETURNS TABLE (
    id_recipient_account INT,
    id_cust_account INT,
    recipient_name VARCHAR(96),
    address_1 VARCHAR(160),
    address_2 VARCHAR(160),
    address_3 VARCHAR(160),
    id_city_recipient INT,
    id_country_recipient INT,
    id_country_cust INT,
    city_symbol_fr_recipient VARCHAR(64),
    city_symbol_eng_recipient VARCHAR(64),
    country_symbol_fr_recipient VARCHAR(64),
    country_symbol_eng_recipient VARCHAR(64),
    country_symbol_fr_cust VARCHAR(64),
    country_symbol_eng_cust VARCHAR(64),
    statut_flag_recipient INT,
    insertdate TIMESTAMP,
    activation_date TIMESTAMP,
    deactivation_date TIMESTAMP,
    idlogin_insert INT,
    lastmodified TIMESTAMP,
    idlogin_modify INT,
    legal_form VARCHAR(32),
    cust_name VARCHAR(96),
    trade_registration_num VARCHAR(32),
    in_free_zone BOOLEAN,
    identification_number VARCHAR(32),
    full_address VARCHAR(160)
) AS
$$
BEGIN
    RETURN QUERY
    SELECT 
        ra."id_recipient_account",
        ra."id_cust_account",
        ra."recipient_name",
        ra."address_1",
        ra."address_2",
        ra."address_3",
        ra."id_city" AS id_city_recipient,
        city_recipient."id_country" AS id_country_recipient,
        ca."id_country" AS id_country_cust,
        city_recipient."symbol_fr" AS city_symbol_fr_recipient,
        city_recipient."symbol_eng" AS city_symbol_eng_recipient,
        country_recipient."symbol_fr" AS country_symbol_fr_recipient,
        country_recipient."symbol_eng" AS country_symbol_eng_recipient,
        country_cust."symbol_fr" AS country_symbol_fr_cust,
        country_cust."symbol_eng" AS country_symbol_eng_cust,
        ra."statut_flag" AS statut_flag_recipient,
        ra."insertdate",
        ra."activation_date",
        ra."deactivation_date",
        ra."idlogin_insert",
        ra."lastmodified",
        ra."idlogin_modify",
        ca."legal_form",
        ca."cust_name",
        ca."trade_registration_num",
        ca."in_free_zone",
        ca."identification_number",
        ca."full_address"
    FROM recipient_account ra
    JOIN city city_recipient ON ra."id_city" = city_recipient."id_city"
         JOIN country country_recipient ON city_recipient."id_country" = country_recipient."id_country"
    JOIN cust_account ca ON ra."id_cust_account" = ca."id_cust_account"
         JOIN country country_cust ON ca."id_country" = country_cust."id_country"
    WHERE 
        (p_id_list_r IS NULL OR ra."id_recipient_account"::TEXT = ANY(STRING_TO_ARRAY(p_id_list_r, ',')))
        AND (p_id_list_ca IS NULL OR ca."id_cust_account"::TEXT = ANY(STRING_TO_ARRAY(p_id_list_ca, ',')))
        AND (p_statut_flag_r IS NULL OR ra."statut_flag" = p_statut_flag_r)
        AND (p_statut_flag_ca IS NULL OR ca."statut_flag" = p_statut_flag_ca)
        AND (
            p_isactive_r IS NULL
            OR (p_isactive_r IS NOT TRUE AND ra."deactivation_date" <= CURRENT_DATE)
            OR (p_isactive_r IS TRUE AND ra."deactivation_date" > CURRENT_DATE)
        )
        AND (
            p_isactive_ca IS NULL
            OR (p_isactive_ca IS NOT TRUE AND ca."deactivation_date" <= CURRENT_DATE)
            OR (p_isactive_ca IS TRUE AND ca."deactivation_date" > CURRENT_DATE)
        );
END;
$$ LANGUAGE plpgsql;

DROP PROCEDURE IF EXISTS set_recipient_account;
CREATE OR REPLACE PROCEDURE set_recipient_account(
    p_id_recipient_account INT,
    p_id_cust_account INT,
    p_recipient_name VARCHAR(96),
    p_address_1 VARCHAR(160),
    p_address_2 VARCHAR(160),
    p_address_3 VARCHAR(160),
    p_id_city INT,
    p_statut_flag INT,
    p_activation_date TIMESTAMP,
    p_deactivation_date TIMESTAMP,
    p_idlogin_insert INT,
    p_idlogin_modify INT
)
LANGUAGE plpgsql
AS
$$
BEGIN
    IF p_id_recipient_account IS NULL OR p_id_recipient_account = 0 THEN
        INSERT INTO recipient_account(
            id_cust_account,
            recipient_name,
            address_1,
            address_2,
            address_3,
            id_city,
            statut_flag,
            activation_date,
            deactivation_date,
            idlogin_insert
        ) VALUES (
            p_id_cust_account,
            p_recipient_name,
            p_address_1,
            p_address_2,
            p_address_3,
            p_id_city,
            p_statut_flag,
            p_activation_date,
            p_deactivation_date,
            p_idlogin_insert
        );
    ELSE
        UPDATE recipient_account
        SET
            id_cust_account = p_id_cust_account,
            recipient_name = p_recipient_name,
            address_1 = p_address_1,
            address_2 = p_address_2,
            address_3 = p_address_3,
            id_city = p_id_city,
            statut_flag = p_statut_flag,
            activation_date = p_activation_date,
            deactivation_date = p_deactivation_date,
            idlogin_modify = p_idlogin_modify,
            lastmodified = CURRENT_TIMESTAMP 
        WHERE id_recipient_account = p_id_recipient_account;
    END IF;
END;
$$;


CREATE OR REPLACE PROCEDURE add_certif_order(p_id_order INT, p_idlogin_modify INT)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM ORD_CERTIF_ORI
        WHERE ID_ORDER = p_id_order 
          AND DEACTIVATION_DATE >= CURRENT_TIMESTAMP
    ) THEN
        RAISE EXCEPTION 'Une certification active existe déjà pour cet ordre.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM "ORDER"
        WHERE ID_ORDER = p_id_order
          AND MOD(TYPEOF, 10) = 0
          AND ID_ORDER_STATUS IN (1, 6)
    ) THEN
        UPDATE "ORDER"
        SET LASTMODIFIED = CURRENT_TIMESTAMP,
            TYPEOF = TYPEOF + 1
        WHERE ID_ORDER = p_id_order;

        CALL set_histo_order(
            p_id_order := p_id_order,
            p_id_login_histo := p_idlogin_modify,
            p_order_histo_action := 3  -- 3 = Ajout ord_certif
        );
    ELSE
        RAISE EXCEPTION 'Les conditions de mise à jour dans la table ORDER ne sont pas respectées.';
    END IF;
END;
$$;


CREATE OR REPLACE PROCEDURE rem_certif_order(p_id_order INT, p_id_ord_certif_ori INT, p_idlogin_modify INT)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM ORD_CERTIF_ORI
        WHERE ID_ORDER = p_id_order
          AND ID_ORD_CERTIF_ORI = p_id_ord_certif_ori
          AND DEACTIVATION_DATE >= CURRENT_TIMESTAMP
    ) THEN
        RAISE EXCEPTION 'Aucune certification active trouvée pour cet ordre et cet ID de certification.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM "ORDER"
        WHERE ID_ORDER = p_id_order
          AND MOD(TYPEOF, 10) = 1  -- Le reste de TYPEOF divisé par 10 doit être 1
          AND ID_ORDER_STATUS IN (1, 6)  -- Status doit être 1 (insert) ou 6 (pending replace)
    ) THEN
        UPDATE "ORDER"
        SET LASTMODIFIED = CURRENT_TIMESTAMP,
            TYPEOF = TYPEOF - 1
        WHERE ID_ORDER = p_id_order;

        CALL set_histo_order(
            p_id_order := p_id_order,
            p_id_login_histo := p_idlogin_modify,
            p_order_histo_action := 4  -- 4 = sup. ord_certif
        );
    ELSE
        RAISE EXCEPTION 'Les conditions de mise à jour dans la table ORDER ne sont pas respectées.';
    END IF;
END;
$$;



CREATE OR REPLACE PROCEDURE add_certif(
    p_id_order INT,
    p_id_recipient_account INT,
    p_id_country_origin INT,
    p_id_country_destination INT,
    p_notes TEXT,
    p_copy_count INT,
    p_idlogin_insert INT,
    p_transport_remarks VARCHAR(160),
    INOUT p_id_ord_certif_ori INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    CALL add_certif_order(p_id_order, p_idlogin_insert);

    INSERT INTO ORD_CERTIF_ORI (
        ID_ORDER,
        ID_RECIPIENT_ACCOUNT,
        ID_COUNTRY_ORIGIN,
        ID_COUNTRY_DESTINATION,
        NOTES,
        COPY_COUNT,
        IDLOGIN_INSERT,
        INSERTDATE,
		TRANSPORT_REMARKS
    ) VALUES (
        p_id_order,
        p_id_recipient_account,
        p_id_country_origin,
        p_id_country_destination,
        p_notes,
        p_copy_count,
        p_idlogin_insert,
        CURRENT_TIMESTAMP,
		p_transport_remarks
    )
    RETURNING ID_ORD_CERTIF_ORI INTO p_id_ord_certif_ori;

END;
$$;


CREATE OR REPLACE PROCEDURE rem_certif(
    p_id_order INT,
    p_id_ord_certif_ori INT,
    p_idlogin_modify INT,
    p_mode INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    CALL rem_certif_order(p_id_order, p_id_ord_certif_ori, p_idlogin_modify);

    IF p_mode IS NULL OR p_mode = 0 THEN
        UPDATE ORD_CERTIF_ORI
        SET LASTMODIFIED = CURRENT_TIMESTAMP,
            IDLOGIN_MODIFY = p_idlogin_modify,
            DEACTIVATION_DATE = CURRENT_TIMESTAMP - INTERVAL '1 day'
        WHERE ID_ORD_CERTIF_ORI = p_id_ord_certif_ori;
    ELSE
        DELETE FROM ORD_CERTIF_ORI
        WHERE ID_ORD_CERTIF_ORI = p_id_ord_certif_ori;
    END IF;
END;
$$;

DROP FUNCTION IF EXISTS add_certif_wrapper;
CREATE OR REPLACE FUNCTION add_certif_wrapper(
    p_id_order INT,
    p_id_recipient_account INT,
    p_id_country_origin INT,
    p_id_country_destination INT,
    p_notes TEXT,
    p_copy_count INT,
    p_idlogin_insert INT,
    p_transport_remarks VARCHAR(160)
) RETURNS INT AS $$
DECLARE
    v_id_ord_certif_ori INT;
BEGIN
    -- Call the existing procedure with INOUT parameter
    CALL add_certif(
        p_id_order,
        p_id_recipient_account,
        p_id_country_origin,
        p_id_country_destination,
        p_notes,
        p_copy_count,
        p_idlogin_insert,
        p_transport_remarks,
        v_id_ord_certif_ori
    );

    -- Return the newly created certificat ID
    RETURN v_id_ord_certif_ori;
END;
$$ LANGUAGE plpgsql;

-- Drop the existing procedure and function if they exist
DROP PROCEDURE IF EXISTS set_recipient_account;
DROP FUNCTION IF EXISTS add_or_update_recipient;

-- Create the new function
CREATE OR REPLACE FUNCTION add_or_update_recipient(
    p_id_recipient_account INT,
    p_id_cust_account INT,
    p_recipient_name VARCHAR(96),
    p_address_1 VARCHAR(160),
    p_address_2 VARCHAR(160),
    p_address_3 VARCHAR(160),
    p_id_city INT,
    p_statut_flag INT,
    p_activation_date TIMESTAMP,
    p_deactivation_date TIMESTAMP,
    p_idlogin_insert INT,
    p_idlogin_modify INT
) RETURNS INT AS
$$
DECLARE
    new_id INT;
BEGIN
    IF p_id_recipient_account IS NULL OR p_id_recipient_account = 0 THEN
        -- Insert a new recipient and capture the new ID
        INSERT INTO recipient_account (
            id_cust_account,
            recipient_name,
            address_1,
            address_2,
            address_3,
            id_city,
            statut_flag,
            activation_date,
            deactivation_date,
            idlogin_insert
        ) VALUES (
            p_id_cust_account,
            p_recipient_name,
            p_address_1,
            p_address_2,
            p_address_3,
            p_id_city,
            p_statut_flag,
            p_activation_date,
            p_deactivation_date,
            p_idlogin_insert
        )
        RETURNING id_recipient_account INTO new_id;
    ELSE
        -- Update existing recipient and capture the ID
        UPDATE recipient_account
        SET
            id_cust_account = p_id_cust_account,
            recipient_name = p_recipient_name,
            address_1 = p_address_1,
            address_2 = p_address_2,
            address_3 = p_address_3,
            id_city = p_id_city,
            statut_flag = p_statut_flag,
            activation_date = p_activation_date,
            deactivation_date = p_deactivation_date,
            idlogin_modify = p_idlogin_modify,
            lastmodified = CURRENT_TIMESTAMP 
        WHERE id_recipient_account = p_id_recipient_account
        RETURNING id_recipient_account INTO new_id;
    END IF;

    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_or_update_ordcertif_goods(
    p_id_ord_certif_goods INT,
    p_id_ord_certif_ori INT,
    p_good_description VARCHAR(256),
    p_good_references VARCHAR(160),
    p_doc_references VARCHAR(256),
    p_weight_qty FLOAT,
    p_id_unit_weight INT
) RETURNS INT AS
$$
DECLARE
    new_id INT;
BEGIN
    IF p_id_ord_certif_goods IS NULL OR p_id_ord_certif_goods = 0 THEN
        -- Insert a new goods entry and capture the new ID
        INSERT INTO ord_certif_goods (
            id_ord_certif_ori,
            good_description,
            good_references,
            doc_references,
            weight_qty,
            id_unit_weight
        ) VALUES (
            p_id_ord_certif_ori,
            p_good_description,
            p_good_references,
            p_doc_references,
            p_weight_qty,
            p_id_unit_weight
        )
        RETURNING id_ord_certif_goods INTO new_id;
    ELSE
        -- Update existing goods entry and capture the ID
        UPDATE ord_certif_goods
        SET
            id_ord_certif_ori = p_id_ord_certif_ori,
            good_description = p_good_description,
            good_references = p_good_references,
            doc_references = p_doc_references,
            weight_qty = p_weight_qty,
            id_unit_weight = p_id_unit_weight
        WHERE id_ord_certif_goods = p_id_ord_certif_goods
        RETURNING id_ord_certif_goods INTO new_id;
    END IF;

    RETURN new_id;
END;
$$ LANGUAGE plpgsql;


DROP FUNCTION IF EXISTS get_order_cust_info;
CREATE OR REPLACE FUNCTION get_order_cust_info(
	p_id_order_list TEXT,
	p_id_cust_account_list TEXT,
	p_id_order_status_list TEXT,
	--p_idlogin_op INT, -- supprimée
	p_idlogin INT
)
RETURNS TABLE(
    id_order INT,
    id_cust_account INT,
    order_title VARCHAR(32),
    id_order_status INT,
	idlogin_owner INT,
	idlogin_spare INT,
	date_owner TIMESTAMP,
	date_spare TIMESTAMP,
	date_last_submission TIMESTAMP,
	date_last_return TIMESTAMP,
	date_validation_order TIMESTAMP,
	insertdate_order TIMESTAMP,
	idlogin_insert_order INT,
	lastmodified_order TIMESTAMP,
	idlogin_modify_order INT,
	typeof_order INT,
	id_ord_certif_ori INT,
	id_recipient_account INT,
	id_country_origin INT,
	id_country_destination INT,
	transport_remarks VARCHAR(160),
	notes_ori VARCHAR(256),
	copy_count_ori INT,
	equivalent_amount_ori REAL,
	insertdate_ori TIMESTAMP,
	deactivation_date_ori TIMESTAMP,
	idlogin_insert_ori INT,
	date_validation_ori TIMESTAMP,
	lastmodified_ori TIMESTAMP,
	idlogin_modify_ori INT,
	typeof_ori INT,
	recipient_name VARCHAR(96),
	address_1 VARCHAR(160),
	address_2 VARCHAR(160),
	address_3 VARCHAR(160),
	id_city INT,
	statut_flag INT,
	insertdate_recip TIMESTAMP,
	activation_date_recip TIMESTAMP,
	deactivation_date_recip TIMESTAMP,
	idlogin_insert_recip INT,
	lastmodified_recip TIMESTAMP,
	idlogin_modify INT,
	id_services_charges INT,
	description_fr VARCHAR(96),
	description_eng VARCHAR(96),
	typeof_serv INT,
	unit_price REAL,
	unit_percent REAL,
	amount_lower_limit REAL,
        amount_upper_limit REAL,
	with_tax_stamp BOOLEAN,
	unit_price_stamp REAL,
	with_copies BOOLEAN,
	unit_price_copies REAL,
	id_currency_serv INT,
	activation_date_serv TIMESTAMP,
	deactivation_date_serv TIMESTAMP,
	id_ord_legalization INT,
	notes_legali VARCHAR(256),
	copy_count_legali INT,
	equivalent_amount_legali REAL,
	insertdate_legali TIMESTAMP,
	deactivation_date_legali TIMESTAMP,
	idlogin_insert_legali INT,
	date_validation_legali TIMESTAMP,
	lastmodified_legali TIMESTAMP,
	idlogin_modify_legali INT,
	typeof_legali INT,
	id_ord_com_invoice INT,
	notes_invoice VARCHAR(256),
	copy_count_invoice INT,
	id_currency_invoice INT,
	currency_amount REAL,
	currency_rates REAL,
	equivalent_amount_invoice REAL,
	insertdate_invoice TIMESTAMP,
	deactivation_date_invoice TIMESTAMP,
	idlogin_insert_invoice INT,
	date_validation_invoice TIMESTAMP,
	lastmodified_invoice TIMESTAMP,
	idlogin_modify_invoice INT,
	typeof_invoice INT
) AS
$$
BEGIN
    RETURN QUERY
    SELECT 
        o."id_order",
        o."id_cust_account",
        o."order_title",
		o."id_order_status",
        o."idlogin_owner",
        o."idlogin_spare",
		o."date_owner",
		o."date_spare",
        o."date_last_submission",
		o."date_last_return",
		o."date_validation" as date_validation_order,
		o."insertdate" as insertdate_order,
		o."idlogin_insert" as idlogin_insert_order,
		o."lastmodified" as lastmodified_order,
		o."idlogin_modify" as idlogin_modify_order,
		o."typeof" as typeof_order,
		oco."id_ord_certif_ori",
	    r."id_recipient_account",
	    oco."id_country_origin",
	    oco."id_country_destination",
	    oco."transport_remarks",
	    oco."notes" as notes_ori,
	    oco."copy_count" as copy_count_ori,
	    oco."equivalent_amount" as equivalent_amount_ori,
	    oco."insertdate" as insertdate_ori,
	    oco."deactivation_date" as deactivation_date_ori,
	    oco."idlogin_insert" as idlogin_insert_ori,
	    oco."date_validation" as date_validation_ori,
	    oco."lastmodified" as lastmodified_ori,
	    oco."idlogin_modify" as idlogin_modify_ori,
	    oco."typeof" as typeof_ori,
		r."recipient_name",
		r."address_1",
		r."address_2",
		r."address_3",
		r."id_city",
		r."statut_flag",
		r."insertdate" as insertdate_recip,
		r."activation_date" as activation_date_recip,
		r."deactivation_date" as deactivation_date_recip,
		r."idlogin_insert" as idlogin_insert_recip,
		r."lastmodified" as lastmodified_recip,
		r."idlogin_modify" as idlogin_modify,
		sc."id_services_charges",
		sc."description_fr",
		sc."description_eng",
		sc."typeof" as typeof_serv,
		sc."unit_price",
		sc."unit_percent",
		sc."amount_lower_limit",
	    sc."amount_upper_limit",
		sc."with_tax_stamp",
		sc."unit_price_stamp",
		sc."with_copies",
		sc."unit_price_copies",
		sc."id_currency" as id_currency_serv,
		sc."activation_date" as activation_date_serv,
		sc."deactivation_date" as deactivation_date_serv,
		ol."id_ord_legalization",
		ol."notes" as notes_legali,
		ol."copy_count" as copy_count_legali,
		ol."equivalent_amount" as equivalent_amount_legali,
		ol."insertdate" as insertdate_legali,
		ol."deactivation_date" as deactivation_date_legali,
		ol."idlogin_insert" as idlogin_insert_legali,
		ol."date_validation" as date_validation_legali,
		ol."lastmodified" as lastmodified_legali,
		ol."idlogin_modify" as idlogin_modify_legali,
		ol."typeof" as typeof_legali,
		oi."id_ord_com_invoice",
		oi."notes" as notes_invoice,
		oi."copy_count" as copy_count_invoice,
		oi."id_currency" as id_currency_invoice,
		oi."currency_amount",
		oi."currency_rates",
		oi."equivalent_amount" as equivalent_amount_invoice,
		oi."insertdate" as insertdate_invoice ,
		oi."deactivation_date" as deactivation_date_invoice ,
		oi."idlogin_insert" as idlogin_insert_invoice ,
		oi."date_validation" as date_validation_invoice ,
		oi."lastmodified" as lastmodified_invoice ,
		oi."idlogin_modify" as idlogin_modify_invoice ,
		oi."typeof" as typeof_invoice
    FROM 
        "ORDER" o
        INNER JOIN 
			CUST_ACCOUNT ca ON o."id_cust_account" = ca."id_cust_account"  -- modifiée remplacer CUST_USER par CUST_ACCOUNT
			INNER JOIN 
				CUST_USER cu ON ca."id_cust_account" = cu."id_cust_account"
        INNER JOIN 
			ORDER_STATUS os ON o."id_order_status" = os."id_order_status"
        LEFT JOIN 
			ORD_CERTIF_ORI oco ON o."id_order" = oco."id_order"
        		LEFT JOIN 
					RECIPIENT_ACCOUNT r ON oco."id_recipient_account" = r."id_recipient_account"
        		LEFT JOIN 
					SERVICES_CHARGES sc ON oco."typeof" = sc."typeof"
        LEFT JOIN 
			ORD_LEGALIZATION ol ON o."id_order" = ol."id_order"
        LEFT JOIN 
			ORD_COM_INVOICE oi ON o."id_order" = oi."id_order"
    WHERE 
        (p_id_order_list IS NULL OR o."id_order" = ANY(string_to_array(p_id_order_list, ',')::INT[])) 
		AND 
		(p_id_cust_account_list IS NULL OR o."id_cust_account" = ANY(string_to_array(p_id_cust_account_list, ',')::INT[])) 
		AND 
		(p_id_order_status_list IS NULL OR o."id_order_status" = ANY(string_to_array(p_id_order_status_list, ',')::INT[]))
		AND 
		cu."id_login_user" = p_idlogin
		;
END;
$$ LANGUAGE plpgsql;



call set_op_user(0, 0, 'M. Admin', 1, TRUE,
'admin@cdd.dj','4889ba9b',
'253355445', '25377340000',
0); -- password mdp

CALL set_unitweight(1, 'Kilo', 'Kilogram');
CALL set_unitweight(2, 'Tonne', 'Tonne');
CALL set_unitweight(3, 'Mtonne', 'Megatonne');
CALL set_unitweight(4, 'Gramme', 'Gram');
CALL set_unitweight(5, 'Livre', 'Pound');
CALL set_unitweight(6, 'Once', 'Ounce');
CALL set_unitweight(7, 'Stone', 'Stone');
CALL set_unitweight(8, 'Carat', 'Carat');
CALL set_unitweight(9, 'Quintal', 'Quintal');
CALL set_unitweight(10, 'Milligramme', 'Milligram');

call set_transport_mode(0,'Route','Road');

call set_transport_mode(0,'Mer','Sea');

call set_transport_mode(0,'Train','Train');

call set_transport_mode(0,'Air','Air');

call set_transport_mode(0,'Mixte','Mixed');

call set_order_status( 1, 'insertion' ,'insert','Soumission');
call set_order_status( 2, 'nouveau' ,'new', 'Nouvelle');
call set_order_status( 3, 'approuvé' ,'approved', 'Approbation');
call set_order_status( 4, 'facturé' ,'billed', 'Facturation');
call set_order_status( 5, 'payé' ,'paid', 'Paiement');
call set_order_status( 6, 'à corriger' ,'pending replace', 'En Correction');
call set_order_status( 7, 'corrigé' ,'replaced', 'Correction');
call set_order_status( 8, 'annulé' ,'canceled', 'Annulation');
call set_order_status( 9, 'rejeté' ,'rejected', 'Refus');

CALL add_files_repo_typeof(1, 'Licence zone franche', 'Free zone license', TRUE);
CALL add_files_repo_typeof(50, 'Numéro Identification Fiscale (NIF)', 'Tax Identification Number (TIN)', TRUE);
CALL add_files_repo_typeof(51, 'Numéro Immatriculation RCS', 'Registration number', FALSE);

