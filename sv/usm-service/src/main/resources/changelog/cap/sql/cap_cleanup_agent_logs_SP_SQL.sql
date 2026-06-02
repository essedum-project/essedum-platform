CREATE PROCEDURE cap_cleanup_agent_logs
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
            SELECT max(cap_agent_log.Log_ID)
            FROM dbo.cap_agent_log
            WHERE cap_agent_log.Timestamp < @given_date
         )

      SET @MIN = 
         (
            SELECT min(cap_agent_log.Log_ID)
            FROM dbo.cap_agent_log
            WHERE cap_agent_log.Timestamp < @given_date
         )

      SELECT @MAX

      WHILE (1 = 1)
      
         BEGIN

            IF @MIN >= @MAX OR @MIN IS NULL
               BREAK

            SET @diff = @MAX - @MIN

            IF @diff < @BUFFER
               SET @BUFFER = @diff

            DELETE 
            FROM dbo.cap_agent_log
            WHERE cap_agent_log.Log_ID BETWEEN @MIN AND @MIN + @BUFFER

            WHILE @@TRANCOUNT > 0
            
               COMMIT 

            SET @MIN = @MIN + @BUFFER

            SELECT @MIN

         END

   END
