CREATE VIEW cap_xw_user_portfolio_app_role_view AS 
SELECT        upr.id AS User_Portfolio_Application_Role_ID, CASE WHEN (r.name = 'Admin') THEN NULL ELSE upr.portfolio_id END AS Portfolio_ID, CASE WHEN ((r.name = 'Automation Manager') OR
                          (r.name = 'IT Portfolio Manager') OR
                         (r.name = 'Admin')) THEN NULL ELSE upr.project_id END AS Application_ID, GETDATE() AS Last_Updated_Dts, 1 AS Rel_Act_Ind, upr.role_id AS Usm_role, CASE 
                          WHEN (r.name = 'Admin') 
                         THEN 1 
                          WHEN (r.name = 'Automation Manager') THEN 2
                          WHEN (r.name = 'IT Portfolio Manager') THEN 2
                          ELSE 3 END AS Role_ID, upr.user_id
FROM            dbo.usm_user_project_role AS upr INNER JOIN
                         dbo.usm_role AS r ON upr.role_id = r.id
WHERE        (r.name IN (N'Automation Engineer', N'Automation Manager',N'IT Portfolio Manager', N'Admin'))
