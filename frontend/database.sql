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
DROP TABLE IF EXISTS ORD_CERTIF_TRANSP_MODE CASCADE;
DROP TABLE IF EXISTS ORD_LEGALIZATION CASCADE;
DROP TABLE IF EXISTS ORDER_FILES CASCADE;
DROP TABLE IF EXISTS MEMO CASCADE;
DROP TABLE IF EXISTS INVOICE_HEADER CASCADE;

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
    TRADE_REGISTRATION_NUM VARCHAR(32) NULL,  -- Non nullable
    IN_FREE_ZONE BOOLEAN DEFAULT FALSE NULL,  -- Non nullable avec valeur par défaut
    IDENTIFICATION_NUMBER VARCHAR(32) NULL,   -- nullable
    REGISTER_NUMBER VARCHAR(32) NULL,   -- nullable
    FULL_ADDRESS VARCHAR(160) NOT NULL,           -- Non nullable
    ID_SECTOR INT,
    OTHER_SECTOR VARCHAR(64), 
    ID_COUNTRY INT NOT NULL,                                  -- Non nullable  
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

    ID_COUNTRY_HEADOFFICE INT NULL,           -- nullable  
    OTHER_LEGAL_FORM VARCHAR(32) NULL,              -- nullable
    OTHER_BUSINESS_TYPE VARCHAR(96) NULL,               -- nullable

    FOREIGN KEY (ID_COUNTRY_HEADOFFICE) REFERENCES COUNTRY(ID_COUNTRY),



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
    
	
    ID_COUNTRY_PORT_LOADING INT NULL,                       -- nullable
    ID_COUNTRY_PORT_DISCHARGE INT NULL,                  -- nullable
	
	
	
	TYPEoF INT DEFAULT 1,
    FOREIGN KEY (ID_ORDER) REFERENCES "ORDER"(ID_ORDER),
    FOREIGN KEY (ID_RECIPIENT_ACCOUNT) REFERENCES RECIPIENT_ACCOUNT(ID_RECIPIENT_ACCOUNT),
    FOREIGN KEY (ID_COUNTRY_ORIGIN) REFERENCES COUNTRY(ID_COUNTRY),
    FOREIGN KEY (ID_COUNTRY_DESTINATION) REFERENCES COUNTRY(ID_COUNTRY),
    FOREIGN KEY (IDLOGIN_INSERT) REFERENCES LOGIN_USER(ID_LOGIN_USER),
    FOREIGN KEY (IDLOGIN_MODIFY) REFERENCES LOGIN_USER(ID_LOGIN_USER),

	FOREIGN KEY (ID_COUNTRY_PORT_LOADING) REFERENCES COUNTRY(ID_COUNTRY),
    FOREIGN KEY (ID_COUNTRY_PORT_DISCHARGE) REFERENCES COUNTRY(ID_COUNTRY)


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

CREATE TABLE ORDER_FILES (
    ID_ORDER_FILES INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    ID_ORDER INT NOT NULL,                       -- Non nullable
    ID_FILES_REPO INT NOT NULL,              -- Non nullable
    TYPEoF_ORDER INT DEFAULT 0 NOT NULL,
    DEACTIVATION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '100 years' NOT NULL, -- Non nullable avec valeur par défaut
    FOREIGN KEY (ID_ORDER) REFERENCES "ORDER"(ID_ORDER),
    FOREIGN KEY (ID_FILES_REPO) REFERENCES FILES_REPO(ID_FILES_REPO)
);


CREATE TABLE ORD_CERTIF_TRANSP_MODE (
    ID_ORD_CERTIF_TRANSP_MODE INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    ID_ORD_CERTIF_ORI INT NOT NULL,                 -- Non nullable
    ID_TRANSPORT_MODE INT NOT NULL,                 -- Non nullable
    DEACTIVATION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '100 years' NOT NULL, -- Non nullable avec valeur par défaut
    FOREIGN KEY (ID_ORD_CERTIF_ORI) REFERENCES ORD_CERTIF_ORI(ID_ORD_CERTIF_ORI),
    FOREIGN KEY (ID_TRANSPORT_MODE) REFERENCES TRANSPORT_MODE(ID_TRANSPORT_MODE)
);


CREATE TABLE MEMO (
    ID_MEMO INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    ID_ORDER INT NULL,                                   	 -- Nullable
    ID_CUST_ACCOUNT INT NULL,
    TYPEoF INT DEFAULT 1,
    IDLOGIN_INSERT INT NOT NULL,                         	 -- Non nullable
    MEMO_DATE TIMESTAMP NOT NULL,                        	 -- Non nullable
    INSERT_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    MEMO_SUBJECT VARCHAR(256) NOT NULL,                  	 -- Non nullable
    MEMO_BODY TEXT NOT NULL,                             	 -- Non nullable
    IDLOGIN_ACK INT NULL,                            	 -- Non nullable
    ACK_DATE TIMESTAMP NULL,                             	 -- Nullable
    MAIL_TO VARCHAR(32) NULL,                            	 -- Nullable
    MAIL_BCC VARCHAR(32) NULL,                           	 -- Nullable
    MAIL_ACC VARCHAR(32) NULL,                           	 -- Nullable
    MAIL_NOTIFICATIONS VARCHAR(64) NULL,                 	 -- Nullable
    FOREIGN KEY (ID_ORDER) REFERENCES "ORDER"(ID_ORDER),
    FOREIGN KEY (ID_CUST_ACCOUNT) REFERENCES CUST_ACCOUNT(ID_CUST_ACCOUNT),
    FOREIGN KEY (IDLOGIN_INSERT) REFERENCES LOGIN_USER(ID_LOGIN_USER), 
    FOREIGN KEY (IDLOGIN_ACK) REFERENCES LOGIN_USER(ID_LOGIN_USER)
);



CREATE TABLE INVOICE_HEADER (
    ID_INVOICE_HEADER INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    ID_ORDER INT NOT NULL,                        -- Non nullable
    INVOICE_NUMBER VARCHAR(32) NOT NULL,          -- Non nullable
    AMOUNT_ExVAT FLOAT NOT NULL,                  -- Non nullable
    AMOUNT_VAT FLOAT DEFAULT 0 NOT NULL,          -- Non nullable avec valeur par défaut
    INSERTDATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Non nullable avec valeur par défaut
    IDLOGIN_INSERT INT NOT NULL,                  -- Non nullable
    DEACTIVATION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '100 years' NOT NULL, -- Non nullable avec valeur par défaut
    PAYMENTDATE TIMESTAMP NULL,
    IDLOGIN_PAYMENT INT NULL,
    CREDITNOTE_NUMBER VARCHAR(32) NULL,           -- Nullable
    CREDITNOTE_DATE TIMESTAMP NULL,               -- Nullable
    IDLOGIN_CREDITNOTE INT NULL,
    FREE_TXT1 VARCHAR(64) NULL,                   -- Nullable
    FREE_TXT2 VARCHAR(64) NULL,                   -- Nullable
    FOREIGN KEY (ID_ORDER) REFERENCES "ORDER"(ID_ORDER),
    FOREIGN KEY (IDLOGIN_INSERT) REFERENCES LOGIN_USER(ID_LOGIN_USER),
    FOREIGN KEY (IDLOGIN_PAYMENT) REFERENCES LOGIN_USER(ID_LOGIN_USER),
    FOREIGN KEY (IDLOGIN_CREDITNOTE) REFERENCES LOGIN_USER(ID_LOGIN_USER)
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

	p_id_country_headoffice INT,	
 	p_other_legal_form VARCHAR(32),
	p_other_business_type VARCHAR(96),


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
		"bill_full_address",
		"id_country_headoffice",
		"other_legal_form",
		"other_business_type"
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
		p_bill_full_address,

		p_id_country_headoffice,	
 		p_other_legal_form,
		p_other_business_type

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
    p_bill_full_address VARCHAR(160),
	p_id_country_headoffice INT,	
 	p_other_legal_form VARCHAR(32),
	p_other_business_type VARCHAR(96)
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
            "bill_full_address" = p_bill_full_address,

			"id_country_headoffice" =p_id_country_headoffice,
			"other_legal_form"= p_other_legal_form,
			"other_business_type" =p_other_business_type

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
	register_number VARCHAR(32),
    full_address VARCHAR(160),
    id_country INT,
	id_sector INT,
	other_sector VARCHAR(64),
	statut_flag INT,
    insertdate TIMESTAMP,
	activation_date TIMESTAMP,
    deactivation_date TIMESTAMP,
    idlogin_insert INT,
	lastmodified TIMESTAMP,
	idlogin_modify INT,
	billed_cust_name VARCHAR(96),
	bill_full_address VARCHAR(160),
	co_id_country INT,
	co_symbol_eng VARCHAR(64),
	co_symbol_fr VARCHAR(64),
	co_deactivation_date TIMESTAMP,
	other_legal_form VARCHAR(32),
	other_business_type VARCHAR(96),
	co_ho_id_country INT,
	co_ho_symbol_eng VARCHAR(64),
	co_ho_symbol_fr VARCHAR(64),
	co_ho_deactivation_date TIMESTAMP
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
        ca."register_number",
        ca."full_address"::VARCHAR,  -- Cast to VARCHAR explicitly
		ca."id_country",
	    ca."id_sector",
	    ca."other_sector",
        ca."statut_flag",
        ca."insertdate",
        ca."activation_date",
        ca."deactivation_date",
	    ca."idlogin_insert",
		ca."lastmodified",
		ca."idlogin_modify",
		ca."billed_cust_name",
		ca."bill_full_address",
		co."id_country" as co_id_country,
		co."symbol_eng" as co_symbol_eng,
		co."symbol_fr" as co_symbol_fr,
		co."deactivation_date" as co_deactivation_date,
        ca."other_legal_form",
        ca."other_business_type",
		co_ho."id_country" as co_ho_id_country,
		co_ho."symbol_eng" as co_ho_symbol_eng,
		co_ho."symbol_fr" as co_ho_symbol_fr,
		co_ho."deactivation_date" as co_ho_deactivation_date
	FROM
        cust_account ca
	JOIN 
		country co ON ca."id_country" = co."id_country"
	LEFT OUTER JOIN 
		country co_ho ON ca."id_country_headoffice" = co_ho."id_country" 
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
    p_id_files_repo INT
)
LANGUAGE plpgsql
AS
$$
BEGIN
    -- mise à jour de la date de désactivation dans files_repo
    UPDATE files_repo
    SET
        deactivation_date = CURRENT_TIMESTAMP - INTERVAL '1 day'
    WHERE id_files_repo = p_id_files_repo;
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

