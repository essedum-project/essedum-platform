DROP TABLE IF EXISTS cap_email_template;

DROP TABLE IF EXISTS cap_event_notification_detail;

TRUNCATE TABLE cap_event_detail ;

ALTER TABLE cap_event_detail ALTER COLUMN Event_Description VARCHAR(520);

INSERT INTO cap_event_detail (Event_Name,Rec_Act_Ind,Rec_Created_Dts,Event_Description,Event_Target_Entity_ID,Event_Target_Entity_Name) VALUES
    ('Transactionaborted',1,'2021-12-09 14:47:56','Category added',2,'Network'),
    ('FailedRegion',1,'2021-11-15 17:55:39','Send Mail for Failure',2,'ProbeFailure'),
    ('ProbeExclusion',1,'2021-12-09 14:49:17','Send Mail for Probe Exclusion',2,'ProbeFailure'),
    ('SkippedTransaction',1,'2021-12-09 14:49:17','This is a skipped transaction and wont be considered for raising ticket nor be counted in retry.',2,'ProbeFailure'),
    ('SendExclusionMail',1,'2021-12-09 14:49:17','Mail alerts will be stopped for an hour owing to some issue being experienced by the host. Monitoring would continue to be executed from the impacted host, but email alerts wont be sent out for any transaction failure.',2,'AppAvailability');
    
CREATE TABLE cap_event_notification_detail (
  [Event_Notification_Detail_ID] int NOT NULL IDENTITY,
  [Application_ID] int NOT NULL,
  [Event_ID] bigint NOT NULL,
  [Target_ID] int NOT NULL,
  [Description] varchar(45) NOT NULL,
  [Rec_Created_Dts] datetime2(0) DEFAULT NULL,
  [Mail_Sent_Ind] binary(1) DEFAULT NULL,
  [Rec_Act_Ind] binary(1) DEFAULT NULL,
  [Last_Updated_Dts] varchar(45) DEFAULT NULL,
  [Agent_Node_Mapping_ID] int DEFAULT NULL,
  [Rec_Created_By] int NOT NULL,
  [Recipient_ID] int DEFAULT NULL,
  [Seen_UI_Notification_By] int DEFAULT NULL,
  PRIMARY KEY ([Event_Notification_Detail_ID])
 ,
  CONSTRAINT [R_200] FOREIGN KEY ([Application_ID]) REFERENCES usm_project ([id]) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT [R_201] FOREIGN KEY ([Event_ID]) REFERENCES cap_event_detail ([Event_ID]) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT [R_202] FOREIGN KEY ([Agent_Node_Mapping_ID]) REFERENCES cap_xw_agent_node ([Agent_Node_ID]) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT [R_203] FOREIGN KEY ([Rec_Created_By]) REFERENCES usm_users ([id]) ON DELETE NO ACTION ON UPDATE NO ACTION
)

CREATE INDEX [Application_ID_idx] ON cap_event_notification_detail ([Application_ID]);
CREATE INDEX [Mapping_ID_idx] ON cap_event_notification_detail ([Agent_Node_Mapping_ID]);
CREATE INDEX [R_203_idx] ON cap_event_notification_detail ([Rec_Created_By]);
CREATE INDEX [a_idx] ON cap_event_notification_detail ([Event_ID]); 


CREATE TABLE cap_email_template (
  [TemplateId] BIGINT NOT NULL IDENTITY,
  [AppName] VARCHAR(256) NOT NULL,
  [EmailSubject] VARCHAR(256) DEFAULT NULL,
  [EmailBody] VARCHAR(max),
  [ProjectId] BIGINT DEFAULT NULL,
  [LastUpdatedBy] INT DEFAULT NULL,
  [Last_Updated_Dts] DATETIME NOT NULL,
  [Rec_Act_Ind] bit DEFAULT 0,
  [Event_ID] BIGINT DEFAULT NULL,
  PRIMARY KEY ([TemplateId]),
  CONSTRAINT [TemplateId_UNIQUE] UNIQUE  ([TemplateId])
 ,
  CONSTRAINT [cap_email_template_ibfk_1] FOREIGN KEY ([Event_ID]) REFERENCES cap_event_detail ([event_id]),
  CONSTRAINT [userfk] FOREIGN KEY ([LastUpdatedBy]) REFERENCES usm_users ([id])
) ;
 
 CREATE INDEX [userfk_idx] ON cap_email_template ([LastUpdatedBy]);
 CREATE INDEX [Event_ID] ON cap_email_template ([Event_ID]);

INSERT INTO cap_email_template VALUES ('capappavailability','error related to {AppName}','Application {EventName} has encountered error. Error message {ErrorData}
Please login into the application and validate the transaction {Probeurl}.
Additional details:
Date & Time : {FailureTime}
Step details :
Transaction name : {ProbeName}
Transaction URL : {Probeurl}
Error message : {ErrorData}
Note:
This is an automatically generated email from IAMP - Synthetic transaction monitoring. Do not reply to this ID. Please send email to TYSON_IS_IAMP for any queries related to this email.
Thanks
IAMP Team',NULL,1,'2021-10-14T15:43:57',1,1);

INSERT INTO cap_config VALUES ('API','KEight','false',NULL,0,NULL,NULL),
                              ('API','LeapUrl','update-essedum-url',NULL,0,NULL,NULL),
                              ('Generic','UserEmailId','admin@lfn.com',NULL,0,NULL,NULL),
                              ('Generic','UserVaultName','testv',NULL,0,NULL,NULL),
                              ('Generic','ApplicationId','2',NULL,0,NULL,NULL),
                              ('Generic','PortfolioId','2',NULL,0,NULL,NULL),
                              ('capagent','WorkflowExePath','Infosys.CA.WorkFlowExecution.exe',NULL,0,NULL,NULL);