--  *********************************************************************
--  Update Database Script
--  *********************************************************************
--  Change Log: db/changelog/master.xml
--  Ran at: 7/13/22, 1:37 PM
--  Against: null@offline:mysql?
--  Liquibase version: 4.12.0
--  *********************************************************************

--  Changeset db/changelog/sre/sre.xml::1614785155891-82::essedum (generated)
CREATE TABLE sre_app_availability (application_id INT NOT NULL, availability_date date NOT NULL, location_id INT NOT NULL, probe_id INT NOT NULL, application_grp_id INT NOT NULL, application_grp_name VARCHAR(256) NOT NULL, application_name VARCHAR(256) NOT NULL, last_updated datetime(6) NULL, location_name TEXT NOT NULL, perc_availability DOUBLE NOT NULL, probe_name VARCHAR(256) NOT NULL, success_runs INT NOT NULL, total_runs INT NOT NULL);

--  Changeset db/changelog/sre/sre.xml::1614785155891-83::essedum (generated)
CREATE TABLE sre_app_downtime (id INT AUTO_INCREMENT NOT NULL, active BIT(1) NOT NULL, end_day VARCHAR(45) NULL, end_time datetime(6) NULL, pattern TEXT NOT NULL, start_day VARCHAR(45) NULL, start_time datetime(6) NULL, probe_id INT NOT NULL, CONSTRAINT PK_SRE_APP_DOWNTIME PRIMARY KEY (id));

--  Changeset db/changelog/sre/sre.xml::1614785155891-84::essedum (generated)
CREATE TABLE sre_app_txn_availability (id INT AUTO_INCREMENT NOT NULL, isavailable TINYINT(1) NOT NULL, run_timestamp TIMESTAMP(6) NOT NULL, application_id INT NULL, transaction_id INT NULL, CONSTRAINT PK_SRE_APP_TXN_AVAILABILITY PRIMARY KEY (id));

--  Changeset db/changelog/sre/sre.xml::1614785155891-85::essedum (generated)
CREATE TABLE sre_location (location_id INT AUTO_INCREMENT NOT NULL, location_name VARCHAR(255) NOT NULL, project_id INT NULL, CONSTRAINT PK_SRE_LOCATION PRIMARY KEY (location_id));

--  Changeset db/changelog/sre/sre.xml::1614785155891-86::essedum (generated)
CREATE TABLE sre_probe (probe_id INT AUTO_INCREMENT NOT NULL, citrix TINYINT(1) NOT NULL, `description` VARCHAR(256) NOT NULL, environment VARCHAR(256) NOT NULL, execution_machine VARCHAR(256) NULL, failure_in_any_region BIT(1) NULL, failure_threshold INT NULL, is_enabled TINYINT(4) NULL, operating_sys VARCHAR(256) NOT NULL, probe_frequency INT NULL, probe_name VARCHAR(256) NULL, probe_url VARCHAR(256) NULL, version VARCHAR(256) NOT NULL, application_id INT NULL, CONSTRAINT PK_SRE_PROBE PRIMARY KEY (probe_id));

--  Changeset db/changelog/sre/sre.xml::1614785155891-87::essedum (generated)
CREATE TABLE sre_probe_location (id INT AUTO_INCREMENT NOT NULL, is_enabled TINYINT(4) NULL, location_id INT NULL, probe_id INT NULL, CONSTRAINT PK_SRE_PROBE_LOCATION PRIMARY KEY (id));

--  Changeset db/changelog/sre/sre.xml::1614785155891-88::essedum (generated)
CREATE TABLE sre_probe_run_app (probe_run_app_id INT AUTO_INCREMENT NOT NULL, is_aborted TINYINT(1) NULL, is_available TINYINT(1) NULL, workflow_id INT NULL, run_id INT NULL, execution_id INT NULL, probe_loc_run_id INT NULL, mapping_id INT NULL, error_data LONGTEXT NULL, run_date date NOT NULL, run_date_est date NOT NULL, run_description LONGTEXT NOT NULL, run_end_time time NOT NULL, run_result TINYINT(1) NOT NULL, run_start_time time NOT NULL, run_time FLOAT(12) NULL, sut VARCHAR(256) NOT NULL, application_id INT NULL, location_id INT NULL, probe_id INT NULL, CONSTRAINT PK_SRE_PROBE_RUN_APP PRIMARY KEY (probe_run_app_id));

