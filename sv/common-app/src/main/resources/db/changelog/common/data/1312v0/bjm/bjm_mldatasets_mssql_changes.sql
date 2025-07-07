-- mssql csv according
UPDATE mldataset 
SET attributes =
N'{"filter":"","mode":"query","Query":"SELECT seq.seq  MONTH, DATENAME(month, (CONCAT( DATENAME(YEAR, GETDATE()), ''-'', seq.seq, ''-01'')))  MONTH_NAME,YEAR(ji.start_time)  YEAR, COUNT(*)  FAILED_INSTANCE_COUNT FROM ( SELECT 1  seq UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 )  seq LEFT JOIN bjm_job_instance  ji ON seq.seq = MONTH(ji.start_time) WHERE ji.project_id = ({projectId}) AND ji.start_time >= ({startDate}) AND ji.start_time <= ({endDate}) AND ji.status IN (''Cancelled'',''failed'',''Failed'') GROUP BY  YEAR(ji.start_time),seq.seq","Cacheable":"false","isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''projectId'':''project_id'',''startDate'':''\\''2018-04-01\\'''' , ''endDate'':''(SELECT CURRENT_TIMESTAMP)''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm2_monthwise_failed_job_instances' ;

UPDATE mldataset 
SET attributes =N'{"filter":"","mode":"query","Query":"SELECT job_name JOB_NAME, running_job_instance_id JOB_INSTANCE_ID, status Status,  start_time Start_Time, end_time End_Time, datepart(MINUTE,CAST(end_time - start_time as Time)) Duration FROM bjm_job_instance WHERE  status IN (''Cancelled'',''failed'',''Failed'') AND project_id = ({projectId}) AND start_time BETWEEN ({startDate}) AND ({endDate})","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''projectId'':''project_id'',''startDate'':''\\''2018-04-01\\'''' , ''endDate'':''(SELECT CURRENT_TIMESTAMP)''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm2_Failed_Job_Instances_Name' ;

UPDATE mldataset 
SET attributes =
N'{"filter":"","mode":"query","Query":"SELECT job_name JOB_NAME, running_job_instance_id JOB_INSTANCE_ID, ISNULL(incident_no,''NA'') TICKET, start_time Start_Time, end_time End_Time, status Status, last_status_update Last_Status_Update FROM bjm_job_instance WHERE project_id=({projectId})  AND start_time BETWEEN ({startDate}) AND ({endDate}) AND running_job_instance_id IN (SELECT DISTINCT running_instance1_id FROM bjm_ji_ji_mapping WHERE project_id=({projectId}) and relation_name = ''precededBy'') ORDER BY last_status_update DESC  OFFSET 0 ROWS;","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''projectId'':''project_id'',''startDate'':''\\''2018-04-01\\'''' , ''endDate'':''(SELECT CURRENT_TIMESTAMP)''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm2_dependent_running_instances_detail' ;

UPDATE mldataset 
SET attributes =
N'{"filter":"","mode":"query","Query":"SELECT running_job_instance_id  RUNNING_JOB_INSTANCE_ID, ISNULL(datepart(MINUTE,CAST(end_time - start_time as Time)),0) DURATION FROM bjm_job_instance WHERE running_job_instance_id in (SELECT running_instance_id FROM bjm_ji_jig_mapping WHERE  job_instance_group_name = ({job_instance_group_name}) and project_id = ({projectId}));","Cacheable":"false","isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''projectId'':''project_id'',''job_instance_group_name'':''job_instance_group_name''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm2_GroupsTotalJobInstanceNames' ;

UPDATE mldataset 
SET attributes =
N'{"filter":"","mode":"query","Query":"SELECT round(avg(predicted_duration),0) AVG_PREDICTED_TIME  FROM bjm_job WHERE project_id = ({projectId})","Cacheable":"false","isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''projectId'':''project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm1_TotalJobAvgPredictedDuration' ;

UPDATE mldataset 
SET attributes =
 N'{"filter":"","mode":"query","Query":"SELECT avg(datepart(MINUTE,CAST(end_time - start_time as Time))) DURATION_SEC FROM bjm_job_instance WHERE project_id = ({projectId}) AND start_time BETWEEN ({startDate}) AND ({endDate});","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''projectId'':''project_id'',''startDate'':''\\''2018-04-01\\'''' , ''endDate'':''(SELECT CURRENT_TIMESTAMP)''} ","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm1_TotalJobAvgCompletionDuration' ;

