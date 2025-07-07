CREATE VIEW cap_portfolio_view AS 
SELECT
  usm_portfolio.id             AS Portfolio_ID,
  usm_portfolio.portfolio_name AS Portfolio_Name,
  1                                AS Rec_Act_Ind,
  NOW()                            AS Last_Updated_Dts,
  NOW()                            AS Rec_Created_Dts,
  1                                AS Last_Updated_By,
  0                                AS Enable_Email_Notification
FROM usm_portfolio
