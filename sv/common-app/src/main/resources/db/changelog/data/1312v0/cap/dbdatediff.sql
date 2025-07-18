DROP FUNCTION IF EXISTS dbdatediff;
GO
CREATE FUNCTION dbdatediff (sdt VARCHAR(26))
RETURNS INT(11)
NO SQL
BEGIN
RETURN TIMESTAMPDIFF(MINUTE,CAST(sdt AS DATETIME),NOW());
END
GO