UPDATE mldataset 
SET attributes =
N'{"filter":"","mode":"query","Query":"SELECT ISNULL(incident_no,''NA'') TICKETNO FROM bjm_job_instance  WHERE running_job_instance_id=({running_job_instance_id}) AND project_id={projectId}","Cacheable":"false","isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''running_job_instance_id'':''running_job_instance_id'',''projectId'':''project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_L3_FailedJobTicket' ;

UPDATE mldataset 
SET attributes =
 N'{"filter":"","mode":"query","Query":"SELECT job_name JOB_NAME, running_job_instance_id JOB_INSTANCE_ID, ISNULL(incident_no,''NA'') TICKET, status Status,  start_time Start_Time, end_time End_Time  FROM bjm_job_instance WHERE project_id = ({projectId}) and running_job_instance_id=({running_job_instance_id});","Cacheable":"false","isStreaming":"false","defaultValues":"","writeMode":"append","params":"{\"running_job_instance_id\":\"running_job_instance_id\",\"projectId\":\"project_id\"}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm3_ticket_details' ;

UPDATE mldataset 
SET attributes =
 N'{"filter":"","mode":"query","Query":"SELECT job_instance_group_name  GROUPNAME, count(job_name) NUMBER_OF_JOB_INSTANCES FROM bjm_ji_jig_mapping WHERE relation_name = ''belongsTo'' and project_id = ({projectId}) and job_name IN (SELECT job_name FROM bjm_job a WHERE a.source_name != ''Tivoli'') GROUP BY job_instance_group_name;","Cacheable":"false","isStreaming":"false","defaultValues":"","writeMode":"append","params":"{\"projectId\":\"project_id\"}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm1_Groupwise_count_of_Job_Instances' ;

UPDATE mldataset 
SET attributes =
 N'{"filter":"","mode":"query","Query":"SELECT job_name JOB_NAME , running_job_instance_id JOB_INSTANCE_ID,  ISNULL(incident_no,''NA'') TICKET, start_time Start_Time, end_time End_Time, datepart(MINUTE,CAST(end_time - start_time as Time)) DURATION_SEC, STATUS Status, CASE WHEN STATUS = ''Closed'' THEN ''lightGrey'' WHEN STATUS = ''Completed'' THEN ''LawnGreen'' WHEN STATUS = ''Cancelled'' THEN ''tomato'' WHEN STATUS = ''Yet to Start'' THEN ''PaleGoldenRod'' WHEN STATUS = ''Running'' THEN ''Yellow'' WHEN STATUS = ''succeeded'' THEN ''LawnGreen'' WHEN STATUS = ''failed'' THEN ''tomato'' WHEN STATUS = ''Failed'' THEN ''tomato'' WHEN STATUS IS NULL THEN ''tomato'' END AS \"Color\"  FROM bjm_job_instance WHERE project_id = ({projectId}) AND start_time BETWEEN ({startDate}) AND ({endDate});","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{\"endDate\":\"(SELECT CURRENT_TIMESTAMP)\",\"projectId\":\"project_id\",\"startDate\":\"''2018-04-01''\"}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm1_Table_data' ;