--  Changeset db/changelog/sre/sre.xml::1614785155891-89::essedum (generated)
CREATE TABLE sre_probe_run_app_txn (probe_run_app_txn_run_id INT AUTO_INCREMENT NOT NULL, probe_id INT NOT NULL, run_date timestamp NOT NULL, run_date_est timestamp NOT NULL, run_description VARCHAR(256) NOT NULL, run_end_time timestamp NOT NULL, run_result BIT(1) NOT NULL, run_start_time timestamp NOT NULL, run_time FLOAT(12) NULL, application_id INT NULL, probe_run_app_id INT NULL, transaction_id INT NULL, CONSTRAINT PK_SRE_PROBE_RUN_APP_TXN PRIMARY KEY (probe_run_app_txn_run_id));

--  Changeset db/changelog/sre/sre.xml::1614785155891-90::essedum (generated)
CREATE TABLE sre_probe_run_rundetails (probe_run_trans_details_Id INT AUTO_INCREMENT NOT NULL, probe_run_eststependdate datetime(6) NULL, probe_run_eststepstartdate datetime(6) NULL, probe_run_step_status CHAR(1) NULL, probe_run_stepdiff FLOAT(12) NULL, probe_run_stependdate datetime(6) NULL, probe_run_stepName VARCHAR(255) NULL, probe_run_stepstartdate datetime(6) NULL, sequence_number INT NULL, probe_run_trans_Id INT NULL, CONSTRAINT PK_SRE_PROBE_RUN_RUNDETAILS PRIMARY KEY (probe_run_trans_details_Id));

--  Changeset db/changelog/sre/sre.xml::1614785155891-91::essedum (generated)
CREATE TABLE sre_alerting_details (id INT AUTO_INCREMENT NOT NULL, application_id INT NULL, probe_id INT NULL, snow_ci VARCHAR(765) NULL, snow_queue VARCHAR(765) NULL, snow_impact VARCHAR(256) NULL, snow_category VARCHAR(256) NULL, snow_subcategory VARCHAR(256) NULL, snow_incident_type VARCHAR(256) NULL, ticket_alert TINYINT(1) NULL, email_alert TINYINT(1) NULL, to_email_address TEXT NULL, from_email_address VARCHAR(256) NULL, short_description VARCHAR(256) NULL, `description` VARCHAR(256) NULL, contact_type VARCHAR(256) NULL, urgency VARCHAR(256) NULL, configuration_item VARCHAR(256) NULL, assignment_group VARCHAR(256) NULL, business_Service VARCHAR(256) NULL, service_offering VARCHAR(256) NULL, problem_type VARCHAR(256) NULL, location VARCHAR(256) NULL, caller VARCHAR(256) NULL, application_email_address VARCHAR(256) NULL, CONSTRAINT PK_SRE_ALERTING_DETAILS PRIMARY KEY (id));

--  Changeset db/changelog/sre/sre.xml::1614785155891-92::essedum (generated)
CREATE TABLE sre_alerting_exclusion (sre_alerting_exclusion_id INT AUTO_INCREMENT NOT NULL, sre_exclusion_level VARCHAR(20) NOT NULL, sre_exclusion_id INT NOT NULL, sre_alerting_act_ind TINYINT(1) NOT NULL, sre_alerting_last_updated_dts datetime NULL, sre_last_updated_by INT NOT NULL, sre_expiry_time datetime NULL, sre_isprocessed TINYINT(1) NULL, CONSTRAINT PK_SRE_ALERTING_EXCLUSION PRIMARY KEY (sre_alerting_exclusion_id));

--  Changeset db/changelog/sre/sre.xml::1614785155891-93::essedum (generated)
CREATE TABLE sre_servers (id INT AUTO_INCREMENT NOT NULL, location_id INT NULL, server_name VARCHAR(255) NULL, CONSTRAINT PK_SRE_SERVERS PRIMARY KEY (id));

