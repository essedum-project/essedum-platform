CREATE PROCEDURE cap_cleanup_workflow_input(given_date DATETIME, BUFFER INT)
BEGIN
 DECLARE MIN  INT;
 DECLARE MAX  INT;
 DECLARE diff  INT;

 SET MAX =( SELECT MAX(Workflow_Input_ID) FROM cap_workflow_input WHERE Last_Updated_Dts < given_date);
 SET MIN = ( SELECT MIN(Workflow_Input_ID) FROM cap_workflow_input WHERE Last_Updated_Dts < given_date );
  SELECT MAX,MIN;
del_loop:  LOOP
        IF  MIN > MAX  OR MIN IS NULL THEN
			LEAVE  del_loop;
        END  IF;
        SET diff =MAX-MIN;
        IF diff<BUFFER THEN
			SET BUFFER=diff;
		END IF;
       
        DELETE FROM cap_workflow_input WHERE Workflow_Input_ID BETWEEN MIN  AND MIN + BUFFER AND Last_Updated_Dts < given_date 
        AND Workflow_Input_ID NOT IN (SELECT Workflow_Input_ID FROM cap_xw_workflow_run_execution)
        AND Workflow_Input_ID!=1 ;
        COMMIT;
        IF diff=0 THEN
			LEAVE  del_loop;
		END IF;
        SET  MIN = MIN + BUFFER;
       	SELECT MIN;
    END LOOP;
END