DROP PROCEDURE IF EXISTS del_unitweight;
CREATE OR REPLACE PROCEDURE del_unitweight(
    p_id_unit_weight INT
)
AS
$$
BEGIN
    UPDATE unit_weight
    SET deactivation_date = CURRENT_TIMESTAMP
    WHERE id_unit_weight = p_id_unit_weight;
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


DROP FUNCTION IF EXISTS get_certifgoods_info;
CREATE OR REPLACE FUNCTION get_certifgoods_info(
    p_id_listCG TEXT,
    p_id_listCO TEXT,
    p_isactiveOG BOOLEAN,
    p_isactiveUW BOOLEAN,
    p_id_list_order TEXT,
    p_id_custaccount INT,
    p_id_list_orderstatus TEXT
)
RETURNS TABLE(
    id_ord_certif_goods INT,
    id_ord_certif_ori INT,
    good_description VARCHAR(256),
    good_references VARCHAR(160),
    doc_references VARCHAR(256),
    weight_qty FLOAT,
    id_unit_weight INT,
    deactivation_date TIMESTAMP,
    id_order INT,
    symbol_fr VARCHAR(64),
    symbol_eng VARCHAR(64),
    weight_deactivation_date TIMESTAMP
) AS
$$
BEGIN
    RETURN QUERY
    SELECT 
        cg."id_ord_certif_goods",
        cg."id_ord_certif_ori",
        cg."good_description",
	cg."good_references",
        cg."doc_references",
        cg."weight_qty",
        cg."id_unit_weight",
        cg."deactivation_date",
	co."id_order",
        uw."symbol_fr",
        uw."symbol_eng",
        uw."deactivation_date" as weight_deactivation_date
    FROM 
        ord_certif_goods cg
    JOIN 
        ord_certif_ori co ON cg."id_ord_certif_ori" = co."id_ord_certif_ori"		
	     JOIN
        	"ORDER" o ON o."id_order" = co."id_order"
	JOIN
		unit_weight uw ON cg."id_unit_weight" = uw."id_unit_weight"
    WHERE 
        (p_id_listCO IS NULL OR cg."id_ord_certif_ori" = ANY (string_to_array(p_id_listCO, ',')::INT[]))
    AND 
        (p_id_listCG IS NULL OR cg."id_ord_certif_goods" = ANY (string_to_array(p_id_listCG, ',')::INT[]))
    AND
        (p_id_list_order IS NULL OR o."id_order" = ANY (string_to_array(p_id_list_order, ',')::INT[]))
    AND
        (p_id_custaccount IS NULL OR o."id_cust_account" = p_id_custaccount)
    AND
        (p_id_list_orderstatus IS NULL OR o."id_order_status" = ANY (string_to_array(p_id_list_orderstatus, ',')::INT[]))
    AND (
	     p_isactiveOG IS NULL
        
        OR (p_isactiveOG IS NOT TRUE AND (
            cg."deactivation_date" <= CURRENT_DATE 
            OR co."deactivation_date" <= CURRENT_DATE
        ))
        
        OR (p_isactiveOG IS TRUE AND (
            (cg."deactivation_date" > CURRENT_DATE)
            AND (co."deactivation_date" > CURRENT_DATE)
        ))
    )
	AND (
	     p_isactiveUW IS NULL
        
        OR (p_isactiveUW IS NOT TRUE AND uw."deactivation_date" <= CURRENT_DATE)
        
        OR (p_isactiveUW IS TRUE AND uw."deactivation_date" > CURRENT_DATE)
    );
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE PROCEDURE add_certif(
    p_id_order INT,
    p_id_recipient_account INT,
    p_id_country_origin INT,
    p_id_country_destination INT,
    p_notes TEXT,
    p_copy_count INT,
    p_idlogin_insert INT,
    p_transport_remarks VARCHAR(160),

    p_id_country_port_loading INT,
    p_id_country_port_discharge INT,

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
		TRANSPORT_REMARKS,
		ID_COUNTRY_PORT_LOADING,
		ID_COUNTRY_PORT_DISCHARGE
    ) VALUES (
        p_id_order,
        p_id_recipient_account,
        p_id_country_origin,
        p_id_country_destination,
        p_notes,
        p_copy_count,
        p_idlogin_insert,
        CURRENT_TIMESTAMP,
		p_transport_remarks,
		p_id_country_port_loading,
		p_id_country_port_discharge
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
    p_transport_remarks VARCHAR(160),
    p_id_country_port_loading INT,
    p_id_country_port_discharge INT
) RETURNS INT AS $$
DECLARE
    v_id_ord_certif_ori INT;
BEGIN
    CALL add_certif(
        p_id_order,
        p_id_recipient_account,
        p_id_country_origin,
        p_id_country_destination,
        p_notes,
        p_copy_count,
        p_idlogin_insert,
        p_transport_remarks,
        p_id_country_port_loading,
        p_id_country_port_discharge,
        v_id_ord_certif_ori
    );

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