--  Changeset db/changelog/sre/sre.xml::1614785155891-94::essedum (generated)
CREATE TABLE sre_probe_location_run_data (id INT AUTO_INCREMENT NOT NULL, probe_id INT NULL, location_id INT NULL, isAvailable TINYINT(4) NULL, lastrun_timestamp datetime NULL, workflow_name VARCHAR(765) NULL, isMailSent TINYINT(4) NULL, isTicketRaised TINYINT(4) NULL, TicketId VARCHAR(135) NULL, CONSTRAINT PK_SRE_PROBE_LOCATION_RUN_DATA PRIMARY KEY (id));

--  Changeset db/changelog/sre/sre.xml::1312v0-sre-1::essedum
CREATE TABLE sre_ci_metadata (id INT AUTO_INCREMENT NOT NULL, ci_id VARCHAR(100) NULL, ci_name VARCHAR(100) NULL, display_name VARCHAR(100) NULL, ci_type VARCHAR(100) NULL, apm_type VARCHAR(100) NULL, ci_status VARCHAR(100) NULL, os_type VARCHAR(100) NULL, cpu_cores INT NULL, ip_address VARCHAR(100) NULL, application_type VARCHAR(100) NULL, service_type VARCHAR(100) NULL, technology_type VARCHAR(100) NULL, ci_host_group VARCHAR(100) NULL, ci_last_updated timestamp NULL, project_id INT NOT NULL, CONSTRAINT PK_SRE_CI_METADATA PRIMARY KEY (id), UNIQUE (ci_name));

--  Changeset db/changelog/sre/sre.xml::1312v0-sre-2::essedum
CREATE TABLE sre_correlation (id INT AUTO_INCREMENT NOT NULL, issueId VARCHAR(200) NULL, eventId VARCHAR(200) NULL, rootCauseEntity VARCHAR(200) NULL, incidentId VARCHAR(200) NULL, apm_type VARCHAR(100) NULL, project_id INT NULL, CONSTRAINT PK_SRE_CORRELATION PRIMARY KEY (id));

--  Changeset db/changelog/sre/sre.xml::1312v0-sre-3::essedum
CREATE TABLE sre_metrics (id INT AUTO_INCREMENT NOT NULL, ci_name VARCHAR(100) NULL, ctype VARCHAR(30) NULL, startTime VARCHAR(20) NULL, endTime VARCHAR(20) NULL, occurrences BIGINT NULL, current INT NULL, min INT NULL, max INT NULL, count BIGINT NULL, standardDeviation INT NULL, sum BIGINT NULL, metricValueFinal FLOAT(12) NULL, metricValue FLOAT(12) NULL, metricType VARCHAR(100) NULL, project_id INT NOT NULL, metricPath VARCHAR(100) NULL, apiType VARCHAR(50) NULL, dashboardType VARCHAR(30) NULL, apmType VARCHAR(10) NOT NULL, `description` VARCHAR(100) NULL, CONSTRAINT PK_SRE_METRICS PRIMARY KEY (id));

--  Changeset db/changelog/sre/sre.xml::1312v0-sre-4::essedum
CREATE TABLE sre_event (id INT AUTO_INCREMENT NOT NULL, eventId VARCHAR(200) NOT NULL, displayId VARCHAR(200) NULL, title VARCHAR(200) NULL, eventType VARCHAR(50) NOT NULL, impactLevel VARCHAR(200) NULL, severityLevel VARCHAR(200) NULL, status VARCHAR(10) NULL, rootCauseEntity VARCHAR(100) NULL, relatedEvents VARCHAR(5000) NULL, startTime VARCHAR(100) NULL, endTime VARCHAR(100) NULL, lastUpdated timestamp NULL, lastCreated timestamp NULL, apmType VARCHAR(100) NOT NULL, deepLinkUrl VARCHAR(200) NULL, incidentId VARCHAR(100) NULL, project_id INT NOT NULL, CONSTRAINT PK_SRE_EVENT PRIMARY KEY (id, eventId), UNIQUE (eventId));

