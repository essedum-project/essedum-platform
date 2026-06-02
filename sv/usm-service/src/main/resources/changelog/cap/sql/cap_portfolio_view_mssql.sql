CREATE VIEW cap_portfolio_view AS 
SELECT        id AS Portfolio_ID, portfolio_name, 1 AS Rec_Act_Ind, GETDATE() AS Last_Updated_Dts, GETDATE() AS Rec_Created_Dts, 1 AS Last_Updated_By, 0 AS Enable_Email_Notification
FROM            dbo.usm_portfolio
