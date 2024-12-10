-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS CUST_USER CASCADE;
DROP TABLE IF EXISTS CUST_ACCOUNT CASCADE;
DROP TABLE IF EXISTS OP_USER CASCADE;
DROP TABLE IF EXISTS LOGIN_USER CASCADE;
DROP TABLE IF EXISTS SECTOR CASCADE;
DROP TABLE IF EXISTS COUNTRY CASCADE;
DROP TABLE IF EXISTS LOGIN_USER CASCADE;

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

CREATE TABLE LOGIN_USER (
    ID_LOGIN_USER INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    USERNAME VARCHAR(32) NOT NULL UNIQUE,              -- Non nullable
    PWD VARCHAR(128) NOT NULL,                  -- Non nullable
    IsADMIN_LOGIN BOOLEAN DEFAULT FALSE NOT NULL, -- Non nullable avec valeur par défaut
    DEACTIVATION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '100 years' NOT NULL,  -- Non nullable avec valeur par défaut
    LASTLOGIN_TIME TIMESTAMP NULL               -- Nullable
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
                WHEN cu.deactivation_date >= CURRENT_DATE THEN 1
                ELSE 0 
            END AS isavailable_user,
            cu.id_cust_account AS id_cust_account
        FROM 
            cust_user cu
        INNER JOIN 
            cust_account ca ON ca.id_cust_account = cu.id_cust_account
    ) AS uv
    ON lu.id_login_user = uv.id_login_user;


-- Create the stored procedure
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
        LEFT JOIN cust_account ca ON vl."id_cust_account" = ca."id_cust_account"
        WHERE vl."username" = p_username
          AND vl."pwd" = p_pwd
          AND vl."isavailable_user" = 1
          AND vl."isavailable_login" = 1
          AND (vl."isadmin_login" = TRUE OR ca."statut_flag" = 1);

    GET DIAGNOSTICS rows_found = ROW_COUNT;

    IF rows_found = 1 THEN
        UPDATE login_user lu
        SET lastlogin_time = CURRENT_TIMESTAMP
        WHERE lu."username" = p_username
          AND lu."pwd" = p_pwd;

        IF p_login_stat_FLAG THEN
            INSERT INTO login_stats (idlogin, login_time)
            SELECT lu."id_login_user", CURRENT_TIMESTAMP 
            FROM login_user lu
            WHERE lu."username" = p_username
              AND lu."pwd" = p_pwd;
        END IF;
    ELSE
        RAISE EXCEPTION 'LOGIN NOT IDENTIFIED';
    END IF;

END;
$$ LANGUAGE plpgsql;

DROP PROCEDURE IF EXISTS set_cust_account;
CREATE OR REPLACE PROCEDURE set_cust_account(
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
    INOUT p_id_cust_account INT
)
AS
$$
BEGIN
    IF p_id_cust_account IS NULL OR p_id_cust_account = 0 THEN
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
        ) RETURNING id_cust_account INTO p_id_cust_account;
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
     FROM login_user INNER JOIN op_user ON login_user."id_login_user" = op_user."id_login_user"
     WHERE "id_op_user" = p_id_op_user;
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
    p_ismain_user BOOLEAN  -- Remplacement de p_isAdmin par p_ismain_user
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
        cu."user_position" AS "position", -- Utilisation de l'alias "position"
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
        AND (p_ismain_user IS NULL OR cu."ismain_user" = p_ismain_user)  -- Utilisation de ismain_user
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

call set_op_user(0, 0, 'M. Admin', 1, TRUE,
'admin@cdd.dj','password',
'253355445', '25377340000',
0);

