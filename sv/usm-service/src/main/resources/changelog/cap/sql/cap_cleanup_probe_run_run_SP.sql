CREATE PROCEDURE cap_cleanup_probe_run_run(given_date DATETIME, BUFFER INT)
BEGIN

 DECLARE MIN  INT;

 DECLARE MAX  INT;

 DECLARE diff INT;

 SET MAX =( SELECT MAX(probe_run_trans_details_Id) FROM sre_probe_run_rundetails WHERE probe_run_stepstartdate < given_date);

 SET MIN = ( SELECT MIN(probe_run_trans_details_Id) FROM sre_probe_run_rundetails WHERE probe_run_stepstartdate < given_date );

  SELECT MAX;

del_loop:  LOOP

        IF  MIN > MAX  OR MIN IS NULL THEN 

            LEAVE  del_loop;

        END  IF;

        SET diff =MAX-MIN;

        IF diff<BUFFER THEN

			SET BUFFER=diff;

		END IF;
		
  CREATE  TABLE IF NOT EXISTS sre_probe_run_rundetails_archive(
  probe_run_trans_details_Id INT(11) NOT NULL AUTO_INCREMENT,
  probe_run_trans_Id INT(11) NOT NULL,
  sequence_number INT(11) DEFAULT NULL,
  probe_run_stepName VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  probe_run_stepstartdate DATETIME DEFAULT NULL,
  probe_run_stependdate DATETIME DEFAULT NULL,
  probe_run_eststepstartdate DATETIME DEFAULT NULL,
  probe_run_eststependdate DATETIME DEFAULT NULL,
  probe_run_stepdiff FLOAT DEFAULT NULL,
  probe_run_step_status CHAR(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (probe_run_trans_details_Id)    
);

        INSERT INTO sre_probe_run_rundetails_archive SELECT * FROM sre_probe_run_rundetails WHERE probe_run_trans_details_Id  BETWEEN MIN  AND MIN + BUFFER;

        DELETE FROM sre_probe_run_rundetails WHERE probe_run_trans_details_Id BETWEEN MIN  AND MIN + BUFFER;

        COMMIT;

        IF diff=0 THEN

			LEAVE  del_loop;

		END IF;

        SET  MIN = MIN + BUFFER;

       	SELECT MIN;

    END LOOP;

END