UPDATE mldataset 
SET attributes =
N'{"filter":"","mode":"query","Query":"SELECT Lvl, StartNode, EndNode, StartTime, EndTime, PredictedTime FROM (;WITH child_jobs AS (   SELECT  1 Lvl, j.running_instance2_id StartNode , j.running_instance1_id EndNode, ji.start_time StartTime, ji.end_time EndTime, ji.predicted_end_time PredictedTime , ji.project_id Project  FROM bjm_ji_ji_mapping j ,bjm_job_instance ji      WHERE ji.running_job_instance_id = j.running_instance2_id   AND ji.project_id = ({projectId})  AND j.running_instance2_id IN  ( SELECT DISTINCT ji_jig.running_instance_id           FROM  bjm_ji_jig_mapping ji_jig           WHERE job_instance_Group_name IN (SELECT ji_jig.job_instance_Group_name                 FROM bjm_job_instance ji , bjm_ji_jig_mapping ji_jig                 WHERE ji_jig.running_instance_id  = ji.running_job_instance_id                 AND ji.running_job_instance_id = ''JobX2_2''                  AND ji.project_id = ({projectId})) )     UNION ALL   (SELECT cj.Lvl + 1 Lvl, j2.running_instance2_id StartNode ,j2.running_instance1_id EndNode,             ji2.start_time StartTime,       ji2.end_time EndTime,  ji2.predicted_end_time PredictedTime , ji2.project_id Project   FROM bjm_ji_ji_mapping j2 , child_jobs cj, bjm_job_instance ji2      WHERE ji2.running_job_instance_id = j2.running_instance2_id    AND j2.running_instance2_id = cj.EndNode    AND ji2.project_id=cj.Project ))  SELECT DISTINCT Lvl, StartNode, EndNode,  StartTime, EndTime, PredictedTime FROM child_jobs ) as data","Cacheable":"false","isStreaming":"false","defaultValues":"","writeMode":"append","params":"{\"running_job_instance_id\":\"42\",\"projectId\":\"ji.project_id\"}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm3_NetworkGraph' ;

UPDATE mldataset 
SET attributes =N'{"filter":"","mode":"query","Query":"SELECT job_name JOB_NAME, isnull(predicted_duration,0)  DURATION_SEC FROM bjm_job WHERE project_id =  ({projectId});","Cacheable":"false","isStreaming":"false","defaultValues":"","writeMode":"append","params":"{\"projectId\":\"project_id\"}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm1_JobPredictedDuration' ;

UPDATE mldataset 
SET attributes =N'{"filter":"","mode":"query","Query":"SELECT job_name JOB_NAME, isnull(round(avg(datepart(MINUTE,CAST(end_time - start_time as Time))),0),0)  DURATION_SEC FROM bjm_job_instance WHERE project_id = ({projectId}) GROUP BY job_name","Cacheable":"false","isStreaming":"false","defaultValues":"","writeMode":"append","params":"{\"projectId\":\"project_id\"}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'NGAcme_bjm1_JobActualDuration' ;

UPDATE mldataset 
SET attributes =N'{"filter":"","mode":"query","Query":"SELECT status STATUS, count(running_job_instance_id) COUNT_JOB_INSTANCE FROM bjm_job_instance WHERE  project_id = ({projectId}) and job_name = ({job_name}) GROUP BY status","Cacheable":"false","isStreaming":"false","defaultValues":"","writeMode":"append","params":"{\"job_name\":\"job_name\",\"projectId\":\"project_id\"}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm2_StatuswiseJobInstancesCount' ;

UPDATE mldataset 
SET attributes =
 N'{"filter":"","mode":"query","Query":"SELECT ''On Time''  STATE, count(running_job_instance_id)  COUNT_JOB_INSTANCES FROM bjm_job_instance WHERE job_name = ({job_name}) AND project_id = ({projectId})AND datepart(MINUTE,CAST(end_time - start_time as Time)) is null UNION ALL SELECT ''Before Time''  STATE, count(running_job_instance_id)  COUNT_JOB_INSTANCES FROM bjm_job_instance WHERE job_name = ({job_name}) AND project_id = ({projectId})AND datepart(MINUTE,CAST(end_time - start_time as Time)) < 0UNION ALL SELECT ''Delayed'' STATE, count(running_job_instance_id)  COUNT_JOB_INSTANCES FROM bjm_job_instance WHERE job_name = ({job_name})AND project_id = ({projectId})AND datepart(MINUTE,CAST(end_time - start_time as Time)) > 0 ","Cacheable":"false","isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''job_name'':''job_name'',''projectId'':''project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm2_Statewise_Job_Instances_Count' ;

UPDATE mldataset 
SET attributes =
 N'{"filter":"","mode":"query","Query":"SELECT running_job_instance_id JOB_INSTANCE_ID, job_name JOB_NAME, start_time+''5:30:00'' Start_Time, end_time+''5:30:00'' End_Time  FROM bjm_job_instance WHERE job_name = ({job_name}) and project_id = ({projectId});","Cacheable":"false","isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''job_name'':''job_name'', ''projectId'':''project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm2_Job_Instance_table_data' ;

