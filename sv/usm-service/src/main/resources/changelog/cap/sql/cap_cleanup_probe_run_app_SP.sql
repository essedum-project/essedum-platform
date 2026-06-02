CREATE PROCEDURE cap_cleanup_probe_run_app(given_date DATETIME, BUFFER INT)
BEGIN

 DECLARE MIN  INT;

 DECLARE MAX  INT;

 DECLARE diff INT;

 SET MAX =( SELECT MAX(probe_run_app_id) FROM sre_probe_run_app WHERE ADDTIME(TIMESTAMP(run_date,run_start_time),ABS(TIMEDIFF(run_start_time,run_end_time))) < given_date);

 SET MIN = ( SELECT MIN(probe_run_app_id) FROM sre_probe_run_app WHERE ADDTIME(TIMESTAMP(run_date,run_start_time),ABS(TIMEDIFF(run_start_time,run_end_time))) < given_date );

  SELECT MAX;

del_loop:  LOOP

        IF  MIN > MAX  OR MIN IS NULL THEN 

            LEAVE  del_loop;

        END  IF;

        SET diff =MAX-MIN;

        IF diff<BUFFER THEN

			SET BUFFER=diff;

		END IF;

CREATE  TABLE IF NOT EXISTS sre_probe_run_app_archive(
  probe_run_app_id INT(11) NOT NULL AUTO_INCREMENT,
  probe_loc_run_id INT(11) DEFAULT NULL,
  run_description LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  run_date DATE NOT NULL,
  run_date_est DATE NOT NULL,
  SUT VARCHAR(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  run_start_time TIME NOT NULL,
  run_end_time TIME NOT NULL,
  run_time FLOAT DEFAULT NULL,
  run_result TINYINT(1) NOT NULL,
  is_available TINYINT(1) DEFAULT NULL,
  workflow_id INT(11) DEFAULT NULL,
  run_id INT(11) DEFAULT NULL,
  execution_id INT(11) DEFAULT NULL,
  mapping_id INT(11) DEFAULT NULL,
  probe_id INT(11) NOT NULL,
  application_id INT(11) NOT NULL,
  location_id INT(11) DEFAULT NULL,
  error_data LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  is_aborted TINYINT(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (probe_run_app_id) 
);
        INSERT INTO sre_probe_run_app_archive SELECT * FROM sre_probe_run_app WHERE probe_run_app_id  BETWEEN MIN  AND MIN + BUFFER;

        DELETE FROM sre_probe_run_app WHERE probe_run_app_id BETWEEN MIN  AND MIN + BUFFER;

        COMMIT;

        IF diff=0 THEN

			LEAVE  del_loop;

		END IF;

        SET  MIN = MIN + BUFFER;

       	SELECT MIN;

    END LOOP;

END
