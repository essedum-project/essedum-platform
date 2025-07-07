create TRIGGER [dbo].[TR_Project]   ON [dbo].[usm_project] 
  FOR DELETE
AS 
	DELETE FROM [dbo].[usm_user_project_role]
	where [project_id] IN (select [id] from [deleted])
	-- DELETE FROM [dbo].[usm_api_permissions]
	-- where [project_id] IN (select [id] from [deleted])
	DELETE FROM [dbo].[dbs_palette]
	where [project_id] IN (select [id] from [deleted])
	DELETE from [dbo].[dbs_sequence_widget]
	where [project_id] in (select [id] from [deleted])
	DELETE from [dbo].[dbs_dashboard_configuration]
	where [project] in (select [id] from [deleted])
	DELETE from [dbo].[bcc_svg]
	where [project_id] in (select [id] from [deleted])
	DELETE from [dbo].[bcc_metrics_master]
	where [project_id] in (select [id] from [deleted])
	DELETE from [dbo].[ccl_tools]
	where [project_id] in (select [id] from [deleted])
	DELETE from [dbo].[usm_role]
	where [project_id] in (select [id] from [deleted])
	DELETE from [dbo].[dbs_widget_comment]
	where [project_id] in (select [id] from [deleted])
	DELETE from [dbo].[dbs_threshold]
	where [project_id] in (select [id] from [deleted])
	DELETE from [dbo].[cfm_xw_ci_mapping]
	where [project_id] in (select [id] from [deleted])
	DELETE from [dbo].[cfm_configuration_item]
	where [project_id] in (select [id] from [deleted])
	DELETE from [dbo].[bcc_ci_metrics_mapping]
	where [project_id] in (select [id] from [deleted])
	DELETE from [dbo].[dbs_threshold_config]
	where [project] in (select [id] from [deleted])
	DELETE FROM [dbo].[cfm_configuration_item_type]
	where [project_id] IN (select [id] from [deleted])
	DELETE FROM [dbo].[usm_role_process]
	where [project_id] IN (select [id] from [deleted])
PRINT 'We Successfully Fired the AFTER DELETE Triggers in SQL Server.'
/
CREATE TRIGGER [dbo].[CI] ON [dbo].[cfm_configuration_item]
FOR DELETE
AS
DELETE FROM [dbo].[cfm_xw_ci_mapping]
where [ci_item1] In (select [id] from [deleted])
DELETE FROM [dbo].[cfm_xw_ci_mapping]
where [ci_item2] In (select [id] from [deleted])
DELETE FROM [dbo].[bcc_svg_ci_mapping]
where [ci_id] IN (select [id] from [deleted])
DELETE FROM [dbo].[bcc_ci_metrics_mapping]
where [ci_id] IN (select [id] from [deleted])
DELETE FROM [dbo].[bcc_ci_dashboard_mapping]
where [ci_id] IN (select [id] from [deleted])
PRINT 'We successfully Fired the CI AFTER DELETE Triggers in SQL Server.'
/
CREATE TRIGGER  [dbo].[DASHBOARD] ON [dbo].[dbs_dashboard_configuration]
FOR DELETE
AS
DELETE FROM [dbo].[dbs_filter]
where [dashboard] IN (select [id] from [deleted])
delete from [dbo].[dbs_widget_configuration]
where [dashboard] IN (select [id] from [deleted])
DELETE FROM [dbo].[bcc_svg_dashboard_mapping]
where [dashboard_id] IN (select [id] from [deleted])
DELETE FROM [dbo].[dbs_user_project_role_dashboard]
where [dashboard] IN (select [id] from [deleted])
DELETE FROM [dbo].[cfm_configuration_item_type]
where [dashboard_id] IN (select [id] from [deleted])
DELETE FROM [dbo].[cfm_configuration_item]
where [dashboard] IN (select [id] from [deleted])
DELETE FROM [dbo].[bcc_ci_dashboard_mapping]
where [dashboard_id] IN (select [id] from [deleted])
DELETE FROM [dbo].[bcc_metrics_master]
where [dashboard_id] IN (select [id] from [deleted])
PRINT 'We successfully Fired the DASHBOARD AFTER DELETE Triggers in SQL Server.'
/
create TRIGGER [dbo].[TR_Organsation]  ON [dbo].[usm_organisation] 
  FOR DELETE
AS 
	DELETE FROM [dbo].[usm_unit]
	where [organisation]= (select [id] from [deleted])
PRINT 'We Successfully Fired the AFTER DELETE Triggers in SQL Server.'
/
create TRIGGER [dbo].[TR_UNIT]
   ON  [dbo].[usm_unit] 
   FOR DELETE
AS 
	DELETE FROM [dbo].[usm_user_unit]
	where [unit] IN (select [id] from [deleted])
PRINT 'We Successfully Fired the AFTER DELETE Triggers in SQL Server.'
/
create TRIGGER [dbo].[TR_WIDGET]
   ON  [dbo].[dbs_widget_configuration] 
   FOR DELETE
AS 
	DELETE FROM [dbo].[dbs_filter]
	where [widget] IN (select [id] from [deleted])
	DELETE FROM [dbo].[dbs_sequence_widget]
	where [widget_id] IN (select [id] from [deleted])
PRINT 'We Successfully Fired the AFTER DELETE Triggers in SQL Server.'
/
create TRIGGER [dbo].[TR_Users]
   ON  [dbo].[usm_users] 
   FOR DELETE
AS 
	DELETE FROM [dbo].[twb_team]
	where [owner] IN (select [id] from [deleted])
	DELETE FROM [dbo].[twb_task_users]
	where [last_updated_by] IN (select [id] from [deleted])
	DELETE FROM [dbo].[twb_transition_users]
	where [last_updated_by] IN (select [id] from [deleted])
	DELETE FROM [dbo].[usm_user_unit]
	where [user_cg] IN (select [id] from [deleted])
	DELETE FROM [dbo].[usm_user_mapping]
	where [child_user_id] IN (select [id] from [deleted])
