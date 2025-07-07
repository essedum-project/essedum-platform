INSERT INTO `cap_lk_file_type` VALUES (1,'Package',1,'2019-03-15 12:26:20','Package',1),(2,'ScriptBinary',1,'2019-03-15 12:26:20','ScriptBinary',1),(3,'WorkFlowBinary',1,'2019-03-15 12:26:20','WorkFlowBinary',1),(4,'Release',1,'2019-03-15 12:26:20','Release',1);

INSERT INTO `cap_lk_os_architecture` VALUES (1,'x64',1,'2019-04-05 15:50:10',1),(2,'x32',1,'2019-03-15 12:26:20',1);

INSERT INTO `cap_lk_os_type` VALUES (1,'WINDOWS',1,'2019-04-05 15:50:10',1),(2,'LINUX',1,'2019-03-15 12:26:20',1);

INSERT INTO `cap_lk_script_type` VALUES (1,'Powershell',1,'2019-03-15 12:26:20','PS1',1),(2,'Selenium Script',1,'2019-03-15 12:26:20','ZIP',1),(3,'Batch File',1,'2019-03-15 12:26:20','BAT',1),(4,'Ifea File',1,'2019-03-15 12:26:20','IFEA',1),(5,'Python',1,'2019-03-15 12:26:20','PY',1),(6,'C Sharp',1,'2019-03-15 12:26:20','CS',1);

INSERT INTO `cap_lk_workflow_type` VALUES (1,'STANDARD',1,'2019-03-15 12:26:20','2019-03-15 12:26:10',1),(2,'EXTRACTER',1,'2019-03-15 12:26:20','2019-03-15 12:26:10',1),(3,'CLASSIFIER',1,'2019-03-15 12:26:20','2019-03-15 12:26:10',1),(4,'RESOLVER',1,'2019-03-15 12:26:20','2019-03-15 12:26:10',1);


INSERT INTO `cap_schedule_detail` VALUES (1,'RUN IMMEDIATELY',1,'2019-03-15 12:26:20','2019-03-15 12:26:20','2019-03-15 12:26:20','2019-03-15 12:26:20','OneTime',1,'','','10:30:00',1,NULL,NULL,0,NULL,NULL);

INSERT INTO `cap_category_detail` VALUES (1,'GENERIC',1,'2019-03-15 12:26:20','2019-03-15 12:26:20',0,1,1,NULL);

INSERT INTO cap_xw_category_app_regex VALUES ('1', '1', '1', 1, '2019-09-19 15:46:51','', NULL, NULL);

INSERT INTO `cap_lk_role` VALUES (1,'SuperAdmin',1,'2019-03-15 12:26:20','2019-03-15 12:26:10',1),(2,'Admin',1,'2019-03-15 12:26:20','2019-03-15 12:26:10',1),(3,'User',1,'2019-03-15 12:26:20','2019-03-15 12:26:10',1);

INSERT INTO `cap_lk_license_type` VALUES (1,'BotSpecific',1,1,'2019-04-02 15:01:51'),(2,'ServerSpecific',1,1,'2019-04-02 15:01:51'),(3,'UserSpecific',1,1,'2019-04-02 15:01:51'),(4,'ServerUser',1,1,'2019-04-02 15:01:51');
