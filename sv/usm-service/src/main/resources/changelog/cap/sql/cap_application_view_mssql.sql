CREATE VIEW cap_application_view AS 
SELECT        id AS Application_ID,
 name AS Application_Name, 
 1 AS Rec_Act_Ind,
 GETDATE() AS Last_Updated_Dts,
 GETDATE() AS Rec_Created_Dts, 
 1 AS Last_Updated_By,
 0 AS TicketSeedValue,
 NULL AS IsClustered
FROM            dbo.usm_project