PRINT 'We Successfully Fired the AFTER DELETE Triggers in SQL Server.'
/
create TRIGGER [dbo].[TR_threshold]
   ON  [dbo].[dbs_threshold] 
   FOR DELETE
AS 
	DELETE FROM [dbo].[cfm_configuration_item]
	where [thershold_mapping] IN (select [id] from [deleted])
	DELETE FROM [dbo].[twb_task_users]
	where [last_updated_by] IN (select [id] from [deleted])
PRINT 'We Successfully Fired the AFTER DELETE Triggers in SQL Server.'
/
create TRIGGER [dbo].[TR_bcc_svg_dashboard]
   ON  [dbo].[bcc_svg_dashboard_mapping] 
   FOR DELETE
AS 
	DELETE FROM [dbo].[bcc_svg_ci_mapping]
	where [svg_dashboard_id] IN (select [id] from [deleted])
PRINT 'We Successfully Fired the AFTER DELETE Triggers in SQL Server.'
/
create TRIGGER [dbo].[TR_bcc_svg]
   ON  [dbo].[bcc_svg] 
   FOR DELETE
AS 
	DELETE FROM [dbo].[bcc_svg_dashboard_mapping]
	where [svg_id] IN (select [id] from [deleted])
	DELETE FROM [dbo].[bcc_svg_elements]
    where [svg_id] IN (select [id] from [deleted])
PRINT 'We Successfully Fired the AFTER DELETE Triggers in SQL Server.'
/
create TRIGGER [dbo].[TR_bcc_metrics_master]
   ON  [dbo].[bcc_metrics_master] 
   FOR DELETE
AS 
	DELETE FROM [dbo].[bcc_ci_metrics_mapping]
	where [metric_id] IN (select [id] from [deleted])
PRINT 'We Successfully Fired the AFTER DELETE Triggers in SQL Server.'
/
create TRIGGER [dbo].[TR_dbs_palette]
   ON  [dbo].[dbs_palette] 
   FOR DELETE
AS 
	DELETE FROM [dbo].[dbs_palette_widget_sequence]
	where [palette_id] IN (select [id] from [deleted])
PRINT 'We Successfully Fired the AFTER DELETE Triggers in SQL Server.'
/
create TRIGGER [dbo].[TR_dbs_palette_config]
   ON  [dbo].[dbs_palette_config] 
   FOR DELETE
AS 
	DELETE FROM [dbo].[dbs_palette_widget_sequence]
	where [palette_config] IN (select [id] from [deleted])
PRINT 'We Successfully Fired the AFTER DELETE Triggers in SQL Server.'
/
create TRIGGER [dbo].[TR_ccl_phase]
   ON  [dbo].[ccl_phase] 
   FOR DELETE
AS 
	DELETE FROM [dbo].[ccl_process]
	where [phase_id] IN (select [id] from [deleted])
PRINT 'We Successfully Fired the AFTER DELETE Triggers in SQL Server.'
/
create TRIGGER [dbo].[TR_dbs_threshold_config]
   ON  [dbo].[dbs_threshold_config] 
   FOR DELETE
AS 
	DELETE FROM [dbo].[dbs_threshold]
	where [threshold_config] IN (select [id] from [deleted])
	DELETE FROM [dbo].[dbs_threshold_widget_sequence]
	where [threshold_config] IN (select [id] from [deleted])
	DELETE FROM [dbo].[bcc_ci_metrics_mapping]
    where [thershold_mapping] IN (select [id] from [deleted])
PRINT 'We Successfully Fired the AFTER DELETE Triggers in SQL Server.'
/
create TRIGGER [dbo].[TR_dbs_sequence_widget]
   ON  [dbo].[dbs_sequence_widget] 
   FOR DELETE
AS 
	DELETE FROM [dbo].[dbs_palette_widget_sequence]
	where [widget_sequence_id] IN (select [id] from [deleted])
	DELETE FROM [dbo].[dbs_threshold_widget_sequence]
	where [widget_sequence_id] IN (select [id] from [deleted])
PRINT 'We Successfully Fired the AFTER DELETE Triggers in SQL Server.'
/
create TRIGGER [dbo].[TR_ccl_tools]
   ON  [dbo].[ccl_tools] 
   FOR DELETE
AS 
	DELETE FROM [dbo].[ccl_tool_userproject]
	where [tool_id] IN (select [id] from [deleted])
PRINT 'We Successfully Fired the AFTER DELETE Triggers in SQL Server.'
/
create TRIGGER [dbo].[TR_cfm_configuration_item_type]
   ON  [dbo].[cfm_configuration_item_type]
   FOR DELETE
AS
    DELETE FROM [dbo].[cfm_configuration_item]
    where [ctype] IN (select [id] from [deleted])
PRINT 'We Successfully Fired the AFTER DELETE Triggers in SQL Server.'
/
create TRIGGER [dbo].[TR_usm_process]
   ON  [dbo].[usm_process]
   FOR DELETE
AS
    DELETE FROM [dbo].[usm_stage]
    where [process_id] IN (select [id] from [deleted])
PRINT 'We Successfully Fired the AFTER DELETE Triggers in SQL Server.'
/
create TRIGGER [dbo].[TR_usm_role]
   ON  [dbo].[usm_role]
   FOR DELETE
AS
    DELETE FROM [dbo].[usm_role_mapping]
    where [child_role_id] IN (select [id] from [deleted])
PRINT 'We Successfully Fired the AFTER DELETE Triggers in SQL Server.'
/