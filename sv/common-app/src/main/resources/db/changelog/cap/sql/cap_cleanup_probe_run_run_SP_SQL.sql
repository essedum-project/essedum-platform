CREATE PROCEDURE cap_cleanup_probe_run_run
   @given_date datetime2(0),
   @BUFFER int
AS 
   BEGIN

      SET  XACT_ABORT  ON

      SET  NOCOUNT  ON

      DECLARE
         @MIN int

      DECLARE
         @MAX int

      DECLARE
         @diff int

      SET @MAX = 
         (
            SELECT max(sre_probe_run_rundetails.probe_run_trans_details_Id)
            FROM dbo.sre_probe_run_rundetails
            WHERE sre_probe_run_rundetails.probe_run_stepstartdate < @given_date
         )

      SET @MIN = 
         (
            SELECT min(sre_probe_run_rundetails.probe_run_trans_details_Id)
            FROM dbo.sre_probe_run_rundetails
            WHERE sre_probe_run_rundetails.probe_run_stepstartdate < @given_date
         )

      SELECT @MAX

    
      WHILE (1 = 1)
      
         BEGIN

            IF @MIN > @MAX OR @MIN IS NULL
               BREAK

            SET @diff = @MAX - @MIN

            IF @diff < @BUFFER
               SET @BUFFER = @diff

          
            DELETE 
            FROM dbo.sre_probe_run_rundetails
            WHERE sre_probe_run_rundetails.probe_run_trans_details_Id BETWEEN @MIN AND @MIN + @BUFFER

            WHILE @@TRANCOUNT > 0
            
               COMMIT 

            IF @diff = 0
               BREAK

            SET @MIN = @MIN + @BUFFER

            SELECT @MIN

         END

   END