DROP FUNCTION IF EXISTS get_order_op_info;
CREATE OR REPLACE FUNCTION get_order_op_info(
    p_id_order_list TEXT,
    p_id_custaccount_list TEXT,
    p_id_orderstatus_list TEXT,
    p_idlogin INT
)
RETURNS TABLE(
    id_order INT,
    id_cust_account INT,
    cust_name VARCHAR(128),
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
    id_country_port_loading INT,
    id_country_port_discharge INT,
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
    typeof_invoice INT,
    country_symbol_fr VARCHAR(64),
    country_symbol_eng VARCHAR(64)
) AS
$$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM op_user WHERE id_login_user = p_idlogin) THEN
        RAISE EXCEPTION 'Accès refusé';
    END IF;
    
    RETURN QUERY
    SELECT 
        o."id_order",
        o."id_cust_account",
        ca."cust_name" AS cust_name,  -- Return customer name from CUST_ACCOUNT
        o."order_title",
        o."id_order_status",
        o."idlogin_owner",
        o."idlogin_spare",
        o."date_owner",
        o."date_spare",
        o."date_last_submission",
        o."date_last_return",
        o."date_validation" AS date_validation_order,
        o."insertdate" AS insertdate_order,
        o."idlogin_insert" AS idlogin_insert_order,
        o."lastmodified" AS lastmodified_order,
        o."idlogin_modify" AS idlogin_modify_order,
        o."typeof" AS typeof_order,
        oco."id_ord_certif_ori",
        r."id_recipient_account",
        oco."id_country_origin",
        oco."id_country_destination",
        oco."id_country_port_loading",
        oco."id_country_port_discharge",
        oco."transport_remarks",
        oco."notes" AS notes_ori,
        oco."copy_count" AS copy_count_ori,
        oco."equivalent_amount" AS equivalent_amount_ori,
        oco."insertdate" AS insertdate_ori,
        oco."deactivation_date" AS deactivation_date_ori,
        oco."idlogin_insert" AS idlogin_insert_ori,
        oco."date_validation" AS date_validation_ori,
        oco."lastmodified" AS lastmodified_ori,
        oco."idlogin_modify" AS idlogin_modify_ori,
        oco."typeof" AS typeof_ori,
        r."recipient_name",
        r."address_1",
        r."address_2",
        r."address_3",
        r."id_city",
        r."statut_flag",
        r."insertdate" AS insertdate_recip,
        r."activation_date" AS activation_date_recip,
        r."deactivation_date" AS deactivation_date_recip,
        r."idlogin_insert" AS idlogin_insert_recip,
        r."lastmodified" AS lastmodified_recip,
        r."idlogin_modify" AS idlogin_modify,
        sc."id_services_charges",
        sc."description_fr",
        sc."description_eng",
        sc."typeof" AS typeof_serv,
        sc."unit_price",
        sc."unit_percent",
        sc."amount_lower_limit",
        sc."amount_upper_limit",
        sc."with_tax_stamp",
        sc."unit_price_stamp",
        sc."with_copies",
        sc."unit_price_copies",
        sc."id_currency" AS id_currency_serv,
        sc."activation_date" AS activation_date_serv,
        sc."deactivation_date" AS deactivation_date_serv,
        ol."id_ord_legalization",
        ol."notes" AS notes_legali,
        ol."copy_count" AS copy_count_legali,
        ol."equivalent_amount" AS equivalent_amount_legali,
        ol."insertdate" AS insertdate_legali,
        ol."deactivation_date" AS deactivation_date_legali,
        ol."idlogin_insert" AS idlogin_insert_legali,
        ol."date_validation" AS date_validation_legali,
        ol."lastmodified" AS lastmodified_legali,
        ol."idlogin_modify" AS idlogin_modify_legali,
        ol."typeof" AS typeof_legali,
        oi."id_ord_com_invoice",
        oi."notes" AS notes_invoice,
        oi."copy_count" AS copy_count_invoice,
        oi."id_currency" AS id_currency_invoice,
        oi."currency_amount",
        oi."currency_rates",
        oi."equivalent_amount" AS equivalent_amount_invoice,
        oi."insertdate" AS insertdate_invoice,
        oi."deactivation_date" AS deactivation_date_invoice,
        oi."idlogin_insert" AS idlogin_insert_invoice,
        oi."date_validation" AS date_validation_invoice,
        oi."lastmodified" AS lastmodified_invoice,
        oi."idlogin_modify" AS idlogin_modify_invoice,
        oi."typeof" AS typeof_invoice,
        co."symbol_fr" as country_symbol_fr,
        co."symbol_eng" as country_symbol_eng
    FROM 
        "ORDER" o
        INNER JOIN CUST_ACCOUNT ca ON o."id_cust_account" = ca."id_cust_account"  -- New inner join
        INNER JOIN COUNTRY co ON ca."id_country" = co."id_country"
        INNER JOIN ORDER_STATUS os ON o."id_order_status" = os."id_order_status"
        LEFT JOIN ORD_CERTIF_ORI oco ON o."id_order" = oco."id_order"
        LEFT JOIN RECIPIENT_ACCOUNT r ON oco."id_recipient_account" = r."id_recipient_account"
        LEFT JOIN SERVICES_CHARGES sc ON o."typeof" = sc."typeof"
        LEFT JOIN ORD_LEGALIZATION ol ON o."id_order" = ol."id_order"
        LEFT JOIN ORD_COM_INVOICE oi ON o."id_order" = oi."id_order"
    WHERE
        (p_id_order_list IS NULL OR o."id_order" = ANY(string_to_array(p_id_order_list, ',')::INT[]))
        AND (p_id_custaccount_list IS NULL OR o."id_cust_account" = ANY(string_to_array(p_id_custaccount_list, ',')::INT[]))
        AND (p_id_orderstatus_list IS NULL OR o."id_order_status" = ANY(string_to_array(p_id_orderstatus_list, ',')::INT[]))
        AND (
            o."idlogin_spare" = p_idlogin 
            OR (o."idlogin_spare" IS NULL AND o."idlogin_owner" = p_idlogin)
            OR (o."idlogin_spare" IS NULL AND o."idlogin_owner" IS NULL)
        );
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
	id_country_port_loading INT,
    id_country_port_discharge INT,
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
	typeof_invoice INT,
    country_symbol_fr VARCHAR(64),
    country_symbol_eng VARCHAR(64)
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
		oco."id_country_port_loading",
		oco."id_country_port_discharge",

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
		oi."typeof" as typeof_invoice,
        co."symbol_fr" as country_symbol_fr,
        co."symbol_eng" as country_symbol_eng

    FROM 
        "ORDER" o
        INNER JOIN 
			CUST_ACCOUNT ca ON o."id_cust_account" = ca."id_cust_account"  -- modifiée remplacer CUST_USER par CUST_ACCOUNT
			INNER JOIN 
				CUST_USER cu ON ca."id_cust_account" = cu."id_cust_account"
        INNER JOIN COUNTRY co ON ca."id_country" = co."id_country"
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



DROP PROCEDURE IF EXISTS set_ordcertif_goods;
CREATE OR REPLACE PROCEDURE set_ordcertif_goods(
        p_id_ord_certif_goods INT,
        p_id_ord_certif_ori INT,
	p_good_description VARCHAR(256),
	p_good_references VARCHAR(160),
        p_doc_references VARCHAR(256),
	p_weight_qty FLOAT,
	p_id_unit_weight INT
)
AS
$$
BEGIN
    IF p_id_ord_certif_goods IS NULL OR p_id_ord_certif_goods = 0 THEN
        INSERT INTO ord_certif_goods (
		    "id_ord_certif_ori",
                    "good_description",
		    "good_references",
		    "doc_references",
		    "weight_qty",
		    "id_unit_weight"
        ) VALUES (
			p_id_ord_certif_ori,
                        p_good_description,
			p_good_references,
                        p_doc_references,
			p_weight_qty,
			p_id_unit_weight
        );
    ELSE
        UPDATE ord_certif_goods
        SET
			"id_ord_certif_ori" = p_id_ord_certif_ori,
                        "good_description" = p_good_description,
			"good_references" = p_good_references,
                        "doc_references" = p_doc_references,
			"weight_qty" = p_weight_qty,
			"id_unit_weight" = p_id_unit_weight
        WHERE "id_ord_certif_goods" = p_id_ord_certif_goods;
    END IF;
END;
$$ LANGUAGE plpgsql;


DROP FUNCTION IF EXISTS get_certiftransp_mode;
CREATE OR REPLACE FUNCTION get_certiftransp_mode(
    p_id_listCT TEXT,
    p_id_listCO TEXT,
    p_isactiveOT BOOLEAN,
    p_isactiveTM BOOLEAN,
    p_id_list_order TEXT,
    p_id_custaccount INT,
    p_id_list_orderstatus TEXT
)
RETURNS TABLE(
    id_ord_certif_transp_mode INT,
    id_ord_certif_ori INT,
    id_transport_mode INT,
    deactivation_date TIMESTAMP,
    id_order INT,
    symbol_fr VARCHAR(64),
    symbol_eng VARCHAR(64),
    tm_deactivation_date TIMESTAMP
) AS
$$
BEGIN
    RETURN QUERY
    SELECT 
        ct."id_ord_certif_transp_mode",
        ct."id_ord_certif_ori",
        ct."id_transport_mode",
        ct."deactivation_date",
	co."id_order",
        tm."symbol_fr",
        tm."symbol_eng",
        tm."deactivation_date"
    FROM 
        ord_certif_transp_mode ct
    JOIN
        ord_certif_ori co ON ct."id_ord_certif_ori" = co."id_ord_certif_ori"
		JOIN
        	"ORDER" o ON o."id_order" = co."id_order"
    JOIN
        transport_mode tm ON ct."id_transport_mode" = tm."id_transport_mode"
    WHERE 
        (p_id_listCO IS NULL OR ct."id_ord_certif_ori" = ANY (string_to_array(p_id_listCO, ',')::INT[]))
    AND 
        (p_id_listCT IS NULL OR ct."id_ord_certif_transp_mode" = ANY (string_to_array(p_id_listCT, ',')::INT[]))
    AND
        (p_id_list_order IS NULL OR o."id_order" = ANY (string_to_array(p_id_list_order, ',')::INT[]))
    AND
        (p_id_custaccount IS NULL OR o."id_cust_account" = p_id_custaccount)
    AND
        (p_id_list_orderstatus IS NULL OR o."id_order_status" = ANY (string_to_array(p_id_list_orderstatus, ',')::INT[]))
    AND (
         p_isactiveOT IS NULL
        
        OR (p_isactiveOT IS NOT TRUE AND (
            ct."deactivation_date" <= CURRENT_DATE 
            OR co."deactivation_date" <= CURRENT_DATE
        ))
        
        OR (p_isactiveOT IS TRUE AND (
            (ct."deactivation_date" > CURRENT_DATE)
            AND (co."deactivation_date" > CURRENT_DATE)
        ))
    )
    AND (
         p_isactiveTM IS NULL
        
        OR (p_isactiveTM IS NOT TRUE AND tm."deactivation_date" <= CURRENT_DATE)
        
        OR (p_isactiveTM IS TRUE AND tm."deactivation_date" > CURRENT_DATE)
    );
END;
$$ LANGUAGE plpgsql;


