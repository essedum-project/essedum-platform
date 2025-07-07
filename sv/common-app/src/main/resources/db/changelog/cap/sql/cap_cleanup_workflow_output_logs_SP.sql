CREATE PROCEDURE cap_cleanup_workflow_output_logs(given_date DATETIME, BUFFER INT)
BEGIN
 DECLARE MIN  INT;
 DECLARE MAX  INT;
 DECLARE diff  INT;
 SET MAX =( SELECT MAX(Workflow_Output_ID) FROM cap_workflow_output WHERE Last_Updated_Dts < given_date);
 SET MIN = ( SELECT MIN(Workflow_Output_ID) FROM cap_workflow_output WHERE Last_Updated_Dts < given_date );
  SELECT MAX;
del_loop:  LOOP
        IF  MIN > MAX  OR MIN IS NULL THEN 
            LEAVE  del_loop;
        END  IF;
        SET diff =MAX-MIN;
        IF diff<BUFFER THEN
			SET BUFFER=diff;
		END IF;
        DELETE FROM cap_workflow_output WHERE Workflow_Output_ID BETWEEN MIN  AND MIN + BUFFER AND Last_Updated_Dts < given_date;
        COMMIT;
        IF diff=0 THEN
			LEAVE  del_loop;
		END IF;
        SET  MIN = MIN + BUFFER;
       	SELECT MIN;
    END LOOP;
END
