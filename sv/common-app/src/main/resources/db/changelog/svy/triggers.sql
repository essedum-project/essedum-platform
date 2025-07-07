create TRIGGER [dbo].[TR_Project_Svy]   ON [dbo].[usm_project] 
  FOR DELETE
AS 
	DELETE FROM [dbo].[svy_answer_option]
	where [project_id] IN (select [id] from [deleted])
	DELETE FROM [dbo].[svy_country]
	where [project_id] IN (select [id] from [deleted])
	DELETE FROM [dbo].[svy_industry]
	where [project_id] IN (select [id] from [deleted])
	DELETE FROM [dbo].[svy_industry]
	where [project_id] IN (select [id] from [deleted])
	DELETE FROM [dbo].[svy_question]
	where [project_id] IN (select [id] from [deleted])
	DELETE FROM [dbo].[svy_question_option]
	where [project_id] IN (select [id] from [deleted])
	DELETE FROM [dbo].[svy_questionnaire]
	where [project_id] IN (select [id] from [deleted])
	DELETE FROM [dbo].[svy_questionnaire_instance]
	where [project_id] IN (select [id] from [deleted])
	DELETE FROM [dbo].[svy_region]
	where [project_id] IN (select [id] from [deleted])

PRINT 'We Successfully Fired the AFTER DELETE Triggers in SQL Server.'
/
create TRIGGER [dbo].[TR_Svy_client]   ON [dbo].[svy_client_details] 
  FOR DELETE
AS 
	DELETE FROM [dbo].[svy_client_score]
	where [client_id] IN (select [id] from [deleted])
	DELETE FROM [dbo].[svy_questionnaire_instance]
	where [client_id] IN (select [id] from [deleted])

PRINT 'We Successfully Fired the AFTER DELETE Triggers in SQL Server.'
/
create TRIGGER [dbo].[TR_svy_lk_question_type]   ON [dbo].[svy_lk_question_type] 
  FOR DELETE
AS 
	DELETE FROM [dbo].[svy_question]
	where [question_type_id] IN (select [id] from [deleted])

PRINT 'We Successfully Fired the AFTER DELETE Triggers in SQL Server.'
/
create TRIGGER [dbo].[TR_svy_dimension]   ON [dbo].[svy_dimension] 
  FOR DELETE
AS 
	DELETE FROM [dbo].[svy_question]
	where [dimension_id] IN (select [id] from [deleted])

PRINT 'We Successfully Fired the AFTER DELETE Triggers in SQL Server.'
/
create TRIGGER [dbo].[TR_svy_questionnaire]  ON [dbo].[svy_questionnaire] 
  FOR DELETE
AS 
	DELETE FROM [dbo].[svy_question]
	where [questionnaire_id] IN (select [id] from [deleted])
	DELETE FROM [dbo].[svy_questionnaire_instance]
	where [questionaire_id] IN (select [id] from [deleted])

PRINT 'We Successfully Fired the AFTER DELETE Triggers in SQL Server.'
/
create TRIGGER [dbo].[TR_svy_question]   ON [dbo].[svy_question] 
  FOR DELETE
AS 
	DELETE FROM [dbo].[svy_question_option]
	where [question_id] IN (select [id] from [deleted])

PRINT 'We Successfully Fired the AFTER DELETE Triggers in SQL Server.'
/