DROP PROCEDURE IF EXISTS add_ordcertif_transpmode;
CREATE OR REPLACE PROCEDURE add_ordcertif_transpmode(
    INOUT p_id_ord_certif_transp_mode INT,
    p_id_ord_certif_ori INT,
    p_id_transport_mode INT
)
AS
$$
BEGIN
    -- vérification si l'élément existe déjà dans la table
    IF EXISTS (
        SELECT 1 
        FROM ORD_CERTIF_TRANSP_MODE
        WHERE id_ord_certif_ori = p_id_ord_certif_ori
        AND id_transport_mode = p_id_transport_mode
        AND deactivation_date > CURRENT_DATE
    ) THEN
        -- on récuperèr l'id existant
        SELECT id_ord_certif_transp_mode
        INTO p_id_ord_certif_transp_mode
        FROM ORD_CERTIF_TRANSP_MODE
        WHERE id_ord_certif_ori = p_id_ord_certif_ori
        AND id_transport_mode = p_id_transport_mode
        AND deactivation_date > CURRENT_DATE;
    ELSE
        INSERT INTO ORD_CERTIF_TRANSP_MODE (
            "id_ord_certif_ori",
            "id_transport_mode"
        ) VALUES (
            p_id_ord_certif_ori,
            p_id_transport_mode
        )
        RETURNING id_ord_certif_transp_mode INTO p_id_ord_certif_transp_mode;  -- Retourner l'id généré
    END IF;
END;
$$ LANGUAGE plpgsql;


DROP PROCEDURE IF EXISTS cancel_order;

