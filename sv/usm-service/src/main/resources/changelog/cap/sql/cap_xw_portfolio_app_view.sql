CREATE VIEW cap_xw_portfolio_app_view AS 
SELECT
  usm_project.id           AS Portfolio_Application_ID,
  usm_project.portfolio_id AS Portfolio_ID,
  usm_project.id           AS Application_ID,
  NOW()                        AS Last_Updated_Dts,
  1                            AS Rel_Act_Ind,
  usm_project.id           AS External_ProjectID
FROM usm_project
