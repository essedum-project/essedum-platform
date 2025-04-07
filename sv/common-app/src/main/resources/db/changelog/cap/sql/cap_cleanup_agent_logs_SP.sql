CREATE PROCEDURE cap_cleanup_agent_logs(given_date DATETIME, BUFFER INT)
BEGIN
 DECLARE MIN  INT;
 DECLARE MAX  INT;
 DECLARE diff  INT;
 SET MAX =( SELECT MAX(Log_ID) FROM cap_agent_log WHERE TIMESTAMP < given_date);
 SET MIN = ( SELECT MIN(Log_ID) FROM cap_agent_log WHERE TIMESTAMP < given_date );
  SELECT MAX;
del_loop:  LOOP
        IF  MIN>= MAX  OR MIN IS NULL THEN 
            LEAVE  del_loop;
        END  IF;
        SET diff =MAX-MIN;
        IF diff<BUFFER THEN
			SET BUFFER=diff;
		END IF;
        DELETE FROM cap_agent_log WHERE Log_ID BETWEEN MIN  AND MIN + BUFFER;
        COMMIT;
        SET  MIN = MIN + BUFFER;
       	SELECT MIN;
    END LOOP;
END;