CREATE OR REPLACE PROCEDURE cancel_order(
    p_id_order INT,
    p_idlogin_modify INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    m_typeof_order INT := 1;
    m_id_ord_certif_ori INT;
BEGIN
--verifier si la commande peut etre annulée
    IF EXISTS (
        SELECT 1 FROM "ORDER"
        WHERE ID_ORDER = p_id_order
        AND ID_ORDER_STATUS IN (1, 6)  -- 1: insert, 6: pending replace
    ) THEN 
	-- mise a jour des champs pour les tables
        UPDATE ORD_CERTIF_ORI 
        SET 
            IDLOGIN_MODIFY = p_idlogin_modify,
            DEACTIVATION_DATE = CURRENT_TIMESTAMP - INTERVAL '1 day'
        WHERE ID_ORDER = p_id_order;

        UPDATE ORD_COM_INVOICE
        SET 
            IDLOGIN_MODIFY = p_idlogin_modify,
            DEACTIVATION_DATE = CURRENT_TIMESTAMP - INTERVAL '1 day'
        WHERE ID_ORDER = p_id_order;

        UPDATE ORD_LEGALIZATION
        SET 
            IDLOGIN_MODIFY = p_idlogin_modify,
            DEACTIVATION_DATE = CURRENT_TIMESTAMP - INTERVAL '1 day'
        WHERE ID_ORDER = p_id_order;

        SELECT ID_ORD_CERTIF_ORI INTO m_id_ord_certif_ori
        FROM ORD_CERTIF_ORI
        WHERE ID_ORDER = p_id_order
        LIMIT 1;

        CALL del_all_ordcertif_transpmode_except(m_id_ord_certif_ori, '0');
        CALL del_all_order_files_except(p_id_order, m_typeof_order, p_idlogin_modify, '0');
        CALL del_all_ordcertif_goods_except(m_id_ord_certif_ori, '0');

        UPDATE "ORDER"
        SET 
            ID_ORDER_STATUS = 8,  -- Annulé
            LASTMODIFIED = NOW(),
            IDLOGIN_MODIFY = p_idlogin_modify
        WHERE 
            ID_ORDER = p_id_order;

        CALL set_histo_order(
            p_id_order,
            p_idlogin_modify,
            15
        );

    ELSE
        RAISE EXCEPTION 'La commande ne peut être annulée que si son statut est 1 (insert) ou 6 (pending replace)';
    END IF;
END;
$$;


DROP PROCEDURE IF EXISTS reject_order;
CREATE OR REPLACE PROCEDURE reject_order(
    p_id_order INT,
    p_idlogin_modify INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    m_typeof_order INT := 1;
    m_id_ord_certif_ori INT;
BEGIN
    -- vérifier que la commande peut être rejetée
    IF EXISTS (
        SELECT 1 FROM "ORDER"
        WHERE ID_ORDER = p_id_order
        AND ID_ORDER_STATUS IN (2, 7)  -- 2: NEW, 7: replaced
        AND TYPEOF >= 1
    ) THEN
        -- mise à jour des champs pour les tables ORD_CERTIF_ORI, ORD_COM_INVOICE et ORD_LEGALIZATION
        UPDATE ORD_CERTIF_ORI
        SET 
            IDLOGIN_MODIFY = p_idlogin_modify,
            DEACTIVATION_DATE = CURRENT_TIMESTAMP - INTERVAL '1 day'
        WHERE ID_ORDER = p_id_order;

        UPDATE ORD_COM_INVOICE
        SET 
            IDLOGIN_MODIFY = p_idlogin_modify,
            DEACTIVATION_DATE = CURRENT_TIMESTAMP - INTERVAL '1 day'
        WHERE ID_ORDER = p_id_order;

        UPDATE ORD_LEGALIZATION
        SET 
            IDLOGIN_MODIFY = p_idlogin_modify,
            DEACTIVATION_DATE = CURRENT_TIMESTAMP - INTERVAL '1 day'
        WHERE ID_ORDER = p_id_order;

        SELECT ID_ORD_CERTIF_ORI INTO m_id_ord_certif_ori
        FROM ORD_CERTIF_ORI
        WHERE ID_ORDER = p_id_order
        LIMIT 1;

        CALL del_all_ordcertif_transpmode_except(m_id_ord_certif_ori, '0');
        CALL del_all_order_files_except(p_id_order, m_typeof_order, p_idlogin_modify, '0');
        CALL del_all_ordcertif_goods_except(m_id_ord_certif_ori, '0');

        -- mise à jour du statut de la commande
        UPDATE "ORDER"
        SET 
            ID_ORDER_STATUS = 9,  -- 9: Rejected
            DATE_LAST_RETURN = NOW(),
            LASTMODIFIED = NOW(),
            IDLOGIN_MODIFY = p_idlogin_modify
        WHERE 
            ID_ORDER = p_id_order;

        CALL set_histo_order(
            p_id_order,
            p_idlogin_modify,
            16  -- ACTION 16 pour 'Rejeté'
        );

    ELSE
        RAISE EXCEPTION 'La commande ne peut être rejetée que si son statut est 2 (NEW) ou 7 (replaced) et que TYPEOF >= 1';
    END IF;
END;
$$;


DROP PROCEDURE IF EXISTS rename_order;
CREATE OR REPLACE PROCEDURE rename_order(
    p_id_order INT,
    p_order_title VARCHAR,
    p_idlogin_modify INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    
    UPDATE "ORDER"
    SET
        ORDER_TITLE = p_order_title,
        LASTMODIFIED = NOW(),
        IDLOGIN_MODIFY = p_idlogin_modify
    WHERE
        ID_ORDER = p_id_order;

    
    CALL set_histo_order(
        p_id_order,
        p_idlogin_modify,
        2
    );
END;
$$;



DROP PROCEDURE IF EXISTS submit_order;

CREATE OR REPLACE PROCEDURE submit_order(
    p_id_order INT,
    p_idlogin_modify INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    m_order_status INT;
BEGIN
    -- vérifier que la commande existe et a un statut valide
    IF EXISTS (
        SELECT 1 FROM "ORDER"
        WHERE ID_ORDER = p_id_order
        AND ID_ORDER_STATUS IN (1, 6)  -- 1: insert, 6: pending replace
        AND TYPEOF >= 1
    ) THEN
        -- recupérer le statut actuel de la commande
        SELECT ID_ORDER_STATUS INTO m_order_status
        FROM "ORDER"
        WHERE ID_ORDER = p_id_order;

        -- mise a jour du statut de la commande
        UPDATE "ORDER"
        SET 
            DATE_LAST_SUBMISSION = NOW(),
            ID_ORDER_STATUS = CASE
                                WHEN ID_ORDER_STATUS != 1 THEN 7  -- si le statut actuel n'est pas 1 (insert) mais 6 (pending replace), le mettre à 7 (replaced)
                                ELSE 2  -- sinon statut  New 
                              END,
            LASTMODIFIED = NOW(),
            IDLOGIN_MODIFY = p_idlogin_modify
        WHERE 
            ID_ORDER = p_id_order;

        -- appel de la procedure set_histo_order avec l'action appropriée
        IF m_order_status = 1 THEN
            CALL set_histo_order(
                p_id_order,
                p_idlogin_modify,
                9  -- ACTION 9 pour 'Soumission'
            );
        ELSE
            CALL set_histo_order(
                p_id_order,
                p_idlogin_modify,
                17  -- ACTION 17 pour 'Ordre remplacé'
            );
        END IF;
    ELSE
        RAISE EXCEPTION 'La commande ne peut être soumise que si son statut est 1 (insert) ou 6 (pending replace) et que TYPEOF >= 1';
    END IF;
END;
$$;



DROP PROCEDURE IF EXISTS approve_order;
CREATE OR REPLACE PROCEDURE approve_order(
    p_id_order INT,
    p_idlogin_modify INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM "ORDER"
        WHERE ID_ORDER = p_id_order
        AND ID_ORDER_STATUS IN (2, 7)  -- 2: NEW, 7: replaced
        AND TYPEOF >= 1
    ) THEN
        -- mise à jour de DATE_VALIDATION dans les tables ORD_CERTIF_ORI, ORD_COM_INVOICE et ORD_LEGALIZATION
        UPDATE ORD_CERTIF_ORI
        SET DATE_VALIDATION =NOW()
        WHERE ID_ORDER = p_id_order;

        UPDATE ORD_COM_INVOICE
        SET DATE_VALIDATION = NOW()
        WHERE ID_ORDER = p_id_order;

        UPDATE ORD_LEGALIZATION
        SET DATE_VALIDATION = NOW()
        WHERE ID_ORDER = p_id_order;

        -- mise à jour du statut de la commande dans la table "ORDER"
        UPDATE "ORDER"
        SET 
            DATE_VALIDATION = NOW(),
            ID_ORDER_STATUS = 3,  -- 3: approved
            LASTMODIFIED = NOW(),
            IDLOGIN_MODIFY = p_idlogin_modify
        WHERE 
            ID_ORDER = p_id_order;

        CALL set_histo_order(
            p_id_order,
            p_idlogin_modify,
            13  -- ACTION 13 pour 'Validation/Approbation'
        );
    ELSE
        RAISE EXCEPTION 'La commande ne peut être approuvée que si son statut est 2 (NEW) ou 7 (replaced) et que TYPEOF >= 1';
    END IF;
END;
$$;



DROP PROCEDURE IF EXISTS sendback_order;
CREATE OR REPLACE PROCEDURE sendback_order(
    p_id_order INT,
    p_idlogin_modify INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM "ORDER"
        WHERE ID_ORDER = p_id_order
        AND ID_ORDER_STATUS IN (2, 7)  -- 2: NEW, 7: replaced
        AND TYPEoF >= 1
    ) THEN
        UPDATE "ORDER"
        SET 
            DATE_LAST_RETURN = NOW(),
            ID_ORDER_STATUS = 6,  -- 6: pending replace
            LASTMODIFIED = NOW(),
            IDLOGIN_MODIFY = p_idlogin_modify
        WHERE 
            ID_ORDER = p_id_order;

        CALL set_histo_order(
            p_id_order,
            p_idlogin_modify,
            12  -- ORDER_HISTO_ACTION = 12 pour 'Retourner'
        );
    ELSE
        RAISE EXCEPTION 'La commande ne peut être retournée que si son statut est 2 (NEW) ou 7 (replaced) et que TYPEoF >= 1';
    END IF;
END;
$$;

DROP PROCEDURE IF EXISTS del_all_order_files_except;

CREATE OR REPLACE PROCEDURE del_all_order_files_except (
    p_id_order INT,
    p_typeof_order INT,
    p_idlogin_insert INT,
    p_id_order_files_except_list TEXT
)
LANGUAGE plpgsql
AS
$$
DECLARE
    ids_garder INT[] := string_to_array(p_id_order_files_except_list, ',')::INT[];
BEGIN

    UPDATE files_repo
    SET deactivation_date = CURRENT_TIMESTAMP - INTERVAL '1 day'
    WHERE deactivation_date > CURRENT_DATE
      AND id_files_repo IN (
          SELECT id_files_repo 
          FROM order_files
          WHERE id_order = p_id_order 
            AND typeof_order = p_typeof_order 
            AND deactivation_date > CURRENT_DATE
            AND id_files_repo NOT IN (SELECT unnest(ids_garder))
      )
      AND id_files_repo NOT IN (SELECT unnest(ids_garder));

    UPDATE order_files
    SET deactivation_date = CURRENT_TIMESTAMP - INTERVAL '1 day'
    WHERE id_order = p_id_order 
      AND typeof_order = p_typeof_order
      AND deactivation_date > CURRENT_DATE
      AND id_files_repo NOT IN (SELECT unnest(ids_garder));

END;
$$;

DROP PROCEDURE IF EXISTS del_all_ordcertif_goods_except;
CREATE OR REPLACE PROCEDURE del_all_ordcertif_goods_except (
    p_id_ord_certif_ori  INT,
    p_id_ord_certif_ori_except_list TEXT
)
LANGUAGE plpgsql
AS
$$
DECLARE
    ids_garder INT[] := string_to_array(p_id_ord_certif_ori_except_list, ',')::INT[];

BEGIN

        UPDATE ord_certif_goods
        SET DEACTIVATION_DATE = CURRENT_TIMESTAMP - INTERVAL '1 day'
        WHERE ID_ORD_CERTIF_ORI = p_id_ord_certif_ori  AND deactivation_date > CURRENT_DATE
AND id_ord_certif_goods NOT IN (SELECT unnest(ids_garder));
END;
$$;


DROP PROCEDURE IF EXISTS del_all_ordcertif_transpmode_except;
CREATE OR REPLACE PROCEDURE del_all_ordcertif_transpmode_except (
    p_id_ord_certif_ori  INT,
    p_id_ord_certif_transp_mode_except_list TEXT
)
LANGUAGE plpgsql
AS
$$
DECLARE
    ids_garder INT[] := string_to_array(p_id_ord_certif_transp_mode_except_list, ',')::INT[];

BEGIN

        UPDATE ORD_CERTIF_TRANSP_MODE
        SET DEACTIVATION_DATE = CURRENT_TIMESTAMP - INTERVAL '1 day'
        WHERE ID_ORD_CERTIF_ORI = p_id_ord_certif_ori  AND deactivation_date > CURRENT_DATE
AND ID_ORD_CERTIF_TRANSP_MODE NOT IN (SELECT unnest(ids_garder));
END;
$$;



DROP PROCEDURE IF EXISTS upd_certif;
CREATE OR REPLACE PROCEDURE upd_certif(
    p_id_ord_certif_ori INT,
    p_id_recipient_account INT,
    p_id_country_origin INT,
    p_id_country_destination INT,
    p_id_country_port_loading INT,
    p_id_country_port_discharge INT,

    p_notes TEXT,
    p_copy_count INT,
    p_idlogin_modify INT,
    p_transport_remains VARCHAR(160)
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM ORD_CERTIF_ORI ori
        INNER JOIN "ORDER" o ON  ori.id_order = o.id_order
        WHERE ori.ID_ORD_CERTIF_ORI = p_id_ord_certif_ori 
        AND o.id_order_status IN (1, 6)
    ) THEN
        UPDATE ORD_CERTIF_ORI
        SET 
            ID_RECIPIENT_ACCOUNT = p_id_recipient_account,
            ID_COUNTRY_ORIGIN = p_id_country_origin,
            ID_COUNTRY_DESTINATION = p_id_country_destination,
			ID_COUNTRY_PORT_LOADING =    p_id_country_port_loading,
			ID_COUNTRY_PORT_DISCHARGE = p_id_country_port_discharge,

            NOTES = p_notes,
            COPY_COUNT = p_copy_count,
            IDLOGIN_MODIFY = p_idlogin_modify,
            LASTMODIFIED = CURRENT_TIMESTAMP,
            TRANSPORT_REMARKS = p_transport_remains
        WHERE ID_ORD_CERTIF_ORI = p_id_ord_certif_ori;
    ELSE
        RAISE EXCEPTION 'Certificat avec ID % introuvable', p_id_ord_certif_ori;
    END IF;
END;
$$;


DROP FUNCTION IF EXISTS get_order_files_info;
CREATE OR REPLACE FUNCTION get_order_files_info(
    p_id_order_files_list TEXT,
    p_id_order_list TEXT,
    p_id_files_repo_list TEXT,
    p_id_files_repo_typeof_list TEXT,
    p_isactive BOOLEAN,
	p_id_custaccount INT,
    p_id_list_orderstatus TEXT
)
RETURNS TABLE(
    id_order_files INT,
    id_order INT,
    order_title VARCHAR(32),
    typeof INT,
    typeof_order INT,
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
    txt_description_eng VARCHAR(64)
) AS
$$
BEGIN
    RETURN QUERY
    SELECT
        of."id_order_files",
        of."id_order",
        o."order_title",
        o."typeof",
        of."id_files_repo",
        of."typeof_order",
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
	ft."txt_description_eng"
    --TXT_DESCRIPTION_FR VARCHAR(64) NOT NULL,       -- Non nullable
    --TXT_DESCRIPTION_ENG VARCHAR(64) NOT NULL       -- Non nullable
    FROM
        order_files of
    JOIN 
        "ORDER" o ON of."id_order" = o."id_order"
    JOIN 
        files_repo fr ON of."id_files_repo" = fr."id_files_repo" 
    JOIN
        files_repo_typeof ft ON fr."idfiles_repo_typeof" = ft."id_files_repo_typeof"
    WHERE 
        (p_id_order_files_list IS NULL OR of."id_order_files" = ANY (string_to_array(p_id_order_files_list, ',')::INT[]))
    AND 
        (p_id_order_list IS NULL OR of."id_order" = ANY (string_to_array(p_id_order_list, ',')::INT[]))
    AND 
        (p_id_files_repo_list IS NULL OR of."id_files_repo" = ANY (string_to_array(p_id_files_repo_list, ',')::INT[]))
    AND 
        (p_id_files_repo_typeof_list IS NULL OR fr."idfiles_repo_typeof" = ANY (string_to_array(p_id_files_repo_typeof_list, ',')::INT[]))
    AND
        (p_id_custaccount IS NULL OR o."id_cust_account" = p_id_custaccount)
    AND
        (p_id_list_orderstatus IS NULL OR o."id_order_status" = ANY (string_to_array(p_id_list_orderstatus, ',')::INT[]))
    AND (
        p_isactive IS NULL
        OR (p_isactive IS NOT TRUE AND of."deactivation_date" <= CURRENT_DATE)
        OR (p_isactive IS TRUE AND of."deactivation_date" > CURRENT_DATE)
    );
END;
$$ LANGUAGE plpgsql;

DROP PROCEDURE IF EXISTS set_order_files;

CREATE OR REPLACE PROCEDURE set_order_files(
    p_id_order INT,
    p_idfiles_repo_typeof INT,
    p_file_origin_name VARCHAR(160),
    p_file_guid VARCHAR(64),
    p_file_path VARCHAR(256),
    p_typeof_order INT,
    p_idlogin_insert INT,
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
        p_idlogin_insert,
        p_id
    );

    -- vérification de l'existence de l'élément dans ORDER_FILES avant insertion
    IF NOT EXISTS (
        SELECT 1
        FROM ORDER_FILES
        WHERE id_files_repo = p_id
        AND deactivation_date > CURRENT_DATE
    ) THEN
        -- si l'élément n'existe pas, on insère l'entrée dans ORDER_FILES
        INSERT INTO ORDER_FILES (ID_FILES_REPO, ID_ORDER, TYPEoF_ORDER)
        VALUES (p_id, p_id_order, p_typeof_order);
    END IF;

END;
$$;



DROP PROCEDURE IF EXISTS del_order_files;

CREATE OR REPLACE PROCEDURE del_order_files(
    p_id_order_files INT
)
LANGUAGE plpgsql
AS
$$
DECLARE
    v_id_files_repo INT;
BEGIN
    -- récupérer l'ID du fichier dans la table files_repo
    SELECT id_files_repo
    INTO v_id_files_repo
    FROM order_files
    WHERE id_order_files = p_id_order_files;

    -- appel de la procédure pour désactiver l'entrée dans files_repo
    CALL del_files_repo(v_id_files_repo);

    -- mise à jour de la date de désactivation dans order_files
    UPDATE order_files
    SET
        deactivation_date = CURRENT_TIMESTAMP - INTERVAL '1 day'
    WHERE id_order_files = p_id_order_files;
END;
$$;



DROP PROCEDURE IF EXISTS rem_ordcertif_transpmode;
CREATE OR REPLACE PROCEDURE rem_ordcertif_transpmode(
    p_id_ord_certif_ori INT,
    p_idlogin_modify INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM ord_certif_transp_mode
    WHERE id_ord_certif_ori = p_id_ord_certif_ori;

    UPDATE ord_certif_ori
    SET lastmodified = CURRENT_TIMESTAMP,
        idlogin_modify = p_idlogin_modify
    WHERE id_ord_certif_ori = p_id_ord_certif_ori;
END;
$$;

DROP PROCEDURE IF EXISTS rem_ordcertif_goods;
CREATE OR REPLACE PROCEDURE rem_ordcertif_goods(
    p_id_ord_certif_goods INT,
    p_idlogin_modify INT,
    p_mode INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_mode IS NULL OR p_mode = 0 THEN
        UPDATE ord_certif_goods
        SET
            deactivation_date = CURRENT_TIMESTAMP - INTERVAL '1 day'
        WHERE id_ord_certif_goods = p_id_ord_certif_goods;
    END IF;
END;
$$;



DROP PROCEDURE IF EXISTS submit_order;

CREATE OR REPLACE PROCEDURE submit_order(
    p_id_order INT,
    p_idlogin_modify INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    m_order_status INT;
BEGIN
    -- vérifier que la commande existe et a un statut valide
    IF EXISTS (
        SELECT 1 FROM "ORDER"
        WHERE ID_ORDER = p_id_order
        AND ID_ORDER_STATUS IN (1, 6)  -- 1: insert, 6: pending replace
        AND TYPEOF >= 1
    ) THEN
        -- recupérer le statut actuel de la commande
        SELECT ID_ORDER_STATUS INTO m_order_status
        FROM "ORDER"
        WHERE ID_ORDER = p_id_order;

        -- mise a jour du statut de la commande
        UPDATE "ORDER"
        SET 
            DATE_LAST_SUBMISSION = NOW(),
            ID_ORDER_STATUS = CASE
                                WHEN ID_ORDER_STATUS != 1 THEN 7  -- si le statut actuel n'est pas 1 (insert) mais 6 (pending replace), le mettre à 7 (replaced)
                                ELSE 2  -- sinon statut  New 
                              END,
            LASTMODIFIED = NOW(),
            IDLOGIN_MODIFY = p_idlogin_modify
        WHERE 
            ID_ORDER = p_id_order;

        -- appel de la procedure set_histo_order avec l'action appropriée
        IF m_order_status = 1 THEN
            CALL set_histo_order(
                p_id_order,
                p_idlogin_modify,
                9  -- ACTION 9 pour 'Soumission'
            );
        ELSE
            CALL set_histo_order(
                p_id_order,
                p_idlogin_modify,
                17  -- ACTION 17 pour 'Ordre remplacé'
            );
        END IF;
    ELSE
        RAISE EXCEPTION 'La commande ne peut être soumise que si son statut est 1 (insert) ou 6 (pending replace) et que TYPEOF >= 1';
    END IF;
END;
$$;

DROP PROCEDURE IF EXISTS ack_memo_ope;
CREATE OR REPLACE PROCEDURE ack_memo_ope(
    p_id_memo INT,
    p_idlogin INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    m_typeof_order INT := 1;
    m_id_ord_certif_ori INT;
BEGIN

    IF NOT EXISTS (
        SELECT 1 FROM OP_USER op  
		JOIN LOGIN_USER lo ON lo.ID_LOGIN_USER = op.ID_LOGIN_USER
		WHERE op.ID_LOGIN_USER = p_idlogin
		AND op."deactivation_date" > CURRENT_DATE AND lo."deactivation_date" > CURRENT_DATE
    ) THEN 
        RAISE EXCEPTION 'login rejeté.';
    END IF;

   --verifier si le memo est en attente d'ack
    IF EXISTS (
        SELECT 1 FROM "memo" me  WHERE id_memo = p_id_memo
		and me.typeof =2
		AND me.IDLOGIN_ACK is null and me.ACK_DATE is null

    ) THEN 
	-- mise a jour des champs pour les tables
        UPDATE "memo" 
        SET 
            IDLOGIN_ACK = p_idlogin,
            ACK_DATE = CURRENT_TIMESTAMP 
         WHERE id_memo = p_id_memo;

    ELSE
        RAISE EXCEPTION 'Ce memo introuvable ne peut être acquitter ';
    END IF;
END;
$$;

DROP PROCEDURE IF EXISTS ack_memo_cust;
CREATE OR REPLACE PROCEDURE ack_memo_cust(
    p_id_memo INT,
	p_id_cust_account int,
    p_idlogin INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    m_typeof_order INT := 1;
    m_id_ord_certif_ori INT;
BEGIN
--verifier si le memo est en attente d'ack
    IF EXISTS (
        SELECT 1 FROM "memo" me 
		JOIN 
			cust_account ca ON me."id_cust_account" = ca."id_cust_account"
		JOIN
			CUST_USER cu ON ca.ID_CUST_ACCOUNT = cu.ID_CUST_ACCOUNT

        WHERE id_memo = p_id_memo
		and me.id_cust_account =p_id_cust_account
        AND cu.ID_LOGIN_USER  = p_idlogin
		and me.typeof =1
		AND me.IDLOGIN_ACK is null and me.ACK_DATE is null

    ) THEN 
	-- mise a jour des champs pour les tables
        UPDATE "memo" 
        SET 
            IDLOGIN_ACK = p_idlogin,
            ACK_DATE = CURRENT_TIMESTAMP 
         WHERE id_memo = p_id_memo;

    ELSE
        RAISE EXCEPTION 'Ce memo introuvable ne peut être acquitter ';
    END IF;
END;
$$;


DROP FUNCTION IF EXISTS get_memo_files; 
CREATE OR REPLACE FUNCTION get_memo_files(
    p_id_memo_files_list TEXT,
    p_id_memo_list TEXT,
	p_id_files_repo_list TEXT,
	p_code_list TEXT,
    p_isactive BOOLEAN
)
RETURNS TABLE(
    id_memo_files INT,
    id_memo INT,
	memo_subject VARCHAR(256),
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
	txt_description_eng VARCHAR(64)

) AS
$$
BEGIN
    RETURN QUERY
    SELECT
		mf."id_memo_files",
	    mf."id_memo",
		me."memo_subject",
		mf."id_files_repo",
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
		ft."txt_description_eng"
	FROM
        memo_files mf
	JOIN 
		memo me ON mf."id_memo" = me."id_memo"
	JOIN 
		files_repo fr ON mf."id_files_repo" = fr."id_files_repo" 
		JOIN
			files_repo_typeof ft ON fr."idfiles_repo_typeof" = ft."id_files_repo_typeof"
    WHERE 
        (p_id_memo_files_list IS NULL OR mf."id_memo_files" = ANY (string_to_array(p_id_memo_files_list, ',')::INT[]))
    AND 
		(p_id_memo_list IS NULL OR mf."id_memo" = ANY(string_to_array(p_id_memo_list, ',')::INT[]))
	AND 
        (p_id_files_repo_list IS NULL OR mf."id_files_repo" = ANY(string_to_array(p_id_files_repo_list, ',')::INT[]))
    AND 
		(p_code_list IS NULL OR ft."code" = ANY(string_to_array(p_code_list, ',')::INT[]))
	
	AND (
	     p_isactive IS NULL
        -- Si p_isactive = 0, je verifie si une des deux dates de désactivation est avant la date du jour
        OR(p_isactive IS NOT TRUE AND mf."deactivation_date" <= CURRENT_DATE 
            
        )
        -- Si p_isactive = 1, je verifie que les deux dates de désactivation sont après la date du jour
        OR (p_isactive IS TRUE AND mf."deactivation_date" > CURRENT_DATE
            
        )
    );
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS get_memo;
CREATE OR REPLACE FUNCTION get_memo(
    p_id_memo_list TEXT,
    p_id_order_list TEXT,
    p_typeof_list TEXT,
    p_id_cust_account INT,
    p_memo_date_start TIMESTAMP,
    p_memo_date_end TIMESTAMP,
    p_isAck BOOLEAN,
    p_idlogin INT,
    p_isopuser BOOLEAN -- si false, utiliser id_cust_account dans le jeton de cust_user connecté et typeof = 2, sinon typeof = 1
)
RETURNS TABLE(
    id_memo INT,
    id_order INT,
    id_cust_account INT,
	cust_name VARCHAR(96),
	order_title VARCHAR(32),
    typeof INT,
    idlogin_insert INT,
    memo_date TIMESTAMP,
    memo_subject VARCHAR(256),
    memo_body TEXT,
    idlogin_ack INT,
    ack_date TIMESTAMP,
    mail_to VARCHAR(32),
    mail_bcc VARCHAR(32),
    mail_acc VARCHAR(32),
    mail_notifications VARCHAR(64)
) AS
$$
BEGIN
    -- Vérification si p_isopuser est TRUE
    IF p_isopuser THEN
        -- Vérifier si p_idlogin existe dans op_user
        IF NOT EXISTS (SELECT 1 FROM op_user WHERE "id_login_user" = p_idlogin) THEN
            RAISE EXCEPTION 'Utilisateur non autorisé';
        END IF;
    END IF;

    RETURN QUERY
    SELECT
        me."id_memo",
        me."id_order",
        me."id_cust_account",
		ca."cust_name",
		o."order_title",
        me."typeof",
        me."idlogin_insert",
        me."memo_date",
        me."memo_subject",
        me."memo_body",
        me."idlogin_ack",
        me."ack_date",
        me."mail_to",
        me."mail_bcc",
        me."mail_acc",
        me."mail_notifications"
   FROM
        memo me
    JOIN 
        cust_account ca ON me."id_cust_account" = ca."id_cust_account"
    JOIN 
        "ORDER" o ON me."id_order" = o."id_order" 
    JOIN
        login_user lu ON me."idlogin_insert" = lu."id_login_user"
    WHERE 
        (p_id_memo_list IS NULL OR me."id_memo" = ANY (string_to_array(p_id_memo_list, ',')::INT[]))
    AND 
        (p_id_order_list IS NULL OR me."id_order" = ANY (string_to_array(p_id_order_list, ',')::INT[]))
    AND 
        (p_typeof_list IS NULL OR me."typeof" = ANY (string_to_array(p_typeof_list, ',')::INT[]))
    AND 
        (p_memo_date_start IS NULL OR me."memo_date" >= p_memo_date_start)
    AND 
        (p_memo_date_end IS NULL OR me."memo_date" <= p_memo_date_end)
    AND (
        p_isAck IS NULL 
        OR (p_isAck IS NOT TRUE AND me."ack_date" IS NULL)
        OR (p_isAck IS TRUE AND me."ack_date" IS NOT NULL)
    )
    AND 
    (
        -- Si p_isopuser est FALSE, filtrer sur id_cust_account et typeof = p_type
        p_isopuser IS TRUE 
        OR (p_isopuser IS NOT TRUE AND me."id_cust_account" = p_id_cust_account)
    );
END;
$$ LANGUAGE plpgsql;



DROP PROCEDURE IF EXISTS set_memo;
CREATE OR REPLACE PROCEDURE set_memo(
    p_id_order INT,
    p_id_cust_account INT,
    p_typeof INT,
    p_idlogin_insert INT,
	p_memo_date TIMESTAMP, 
	p_memo_subject  VARCHAR(256),
	p_memo_body  TEXT,
	p_mail_to  VARCHAR(32),
	p_mail_bcc VARCHAR(32),
	p_mail_acc  VARCHAR(32),
	p_mail_notifications  VARCHAR(32),

	INOUT p_id INT 
)
LANGUAGE plpgsql
AS
$$
BEGIN
    INSERT INTO memo(
            id_order,
            id_cust_account,
            typeof,
            idlogin_insert,
			memo_date,
			memo_subject,
			memo_body,
			mail_to,
			mail_bcc,
			mail_acc,
			mail_notifications
        ) VALUES (
            p_id_order,
		    p_id_cust_account,
		    p_typeof,
		    p_idlogin_insert,
			p_memo_date,
			p_memo_subject,
			p_memo_body,
			p_mail_to,
			p_mail_bcc,
			p_mail_acc,
			p_mail_notifications
        )
	RETURNING id_memo INTO p_id;
END;
$$;


DROP PROCEDURE IF EXISTS set_memo_files;
CREATE OR REPLACE PROCEDURE set_memo_files(
    p_id_memo INT,
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

    
    INSERT INTO MEMO_FILES (ID_FILES_REPO, ID_MEMO/*, DEACTIVATION_DATE*/)
    VALUES (p_id, p_id_memo/*, p_deactivation_date*/);

END;
$$;


DROP FUNCTION IF EXISTS wrapper_set_memo;
CREATE OR REPLACE FUNCTION wrapper_set_memo(
    p_id_order INT,
    p_id_cust_account INT,
    p_typeof INT,
    p_idlogin_insert INT,
    p_memo_date TIMESTAMP, 
    p_memo_subject  VARCHAR(256),
    p_memo_body  TEXT,
    p_mail_to  VARCHAR(32),
    p_mail_bcc VARCHAR(32),
    p_mail_acc  VARCHAR(32),
    p_mail_notifications  VARCHAR(32)
)
RETURNS INT
LANGUAGE plpgsql
AS
$$
DECLARE
    new_memo_id INT;
BEGIN
    INSERT INTO memo(
            id_order,
            id_cust_account,
            typeof,
            idlogin_insert,
            memo_date,
            memo_subject,
            memo_body,
            mail_to,
            mail_bcc,
            mail_acc,
            mail_notifications
        ) VALUES (
            p_id_order,
            p_id_cust_account,
            p_typeof,
            p_idlogin_insert,
            p_memo_date,
            p_memo_subject,
            p_memo_body,
            p_mail_to,
            p_mail_bcc,
            p_mail_acc,
            p_mail_notifications
        )
    RETURNING id_memo INTO new_memo_id;

    RETURN new_memo_id;
END;
$$;

DROP FUNCTION IF EXISTS fn_set_memo;
CREATE OR REPLACE FUNCTION fn_set_memo(
    p_id_order INT,
    p_id_cust_account INT,
    p_typeof INT,
    p_idlogin_insert INT,
    p_memo_date TIMESTAMP, 
    p_memo_subject  VARCHAR(256),
    p_memo_body  TEXT,
    p_mail_to  VARCHAR(32),
    p_mail_bcc VARCHAR(32),
    p_mail_acc  VARCHAR(32),
    p_mail_notifications  VARCHAR(32)
)
RETURNS INT
LANGUAGE plpgsql
AS
$$
DECLARE
    new_memo_id INT;
BEGIN
    INSERT INTO memo(
            id_order,
            id_cust_account,
            typeof,
            idlogin_insert,
            memo_date,
            memo_subject,
            memo_body,
            mail_to,
            mail_bcc,
            mail_acc,
            mail_notifications
        )
    VALUES (
            p_id_order,
            p_id_cust_account,
            p_typeof,
            p_idlogin_insert,
            p_memo_date,
            p_memo_subject,
            p_memo_body,
            p_mail_to,
            p_mail_bcc,
            p_mail_acc,
            p_mail_notifications
        )
    RETURNING id_memo INTO new_memo_id;

    RETURN new_memo_id;
END;
$$;

DROP FUNCTION IF EXISTS get_order_statics_byservices;
CREATE OR REPLACE FUNCTION get_order_statics_byservices(
    p_date_start TIMESTAMP,
    p_date_end TIMESTAMP,
    p_id_list_order TEXT,
    p_id_custaccount INT,
    p_id_list_orderstatus TEXT
)
RETURNS TABLE(
    count_ord_certif_ori BIGINT,
    count_ord_legalization BIGINT,
    count_ord_com_invoice BIGINT
) AS
$$
BEGIN
    RETURN QUERY
    SELECT 
        SUM(CASE WHEN MOD(o.TYPEOF, 10) = 1 THEN 1 ELSE 0 END) AS count_ord_certif_ori,
        SUM(CASE 
              WHEN MOD(o.TYPEOF/10, 100) = 1 
                OR MOD(o.TYPEOF/10, 100) = 11 
              THEN 1 ELSE 0 END) AS count_ord_legalization,
        SUM(CASE WHEN MOD(o.TYPEOF/100, 1000) = 1 THEN 1 ELSE 0 END) AS count_ord_com_invoice
    FROM "ORDER" o
    WHERE 
        (p_id_list_order IS NULL OR o."id_order" = ANY (string_to_array(p_id_list_order, ',')::INT[]))
        AND (p_id_custaccount IS NULL OR o."id_cust_account" = p_id_custaccount)
        AND (p_id_list_orderstatus IS NULL OR o."id_order_status" = ANY (string_to_array(p_id_list_orderstatus, ',')::INT[]))
        AND (p_date_start IS NULL OR o."insertdate" >= p_date_start)
        AND (p_date_end IS NULL OR o."insertdate" <= p_date_end);
END;
$$ LANGUAGE plpgsql;


DROP PROCEDURE IF EXISTS bill_order;
CREATE OR REPLACE PROCEDURE bill_order(
    p_id_order INT,
    p_idlogin_modify INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM "ORDER"
        WHERE ID_ORDER = p_id_order
        AND ID_ORDER_STATUS IN (3)  -- 3: approuvé
        AND TYPEoF >= 1
    ) THEN
        UPDATE "ORDER"
        SET 
            DATE_LAST_RETURN = NOW(),
            ID_ORDER_STATUS = 4,  -- 4: billed
            LASTMODIFIED = NOW(),
            IDLOGIN_MODIFY = p_idlogin_modify
        WHERE 
            ID_ORDER = p_id_order;

        CALL set_histo_order(
            p_id_order,
            p_idlogin_modify,
            18  -- ORDER_HISTO_ACTION = 18 pour 'Ordre Facturé'
        );
    ELSE
        RAISE EXCEPTION 'La commande ne peut être facturée que si son statut est 3 (APPROVED) et que TYPEoF >= 1';
    END IF;
END;
$$;

DROP PROCEDURE IF EXISTS pay_order;
CREATE OR REPLACE PROCEDURE pay_order(
    p_id_order INT,
    p_idlogin_modify INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM "ORDER"
        WHERE ID_ORDER = p_id_order
        AND ID_ORDER_STATUS IN (4)  -- 4: billed
        AND TYPEoF >= 1
    ) THEN
        UPDATE "ORDER"
        SET 
            DATE_LAST_RETURN = NOW(),
            ID_ORDER_STATUS = 5,  -- 5: paid
            LASTMODIFIED = NOW(),
            IDLOGIN_MODIFY = p_idlogin_modify
        WHERE 
            ID_ORDER = p_id_order;

        CALL set_histo_order(
            p_id_order,
            p_idlogin_modify,
            14  -- ORDER_HISTO_ACTION = 14 pour 'Ordre Payé'
        );
    ELSE
        RAISE EXCEPTION 'La commande ne peut être payée que si son statut est 4 (BILLED) et que TYPEoF >= 1';
    END IF;
END;
$$;
DROP PROCEDURE IF EXISTS set_invoice_header;
CREATE OR REPLACE PROCEDURE set_invoice_header(
    p_id_order INT,
    p_invoice_number VARCHAR(32),
    p_amount_exVat FLOAT,
    p_amount_Vat FLOAT,
    p_idlogin_insert INT,
    p_paymentDate TIMESTAMP,
    p_free_txt1 VARCHAR(64),
    p_free_txt2 VARCHAR(64),
    p_idlogin_modify INT, -- NEW: added parameter for modifying login
    INOUT p_id INT
)
LANGUAGE plpgsql
AS
$$
BEGIN
    -- Check if an active invoice header already exists
    IF NOT EXISTS (
        SELECT 1
        FROM INVOICE_HEADER
        WHERE ID_INVOICE_HEADER = p_id
          AND DEACTIVATION_DATE > CURRENT_DATE
    ) THEN
        INSERT INTO INVOICE_HEADER (
            ID_ORDER,
            INVOICE_NUMBER,
            AMOUNT_ExVAT,
            AMOUNT_VAT,
            IDLOGIN_INSERT,
            PAYMENTDATE,
            IDLOGIN_PAYMENT,
            FREE_TXT1,
            FREE_TXT2
        )
        VALUES (
            p_id_order,
            p_invoice_number,
            p_amount_exVat,
            p_amount_Vat,
            p_idlogin_insert,
            p_paymentDate,
            p_idlogin_modify,  -- use the new parameter here
            p_free_txt1,
            p_free_txt2
        );
    END IF;

    -- Call another procedure (assumed to handle further payment processing)
    CALL pay_order(
        p_id_order,
        p_idlogin_modify
    );
END;
$$;


DROP FUNCTION IF EXISTS get_invoice_header;
CREATE OR REPLACE FUNCTION get_invoice_header(
    p_id_invoice_header_list TEXT,
    p_id_order_list TEXT,
    p_id_cust_account INT,
    p_payment_date_start TIMESTAMP,
    p_payment_date_end TIMESTAMP,
    p_idlogin INT,
    p_isopuser BOOLEAN -- si false, utiliser id_cust_account dans le jeton de cust_user connecté
)
RETURNS TABLE(
    id_invoice_header INT,
    id_order INT,
    id_cust_account INT,
	cust_name VARCHAR(96),
	recipient_name VARCHAR(96),
	order_title VARCHAR(32),

    invoice_number VARCHAR(32),
    amount_exVat FLOAT,
    amount_Vat FLOAT,
    paymentDate TIMESTAMP,
    free_txt1 VARCHAR(64),
    free_txt2 VARCHAR(64),

    idlogin_insert INT


) AS
$$
BEGIN
    -- Vérification si p_isopuser est TRUE
    IF p_isopuser THEN
        -- Vérifier si p_idlogin existe dans op_user
        IF NOT EXISTS (SELECT 1 FROM op_user WHERE "id_login_user" = p_idlogin) THEN
            RAISE EXCEPTION 'Utilisateur non autorisé';
        END IF;
    END IF;

    RETURN QUERY
    SELECT
    	ih."id_invoice_header",
    	ih."id_order",

        ca."id_cust_account",
		ca."cust_name",
		r."recipient_name",
		o."order_title",

    	ih."invoice_",
    	ih."amount_exVat",
    	ih."amount_Vat",
    	ih."paymentDate",
    	ih."free_txt1",
    	ih."free_txt2",

        ih."idlogin_insert"


   FROM
        INVOICE_HEADER ih
    JOIN 
        "ORDER" o ON ih."id_order" = o."id_order" 
    JOIN 
        cust_account ca ON o."id_cust_account" = ca."id_cust_account"
    JOIN 
        "RECIPIENT_ACCOUNT" r ON r."id_cust_account" = ca."id_cust_account" 
    JOIN
        login_user lu ON ih."idlogin_insert" = lu."id_login_user"
    WHERE 
        (p_id_invoice_header_list IS NULL OR mih."ID_INVOICE_HEADER" = ANY (string_to_array(p_id_invoice_header_list, ',')::INT[]))
    AND 
        (p_id_order_list IS NULL OR ih."id_order" = ANY (string_to_array(p_id_order_list, ',')::INT[]))
    AND 
        (p_payment_date_start IS NULL OR ih."PAYMENTDATE" >= p_payment_date_start)
    AND 
        (p_payment_date_end IS NULL OR ih."PAYMENTDATE" <= p_payment_date_end)
    AND 
    (
        -- Si p_isopuser est FALSE, filtrer sur id_cust_account et typeof = p_type
        p_isopuser IS TRUE 
        OR (p_isopuser IS NOT TRUE AND ca."id_cust_account" = p_id_cust_account)
    );
END;
$$ LANGUAGE plpgsql;

call set_op_user(0, 0, 'M. Admin', 1, TRUE,
'admin@cdd.dj','4889ba9b',
'253355445', '25377340000',
0); -- password mdp

CALL set_unitweight(0, 'Kilo', 'Kilogram');
CALL set_unitweight(0, 'Tonne', 'Tonne');
CALL set_unitweight(0, 'Mtonne', 'Megatonne');
CALL set_unitweight(0, 'Gramme', 'Gram');
CALL set_unitweight(0, 'Livre', 'Pound');
CALL set_unitweight(0, 'Once', 'Ounce');
CALL set_unitweight(0, 'Stone', 'Stone');
CALL set_unitweight(0, 'Carat', 'Carat');
CALL set_unitweight(0, 'Quintal', 'Quintal');
CALL set_unitweight(0, 'Milligramme', 'Milligram');

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


CALL add_files_repo_typeof(500, 'Certificat d''origine - Facture Commerciale', 'Certificate of origin - Commercial Invoice', TRUE);
CALL add_files_repo_typeof(501, 'Certificat d''origine - Liste de colisage', 'Certificate of origin - Packing List', TRUE);
CALL add_files_repo_typeof(502, 'Certificat d''origine - Certificat de poids', 'Certificate of origin - Weight Certificate', FALSE);
