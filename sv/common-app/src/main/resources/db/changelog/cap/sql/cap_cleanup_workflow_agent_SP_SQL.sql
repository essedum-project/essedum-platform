CREATE PROCEDURE cap_cleanup_workflow_agent
   @given_date datetime2(0),
   @BUFFER int
AS 
   BEGIN

      SET  XACT_ABORT  ON

      SET  NOCOUNT  ON

      DECLARE
         @MIN int

      DECLARE
         @diff int

      DECLARE
         @MAX int

      SELECT @MAX = max(cap_xw_workflow_input_agent.Workflow_Input_Agent_ID), @MIN = min(cap_xw_workflow_input_agent.Workflow_Input_Agent_ID)
      FROM dbo.cap_xw_workflow_input_agent
      WHERE cap_xw_workflow_input_agent.Last_Updated_Dts < @given_date

      SELECT @MIN

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
            FROM cap_xw_workflow_input_agent
            FROM dbo.cap_xw_workflow_input_agent
            WHERE dbo.cap_xw_workflow_input_agent.Workflow_Input_Agent_ID BETWEEN @MIN AND @MIN + @BUFFER

            WHILE @@TRANCOUNT > 0
            
               COMMIT 

            IF @diff = 0
               BREAK

            SET @MIN = @MIN + @BUFFER

            IF @MIN % 100000 = 0
               SELECT @MIN

         END

   END
