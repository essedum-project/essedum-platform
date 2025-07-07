DROP PROCEDURE IF EXISTS drop_tables_svy;
#
CREATE PROCEDURE drop_tables_svy()
BEGIN
	SET @db:=(SELECT DATABASE());
    SELECT @str_sql:=CONCAT('drop table IF EXISTS ', GROUP_CONCAT(TABLE_NAME))
    FROM information_schema.tables
    WHERE table_schema= @db AND TABLE_NAME LIKE 'svy_%';
    PREPARE stmt FROM @str_sql;
    EXECUTE stmt;
    DROP PREPARE stmt;
END
#