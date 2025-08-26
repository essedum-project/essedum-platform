DROP TABLE IF EXISTS `cap_email_template`;

DROP TABLE IF EXISTS `cap_event_notification_detail`;

TRUNCATE TABLE `cap_event_detail` ;

ALTER TABLE cap_event_detail MODIFY COLUMN Event_Description VARCHAR(520);

INSERT INTO cap_event_detail (`Event_Name`,`Rec_Act_Ind`,`Rec_Created_Dts`,`Event_Description`,`Event_Target_Entity_ID`,`Event_Target_Entity_Name`)
VALUES
    ('Transactionaborted',b'1','2021-12-09 14:47:56','Category added',2,'Network'),
    ('FailedRegion',b'1','2021-11-15 17:55:39','Send Mail for Failure',2,'ProbeFailure'),
    ('ProbeExclusion',b'1','2021-12-09 14:49:17','Send Mail for Probe Exclusion',2,'ProbeFailure'),
    ('SkippedTransaction',b'1','2021-12-09 14:49:17','This is a skipped transaction and wont be considered for raising ticket nor be counted in retry.',2,'ProbeFailure'),
    ('SendExclusionMail',b'1','2021-12-09 14:49:17','Mail alerts will be stopped for an hour owing to some issue being experienced by the host. Monitoring would continue to be executed from the impacted host, but email alerts wont be sent out for any transaction failure.',2,'AppAvailability');
    
CREATE TABLE `cap_event_notification_detail` (
  `Event_Notification_Detail_ID` INT(11) NOT NULL AUTO_INCREMENT,
  `Application_ID` INT(11) NOT NULL,
  `Event_ID` BIGINT(20) NOT NULL,
  `Target_ID` INT(11) NOT NULL,
  `Description` VARCHAR(45) NOT NULL,
  `Rec_Created_Dts` DATETIME DEFAULT NULL,
  `Mail_Sent_Ind` BIT(1) DEFAULT NULL,
  `Rec_Act_Ind` BIT(1) DEFAULT NULL,
  `Last_Updated_Dts` VARCHAR(45) DEFAULT NULL,
  `Agent_Node_Mapping_ID` INT(11) DEFAULT NULL,
  `Rec_Created_By` INT(11) NOT NULL,
  `Recipient_ID` INT(11) DEFAULT NULL,
  `Seen_UI_Notification_By` INT(11) DEFAULT NULL,
  PRIMARY KEY (`Event_Notification_Detail_ID`),
  KEY `Application_ID_idx` (`Application_ID`),
  KEY `Mapping_ID_idx` (`Agent_Node_Mapping_ID`),
  KEY `R_203_idx` (`Rec_Created_By`),
  KEY `a_idx` (`Event_ID`),
  CONSTRAINT `R_200` FOREIGN KEY (`Application_ID`) REFERENCES `usm_project` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `R_201` FOREIGN KEY (`Event_ID`) REFERENCES `cap_event_detail` (`Event_ID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `R_202` FOREIGN KEY (`Agent_Node_Mapping_ID`) REFERENCES `cap_xw_agent_node` (`Agent_Node_ID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `R_203` FOREIGN KEY (`Rec_Created_By`) REFERENCES `usm_users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ;
    
CREATE TABLE `cap_email_template` (
  `TemplateId` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `AppName` VARCHAR(256) NOT NULL,
  `EmailSubject` VARCHAR(256) DEFAULT NULL,
  `EmailBody` LONGTEXT,
  `ProjectId` BIGINT(20) DEFAULT NULL,
  `LastUpdatedBy` INT(11) DEFAULT NULL,
  `Last_Updated_Dts` DATETIME NOT NULL,
  `Rec_Act_Ind` BIT(1) DEFAULT b'0',
  `Event_ID` BIGINT(20) DEFAULT NULL,
  PRIMARY KEY (`TemplateId`),
  UNIQUE KEY `TemplateId_UNIQUE` (`TemplateId`),
  KEY `userfk_idx` (`LastUpdatedBy`),
  KEY `Event_ID` (`Event_ID`),
  CONSTRAINT `cap_email_template_ibfk_1` FOREIGN KEY (`Event_ID`) REFERENCES `cap_event_detail` (`event_id`),
  CONSTRAINT `userfk` FOREIGN KEY (`LastUpdatedBy`) REFERENCES `usm_users` (`id`)
) ;

INSERT INTO cap_email_template VALUES (1,"capappavailability","error related to {AppName}","Application {EventName} has encountered error. Error message {ErrorData}
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
IAMP Team",NULL,1,"2021-10-14T15:43:57",true,1);

INSERT INTO cap_config VALUES (169,"API","KEight","false",NULL,FALSE,NULL,NULL),
                              (170,"API","EssedumUrl","https://essedum2:3000/",NULL,FALSE,NULL,NULL),
                              (171,"Generic","UserEmailId","admin@lfn.com",NULL,FALSE,NULL,NULL),
                              (172,"Generic","UserVaultName","testv",NULL,FALSE,NULL,NULL),
                              (173,"Generic","ApplicationId","2",NULL,FALSE,NULL,NULL),
                              (174,"Generic","PortfolioId","2",NULL,FALSE,NULL,NULL),
                              (175,"capagent","WorkflowExePath","Infosys.CA.WorkFlowExecution.exe",NULL,FALSE,NULL,NULL);

INSERT INTO cap_vault_manager_botfactory VALUES (1,"testv","ALL","ICAPInternalUser","hgy+uAmsy1RlnS6PUaMGPQ==",FALSE,FALSE,NULL,"2023-06-22 11:11:59",TRUE,"2");
