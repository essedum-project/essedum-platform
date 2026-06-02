CREATE PROCEDURE cap_cleanup_workflow_agent (given_date DATETIME, BUFFER INT)
BEGIN
 DECLARE MIN  INT;
 DECLARE diff  INT;
 DECLARE MAX  INT;
 SELECT MAX(Workflow_Input_Agent_ID),MIN(Workflow_Input_Agent_ID) INTO MAX,MIN FROM
 cap_xw_workflow_input_agent WHERE Last_Updated_Dts<given_date;
  SELECT MIN;      
    del_loop:  LOOP
        IF  MIN > MAX OR MIN IS NULL THEN 
            LEAVE  del_loop;
        END  IF;
         SET diff =MAX-MIN;
        IF diff<BUFFER THEN
			SET BUFFER=diff;
		END IF;
        DELETE cap_xw_workflow_input_agent FROM cap_xw_workflow_input_agent WHERE workflow_input_agent_id BETWEEN MIN  AND MIN + BUFFER AND Last_Updated_Dts<given_date;
        COMMIT;
         IF diff=0 THEN
			LEAVE  del_loop;
            END IF;
        SET MIN = MIN + BUFFER;
        IF MIN%100000 =0 THEN
			SELECT MIN;
            END IF;
    END LOOP;
END