UPDATE mldataset 
SET attributes =
N'{"filter":"","mode":"query","Query":"SELECT job_name JOB_NAME, running_job_instance_id JOB_INSTANCE_ID,   datepart(MINUTE,CAST(end_time - start_time as Time)) DURATION_SEC, STATUS , start_time Start_Time,  end_time End_Time    FROM bjm_job_instance jiParent   WHERE jiParent.job_name IN  ( SELECT job_name           FROM  bjm_job_instance  jiChild                            WHERE  jiChild.running_job_instance_id = ({running_job_instance_id})          AND jiChild.project_id = ({projectId}) ) AND jiParent.start_time <  (SELECT start_time       FROM  bjm_job_instance  jiChild                        WHERE  jiChild.running_job_instance_id = ({running_job_instance_id})      AND jiChild.project_id = ({projectId}))  ORDER BY start_time DESC OFFSET 0 ROWS;","Cacheable":"false","isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''running_job_instance_id'':''jiChild.running_job_instance_id'',''projectId'':''jiChild.project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_L3_PastJobInstance_Details' ;

UPDATE mldataset 
SET attributes =
N'{"filter":"","mode":"query","Query":"WITH RECURSIVE parent_jobs AS    ((  SELECT  j.running_instance2_id startNode,   j.running_instance1_id endNode  FROM bjm_ji_ji_mapping j      WHERE j.running_instance1_id = ({running_job_instance_id})  AND j.project_id = ({projectId}) )  UNION DISTINCT    SELECT      j2.running_instance2_id  startNode,     j2.running_instance1_id  endNode  FROM bjm_ji_ji_mapping j2 , parent_jobs pj   WHERE j2.running_instance1_id = pj.startNode )            SELECT endNode, COUNT(*) COUNT_PREDECCESSORS FROM parent_jobs;","Cacheable":"false","isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''running_job_instance_id'':''j.running_instance1_id'',''projectId'':''j.project_id ''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_L3_CountPredecessors' ;


UPDATE mldataset 
SET attributes =N'{"filter":"","mode":"query","Query":"WITH RECURSIVE child_jobs AS  ((    SELECT j.running_instance1_id  startNode,   j.running_instance2_id  endNode    FROM bjm_ji_ji_mapping j     WHERE j.running_instance2_id = ({running_job_instance_id}) AND j.project_id = ({projectId}) )          UNION DISTINCT SELECT    j2.running_instance1_id startNode,      j2.running_instance2_id  endNode      FROM bjm_ji_ji_mapping j2 , child_jobs cj WHERE j2.running_instance2_id = cj.startNode )       SELECT endNode, COUNT(*) COUNT_SUCCESSORS               FROM child_jobs;","Cacheable":"false","isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''running_job_instance_id'':''j.running_instance2_id'',''projectId'':''j.project_id ''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_L3_CountSuccessors' ;

UPDATE mldataset 
SET attributes =
 N'{"filter":"","mode":"query","Query":"SELECT job_name JOB_NAME, running_job_instance_id JOB_INSTANCE_ID,   datepart(MINUTE,CAST(end_time - start_time as Time)) DURATION_SEC, STATUS , start_time Start_Time,  end_time End_Time  FROM bjm_job_instance jiParent   WHERE jiParent.job_name IN (SELECT job_name      FROM  bjm_job_instance  jiChild     WHERE jiChild.running_job_instance_id = ({running_job_instance_id})      AND jiChild.project_id = ({projectId}) ) AND jiParent.start_time > ( SELECT start_time      FROM  bjm_job_instance  jiChild      WHERE  jiChild.running_job_instance_id = ({running_job_instance_id})      AND jiChild.project_id = ({projectId}) ) ORDER BY start_time ASC OFFSET 0 ROWS;","Cacheable":"false","isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''running_job_instance_id'':''jiChild.running_job_instance_id'',''project_id'':''jiChild.project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_L3_FutureJobInstance_Details' ;


