CREATE PROCEDURE cap_cleanup_workflow_output_logs
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
            SELECT max(cap_workflow_output.Workflow_Output_ID)
            FROM dbo.cap_workflow_output
            WHERE cap_workflow_output.Last_Updated_Dts < @given_date
         )

      SET @MIN = 
         (
            SELECT min(cap_workflow_output.Workflow_Output_ID)
            FROM dbo.cap_workflow_output
            WHERE cap_workflow_output.Last_Updated_Dts < @given_date
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
            FROM dbo.cap_workflow_output
            WHERE cap_workflow_output.Workflow_Output_ID BETWEEN @MIN AND @MIN + @BUFFER

            WHILE @@TRANCOUNT > 0
            
               COMMIT 

            IF @diff = 0
               BREAK

            SET @MIN = @MIN + @BUFFER

            SELECT @MIN

         END

   END
