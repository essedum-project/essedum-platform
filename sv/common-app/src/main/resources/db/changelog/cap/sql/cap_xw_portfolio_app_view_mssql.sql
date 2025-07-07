CREATE VIEW cap_xw_portfolio_app_view AS 
SELECT        id AS Portfolio_Application_ID, portfolio_id, id AS Application_ID, GETDATE() AS Last_Updated_Dts, 1 AS Rel_Act_Ind, id AS External_ProjectID
FROM            dbo.usm_project