UPDATE mldataset 
SET attributes =
 N'{"filter":"","mode":"query","Query":"SELECT Lvl, StartNode , EndNode, StartTime,EndTime, PredictedTimeFROM (;WITH parent_jobs AS (  SELECT 1 Lvl, j.running_instance2_id StartNode, j.running_instance1_id EndNode, ji.start_time StartTime, ji.end_time EndTime, ISNULL(ji.predicted_start_time,ji.start_time) PredictedTime , ji.project_id Project  FROM bjm_ji_ji_mapping j ,bjm_job_instance ji WHERE ji.running_job_instance_id = j.running_instance1_id  AND ji.project_id = 2AND j.running_instance1_id = ''JobX2_2'' UNION ALL  SELECT pj.Lvl + 1 Lvl, j2.running_instance2_id StartNode ,j2.running_instance1_id EndNode, ji2.start_time StartTime, ji2.end_time EndTime, ISNULL(ji2.predicted_start_time,ji2.start_time) PredictedTime, ji2.project_id Project FROM bjm_ji_ji_mapping j2 , parent_jobs pj, bjm_job_instance ji2WHERE ji2.running_job_instance_id = j2.running_instance1_id AND j2.running_instance1_id = pj.StartNode AND ji2.project_id=pj.Project) SELECT DISTINCT Lvl, StartNode , EndNode, StartTime,EndTime, PredictedTime FROM parent_jobs) AS DATA","Cacheable":"false","isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''running_job_instance_id'':''running_job_instance_id'',''projectId'':''2''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_L3_PredecessorNetworkGraph' ;

UPDATE mldataset 
SET attributes =N'{"filter":"","mode":"query","Query":"SELECT Lvl, StartNode , EndNode, StartTime,EndTime, PredictedTimeFROM (;WITH child_jobs AS (  SELECT 1 Lvl, j.running_instance2_id StartNode, j.running_instance1_id EndNode, ji.start_time StartTime, ji.end_time EndTime, ISNULL(ji.predicted_start_time,ji.start_time) PredictedTime , ji.project_id Project  FROM bjm_ji_ji_mapping j ,bjm_job_instance ji  WHERE ji.running_job_instance_id = j.running_instance2_id  AND ji.project_id = ({projectId})AND j.running_instance2_id = ({running_job_instance_id}) UNION ALL  SELECT cj.Lvl + 1 Lvl, j2.running_instance2_id StartNode,j2.running_instance1_id EndNode, ji2.start_time StartTime, ji2.end_time EndTime, ISNULL(ji2.predicted_start_time,ji2.start_time) PredictedTime , ji2.project_id Project FROM bjm_ji_ji_mapping j2 , child_jobs cj, bjm_job_instance ji2WHERE ji2.running_job_instance_id = j2.running_instance2_id AND j2.running_instance2_id = cj.EndNode AND ji2.project_id=cj.Project) ","Cacheable":"false","isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''running_job_instance_id'':''j2.running_job_instance2_id'',''projectId'':''ji.project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_L3_SuccessorNetworkGraph' ;

--same as mysql 13
UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"SELECT COUNT(*) COUNT_JOB_INSTANCE_GROUP FROM bjm_job_instance_group WHERE project_id = ({projectId});","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''projectId'':''project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm1_Total_Groups' ;

UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"SELECT COUNT(*) COUNT_JOB FROM bjm_job WHERE project_id = ({projectId});","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''projectId'':''project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm1_Total_Jobs' ;

UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"SELECT count(job_name) TOTAL_JOBS FROM bjm_ji_jig_mapping WHERE project_id = ({projectId}) AND job_instance_group_name = ({job_instance_group_name});","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''projectId'':''project_id'',''job_instance_group_name'':''job_instance_group_name''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm2_GroupsTotalJobs' ;

UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"SELECT count(running_instance_id)  TOTAL_JOB_INSTANCES FROM bjm_ji_jig_mapping WHERE project_id = ({projectId}) AND job_instance_group_name = ({job_instance_group_name});","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''projectId'':''project_id'',''job_instance_group_name'':''job_instance_group_name''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm2_GroupsTotalJobInstances' ;


--NGAcme_bjm1_Total_Job_Instances modified
UPDATE mldataset 
SET attributes =  N'{"filter":"","mode":"query","Query":"SELECT COUNT(*) COUNT_JOB_INSTANCE FROM bjm_job_instance WHERE project_id = ({projectId}) AND start_time BETWEEN ({startDate}) AND ({endDate});","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{\"endDate\":\"(SELECT CURRENT_TIMESTAMP)\",\"projectId\":\"3\",\"startDate\":\"''2018-04-01''\"}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'NGAcme_bjm1_Total_Job_Instances' ;


UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"SELECT COUNT(DISTINCT running_instance1_id)  COUNT_DEPENDENT_JOB_INSTANCE FROM  bjm_ji_ji_mapping WHERE relation_name = ''precededBy'' and project_id = ({projectId});","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''projectId'':''project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'NGAcme_bjm1_Total_dependent_job_Instances' ;

UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"SELECT status STATUS FROM bjm_job_instance  WHERE running_job_instance_id = ({running_job_instance_id}) AND project_id = ({projectId})","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''running_job_instance_id'':''running_job_instance_id'',''projectId'':''project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_L3_JobInstance_Status' ;

--Acme_bjm1_scheduled_jobs modified
UPDATE mldataset 
SET attributes = N'{"filter":"","mode":"query","Query":"SELECT COUNT(*) as \"SCHEDULED_JOBS\" FROM (SELECT job_name FROM bjm_job_instance WHERE project_id=({projectId}) and start_time between ({startDate}) and ({endDate}) AND instance_extra2=''scheduled'' GROUP BY job_name) AS temp","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{\"endDate\":\"(SELECT CURRENT_TIMESTAMP)\",\"projectId\":\"project_id\",\"startDate\":\"''2018-04-01''\"}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm1_scheduled_jobs' ;

--Acme_L3_JobInstanceStartTime modified
UPDATE mldataset 
SET attributes =
 N'{"filter":"","mode":"query","Query":"SELECT start_time START_TIME FROM bjm_job_instance WHERE running_job_instance_id = ({running_job_instance_id}) AND project_id = ({projectId});\n","Cacheable":"false","isStreaming":"false","defaultValues":"","writeMode":"append","params":"{\"running_job_instance_id\":\"running_job_instance_id\",\"projectId\":\"project_id\"}","tableName":"","uniqueIdentifier":""}'
 WHERE ALIAS = 'Acme_L3_JobInstanceStartTime' ;

--Acme_bjm1_TotalFailedJobInstances modified

UPDATE mldataset 
SET attributes =N'{"filter":"","mode":"query","Query":"SELECT COUNT(*)  COUNT_FAILED_JOB_INSTANCE FROM bjm_job_instance WHERE STATUS IN (''Cancelled'',''failed'',''Failed'') AND project_id = ({projectId})  AND start_time BETWEEN ({startDate}) AND ({endDate});","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''projectId'':''project_id'',''startDate'':''\\''2018-04-01\\'''' , ''endDate'':''(SELECT CURRENT_TIMESTAMP)''}","tableName":"","uniqueIdentifier":""}'
 WHERE ALIAS = 'Acme_bjm1_TotalFailedJobInstances' ;

UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"SELECT end_time END_TIME FROM bjm_job_instance WHERE running_job_instance_id = ({running_job_instance_id}) AND project_id = ({projectId});","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''running_job_instance_id'':''running_job_instance_id'',''projectId'':''project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_L3_JobInstance_EndTime' ;



UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"SELECT job_instance_group_name GROUPNAME FROM bjm_ji_jig_mapping WHERE running_instance_id =  ({running_job_instance_id}) AND project_id = ({projectId});","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''running_job_instance_id'':''running_instance_id'',''projectId'':''project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_L3_JobInstanceGroupName' ;

--Acme_bjm1_Jobwise_count_of_Job_Instances modified

UPDATE mldataset 
SET attributes = N'{"filter":"","mode":"query","Query":"SELECT job_name JOB_NAME, count(running_job_instance_id) COUNT_JOB_INSTANCE FROM bjm_job_instance  WHERE project_id = ({projectId})\nAND start_time BETWEEN ({startDate}) AND ({endDate}) AND job_name IN (SELECT job_name FROM bjm_job a WHERE a.source_name != ''Tivoli'') \nGROUP BY job_name","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''projectId'':''2'',''startDate'':''\\''2018-04-01\\'''' , ''endDate'':''(SELECT CURRENT_TIMESTAMP)''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_L3_JobInstanceGroupName' ;







