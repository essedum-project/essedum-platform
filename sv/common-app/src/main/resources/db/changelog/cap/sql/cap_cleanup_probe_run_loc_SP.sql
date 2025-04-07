CREATE PROCEDURE cap_cleanup_probe_run_loc(given_date DATETIME, BUFFER INT)
BEGIN

 DECLARE MIN  INT;

 DECLARE MAX  INT;

 DECLARE diff INT;

 SET MAX =( SELECT MAX(id) FROM sre_probe_location_run_data WHERE lastrun_timestamp < given_date);

 SET MIN = ( SELECT MIN(id) FROM sre_probe_location_run_data WHERE lastrun_timestamp < given_date );

  SELECT MAX;

del_loop:  LOOP

        IF  MIN > MAX  OR MIN IS NULL THEN 

            LEAVE  del_loop;

        END  IF;

        SET diff =MAX-MIN;

        IF diff<BUFFER THEN

			SET BUFFER=diff;

		END IF;

   CREATE  TABLE IF NOT EXISTS sre_probe_location_run_data_archive(
  id INT(11) NOT NULL AUTO_INCREMENT,
  probe_id INT(11) DEFAULT NULL,
  location_id INT(11) DEFAULT NULL,
  isAvailable TINYINT(4) DEFAULT NULL,
  lastrun_timestamp DATETIME DEFAULT NULL,
  workflow_name VARCHAR(255) DEFAULT NULL,
  isMailSent TINYINT(4) DEFAULT NULL,
  isTicketRaised TINYINT(4) DEFAULT NULL,
  TicketId VARCHAR(45) DEFAULT NULL,
  PRIMARY KEY (id) 
);

        INSERT INTO sre_probe_location_run_data_archive SELECT * FROM sre_probe_location_run_data WHERE id  BETWEEN MIN  AND MIN + BUFFER;

        DELETE FROM sre_probe_location_run_data WHERE id BETWEEN MIN  AND MIN + BUFFER;

        COMMIT;

        IF diff=0 THEN

			LEAVE  del_loop;

		END IF;

        SET  MIN = MIN + BUFFER;

       	SELECT MIN;

    END LOOP;

END
