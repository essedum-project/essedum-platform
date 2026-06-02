CREATE PROCEDURE cap_cleanup_workflow_run_exe
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
            SELECT max(cap_xw_workflow_run_execution.Workflow_Run_Execution_ID)
            FROM dbo.cap_xw_workflow_run_execution
            WHERE cap_xw_workflow_run_execution.Last_Updated_Dts < @given_date
         )

      SET @MIN = 
         (
            SELECT min(cap_xw_workflow_run_execution.Workflow_Run_Execution_ID)
            FROM dbo.cap_xw_workflow_run_execution
            WHERE cap_xw_workflow_run_execution.Last_Updated_Dts < @given_date
         )

      SELECT @MAX

      /*
      *   SSMA informational messages:
      *   M2SS0003: The following SQL clause was ignored during conversion:
      *   del_loop : .
      */

      WHILE (1 = 1)
      
         BEGIN

            IF @MIN > @MAX OR @MIN IS NULL
               BREAK

            SET @diff = @MAX - @MIN

            IF @diff < @BUFFER
               SET @BUFFER = @diff

            DELETE 
            FROM dbo.cap_xw_workflow_run_execution
            WHERE cap_xw_workflow_run_execution.Workflow_Run_Execution_ID BETWEEN @MIN AND @MIN + @BUFFER

            WHILE @@TRANCOUNT > 0
            
               COMMIT 

            IF @diff = 0
               BREAK

            SET @MIN = @MIN + @BUFFER

            SELECT @MIN

         END

   END
