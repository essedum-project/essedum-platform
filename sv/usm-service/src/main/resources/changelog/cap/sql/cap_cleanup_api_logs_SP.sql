CREATE PROCEDURE cap_cleanup_api_logs(given_date DATETIME, BUFFER INT)
BEGIN
 DECLARE MIN  INT;
 DECLARE MAX  INT;
 DECLARE diff  INT;
 SET MAX =( SELECT MAX(API_Log_ID) FROM cap_api_log WHERE TIMESTAMP < given_date);
 SET MIN = ( SELECT MIN(API_Log_ID) FROM cap_api_log WHERE TIMESTAMP < given_date );
  SELECT MAX;
del_loop:  LOOP
        IF  MIN >= MAX  OR MIN IS NULL THEN 
            LEAVE  del_loop;
        END  IF;
        SET diff =MAX-MIN;
        IF diff<BUFFER THEN
			SET BUFFER=diff;
		END IF;
        DELETE FROM cap_api_log WHERE API_Log_ID BETWEEN MIN  AND MIN + BUFFER;
        
        COMMIT;
        SET  MIN = MIN + BUFFER;
       	SELECT MIN;
    END LOOP;
END
