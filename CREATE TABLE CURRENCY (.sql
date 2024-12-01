CREATE TABLE CURRENCY (
    ID_CURRENCY INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    SYMBOL VARCHAR(8) NOT NULL,                 -- Non nullable
    CODE VARCHAR(16) NOT NULL,                  -- Non nullable
    EXCHANGE_RATE FLOAT DEFAULT 0 NOT NULL      -- Non nullable avec valeur par défaut
);

DROP PROCEDURE IF EXISTS set_currency;
CREATE OR REPLACE PROCEDURE set_currency(
	p_id_currency INT,
	p_symbol VARCHAR(8),
	p_code VARCHAR(16),
	p_exchange_rate FLOAT
)
AS
$$
BEGIN
    IF p_id_currency IS NULL OR p_id_currency = 0 THEN
        INSERT INTO currency (
			"symbol",
	    	"code",
			"exchange_rate"
        ) VALUES (
			p_symbol,
			p_code,
			p_exchange_rate
        );
    ELSE
        UPDATE currency
        SET
			"symbol" = p_symbol,
			"code" = p_code,
			"exchange_rate" = p_exchange_rate
        WHERE "id_currency" = p_id_currency;
    END IF;
END;
$$ LANGUAGE plpgsql;





DO
 LANGUAGE plpgsql $$
DECLARE
  tableId int := 0;
BEGIN
    CALL public.set_currency(
	'EUR',
	'EUR',
	1,
	tableId
);
    raise notice '%', variable::varchar;
END;
$$;