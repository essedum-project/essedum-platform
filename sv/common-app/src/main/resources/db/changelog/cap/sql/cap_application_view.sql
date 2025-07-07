CREATE VIEW cap_application_view AS 
SELECT
  usm_project.id   AS Application_ID,
  usm_project.name AS Application_Name,
  1                    AS Rec_Act_Ind,
  NOW()                AS Last_Updated_Dts,
  NOW()                AS Rec_Created_Dts,
  1                    AS Last_Updated_By,
  0                    AS TicketSeedValue,
  NULL                 AS IsClustered
FROM usm_project
