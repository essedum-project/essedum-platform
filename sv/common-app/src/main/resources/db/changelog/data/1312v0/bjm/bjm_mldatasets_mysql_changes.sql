UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"SELECT COUNT(*) COUNT_JOB_INSTANCE_GROUP FROM bjm_job_instance_group WHERE project_id = ({projectId});","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''projectId'':''project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm1_Total_Groups' ;

UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"SELECT COUNT(*) COUNT_JOB FROM bjm_job WHERE project_id = ({projectId});","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''projectId'':''project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm1_Total_Jobs' ;

UPDATE mldataset
SET attributes =
'{\"filter\":\"\",\"mode\":\"query\",\"Query\":\"SELECT COUNT(*) COUNT_JOB_INSTANCE FROM bjm_job_instance WHERE project_id = ({projectId}) AND start_time BETWEEN ({startDate}) AND ({endDate});\",\"Cacheable\":false,\"isStreaming\":\"false\",\"defaultValues\":\"\",\"writeMode\":\"append\",\"params\":\"{\'projectId\':\'project_id\',\'startDate\':\'\\\\\'2018-04-01\\\\\'\' , \'endDate\':\'(SELECT CURRENT_TIMESTAMP)\'}\",\"tableName\":\"\",\"uniqueIdentifier\":\"\"}'
WHERE ALIAS = 'NGAcme_bjm1_Total_Job_Instances' ;



UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"SELECT COUNT(DISTINCT running_instance1_id)  COUNT_DEPENDENT_JOB_INSTANCE FROM  bjm_ji_ji_mapping WHERE relation_name = ''precededBy'' and project_id = ({projectId});","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''projectId'':''project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'NGAcme_bjm1_Total_dependent_job_Instances' ;


UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"SELECT IFNULL(round(avg(predicted_duration),0),0)  AVG_PREDICTED_TIME  FROM bjm_job WHERE project_id = ({projectId})","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''projectId'':''project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm1_TotalJobAvgPredictedDuration' ;

UPDATE mldataset 
SET attributes ='{\"filter\":\"\",\"mode\":\"query\",\"Query\":\"SELECT  ROUND(AVG(TIMESTAMPDIFF(MINUTE, start_time, end_time)),0)   DURATION_SEC FROM bjm_job_instance WHERE  project_id = ({projectId}) AND start_time BETWEEN ({startDate}) AND ({endDate})\",\"Cacheable\":false,\"isStreaming\":\"false\",\"defaultValues\":\"\",\"writeMode\":\"append\",\"params\":\"{\'projectId\':\'project_id\',\'startDate\':\'\\\\\'2018-04-01\\\\\'\' , \'endDate\':\'(SELECT CURRENT_TIMESTAMP)\'} \",\"tableName\":\"\",\"uniqueIdentifier\":\"\"}'
WHERE ALIAS = 'Acme_bjm1_TotalJobAvgCompletionDuration' ;

UPDATE mldataset 
SET attributes ='{\"filter\":\"\",\"mode\":\"query\",\"Query\":\"SELECT COUNT(*) as \\\"SCHEDULED_JOBS\\\" FROM (SELECT job_name FROM bjm_job_instance WHERE project_id=({projectId}) and start_time between ({startDate}) and ({endDate}) AND instance_extra2=\'scheduled\' GROUP BY job_name) AS temp\",\"Cacheable\":false,\"isStreaming\":\"false\",\"defaultValues\":\"\",\"writeMode\":\"append\",\"params\":\"{\'projectId\':\'project_id\',\'startDate\':\'\\\\\'2018-04-01\\\\\'\' , \'endDate\':\'(SELECT CURRENT_TIMESTAMP)\'}\",\"tableName\":\"\",\"uniqueIdentifier\":\"\"}'
WHERE ALIAS = 'Acme_bjm1_scheduled_jobs' ;


UPDATE mldataset 
SET attributes ='{\"filter\":\"\",\"mode\":\"query\",\"Query\":\"SELECT COUNT(*)  COUNT_FAILED_JOB_INSTANCE FROM bjm_job_instance WHERE STATUS IN (\'Cancelled\',\'failed\',\'Failed\') AND project_id = ({projectId})  AND start_time BETWEEN ({startDate}) AND ({endDate});\",\"Cacheable\":false,\"isStreaming\":\"false\",\"defaultValues\":\"\",\"writeMode\":\"append\",\"params\":\"{\'projectId\':\'project_id\',\'startDate\':\'\\\\\'2018-04-01\\\\\'\' , \'endDate\':\'(SELECT CURRENT_TIMESTAMP)\'}\",\"tableName\":\"\",\"uniqueIdentifier\":\"\"}'
WHERE ALIAS = 'Acme_bjm1_TotalFailedJobInstances' ;

UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"SELECT job_instance_group_name  GROUPNAME, count(job_name) NUMBER_OF_JOB_INSTANCES FROM bjm_ji_jig_mapping WHERE relation_name = ''belongsTo'' AND project_id = ({projectId}) AND job_name IN (SELECT job_name FROM bjm_job a WHERE a.source_name != ''Tivoli'') GROUP BY job_instance_group_name  ORDER BY job_instance_group_name desc","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''projectId'':''project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm1_Groupwise_count_of_Job_Instances' ;

UPDATE mldataset 
SET attributes ='{\"filter\":\"\",\"mode\":\"query\",\"Query\":\"SELECT job_name JOB_NAME, count(running_job_instance_id) COUNT_JOB_INSTANCE FROM bjm_job_instance  WHERE project_id = ({projectId})\\nAND start_time BETWEEN ({startDate}) AND ({endDate}) AND job_name IN (SELECT job_name FROM bjm_job a WHERE a.source_name != \'Tivoli\') \\nGROUP BY job_name\",\"Cacheable\":false,\"isStreaming\":\"false\",\"defaultValues\":\"\",\"writeMode\":\"append\",\"params\":\"{\'projectId\':\'project_id\',\'startDate\':\'\\\\\'2018-04-01\\\\\'\' , \'endDate\':\'(SELECT CURRENT_TIMESTAMP)\'}\",\"tableName\":\"\",\"uniqueIdentifier\":\"\"}'
WHERE ALIAS = 'Acme_bjm1_Jobwise_count_of_Job_Instances' ;

UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"SELECT job_name JOB_NAME, ifnull(predicted_duration,0)  DURATION_SEC  FROM bjm_job  WHERE project_id =  ({projectId})","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''projectId'':''project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm1_JobPredictedDuration' ;

UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"SELECT job_name JOB_NAME, ifnull(round(avg(timestampdiff(Minute, start_time, end_time)),0),0)  DURATION_SEC  FROM bjm_job_instance  WHERE project_id = ({projectId}) GROUP BY job_name","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''projectId'':''project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'NGAcme_bjm1_JobActualDuration' ;

UPDATE mldataset 
SET attributes ='{\"filter\":\"\",\"mode\":\"query\",\"Query\":\"SELECT job_name JOB_NAME , running_job_instance_id JOB_INSTANCE_ID, IFNULL(incident_no,\'NA\') TICKET, start_time Start_Time, end_time End_Time, TIMESTAMPDIFF(SECOND,start_time,end_time) DURATION_SEC, STATUS Status, CASE WHEN STATUS = \'Closed\' THEN \'lightGrey\'                            WHEN STATUS = \'Completed\' THEN \'LawnGreen\' WHEN STATUS = \'Cancelled\' THEN \'tomato\' WHEN STATUS = \'Yet to Start\' THEN \'PaleGoldenRod\' WHEN STATUS = \'Running\' THEN \'Yellow\' WHEN STATUS = \'succeeded\' THEN \'LawnGreen\' WHEN STATUS = \'failed\' THEN \'tomato\' WHEN STATUS = \'Failed\' THEN \'tomato\' WHEN STATUS IS NULL THEN \'tomato\' END AS Color FROM bjm_job_instance WHERE project_id = ({projectId}) AND start_time BETWEEN  ({startDate}) AND  ({endDate})\",\"Cacheable\":false,\"isStreaming\":\"false\",\"defaultValues\":\"\",\"writeMode\":\"append\",\"params\":\"{\'projectId\':\'project_id\',\'startDate\':\'\\\\\'2018-04-01\\\\\'\' , \'endDate\':\'(SELECT CURRENT_TIMESTAMP)\'}\",\"tableName\":\"\",\"uniqueIdentifier\":\"\"}'
WHERE ALIAS = 'Acme_bjm1_Table_data' ;


UPDATE mldataset 
SET attributes ='{\"filter\":\"\",\"mode\":\"query\",\"Query\":\"SELECT job_name JOB_NAME, running_job_instance_id JOB_INSTANCE_ID, IFNULL(incident_no,\'NA\') TICKET, start_time Start_Time, end_time End_Time,  status Status, last_status_update Last_Status_Update FROM bjm_job_instance WHERE project_id=({projectId})  AND start_time BETWEEN ({startDate}) AND ({endDate}) AND running_job_instance_id IN (SELECT DISTINCT running_instance1_id FROM bjm_ji_ji_mapping WHERE project_id=({projectId}) and relation_name = \'precededBy\') ORDER BY last_status_update DESC\",\"Cacheable\":false,\"isStreaming\":\"false\",\"defaultValues\":\"\",\"writeMode\":\"append\",\"params\":\"{\'projectId\':\'project_id\',\'startDate\':\'\\\\\'2018-04-01\\\\\'\' , \'endDate\':\'(SELECT CURRENT_TIMESTAMP)\'}\",\"tableName\":\"\",\"uniqueIdentifier\":\"\"}'
WHERE ALIAS = 'Acme_bjm2_dependent_running_instances_detail' ;


UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"SELECT status STATUS FROM bjm_job_instance  WHERE running_job_instance_id = ({running_job_instance_id}) AND project_id = ({projectId})","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''running_job_instance_id'':''running_job_instance_id'',''projectId'':''project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_L3_JobInstance_Status' ;

UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"SELECT job_instance_group_name GROUPNAME FROM bjm_ji_jig_mapping WHERE running_instance_id =  ({running_job_instance_id}) AND project_id = ({projectId});","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''running_job_instance_id'':''running_instance_id'',''projectId'':''project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_L3_JobInstanceGroupName' ;

UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"SELECT IFNULL(incident_no,''NA'') TICKETNO FROM bjm_job_instance  WHERE running_job_instance_id=({running_job_instance_id})  AND project_id={projectId}","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''running_job_instance_id'':''running_job_instance_id'',''projectId'':''project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_L3_FailedJobTicket' ;

UPDATE mldataset 
SET attributes ='{\"filter\":\"\",\"mode\":\"query\",\"Query\":\"SELECT start_time START_TIME FROM bjm_job_instance WHERE running_job_instance_id = ({running_job_instance_id}) AND project_id = ({projectId});\\n\",\"Cacheable\":\"false\",\"isStreaming\":\"false\",\"defaultValues\":\"\",\"writeMode\":\"append\",\"params\":\"{\'running_job_instance_id\':\'running_job_instance_id\',\'projectId\':\'project_id\'}\",\"tableName\":\"\",\"uniqueIdentifier\":\"\"}'
WHERE ALIAS = 'Acme_L3_JobInstanceStartTime' ;

UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"SELECT end_time END_TIME FROM bjm_job_instance WHERE running_job_instance_id = ({running_job_instance_id}) AND project_id = ({projectId});","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''running_job_instance_id'':''running_job_instance_id'',''projectId'':''project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_L3_JobInstance_EndTime' ;

UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"SELECT job_name JOB_NAME, running_job_instance_id as JOB_INSTANCE_ID, IFNULL(incident_no,''NA'') as TICKET, status Status,  start_time Start_Time, end_time End_Time  FROM bjm_job_instance WHERE project_id = ({projectId}) and running_job_instance_id=({running_job_instance_id})","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''projectId'':''project_id'',''running_job_instance_id'':''running_job_instance_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm3_ticket_details' ;


UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"SELECT startNode , endNode,  StartTime,EndTime, PredictedTime FROM (WITH RECURSIVE child_jobs AS (   SELECT 1 AS Lvl,  j.running_instance2_id AS startNode , j.running_instance1_id AS endNode, ji.start_time AS StartTime, ji.end_time AS EndTime, CASE WHEN ji.Status IN (''Failed'', ''Cancelled'') THEN TIMESTAMPADD(HOUR,-1,ji.End_time) ELSE ji.End_time END  AS  PredictedTime , ji.project_id Project  FROM bjm_ji_ji_mapping j ,bjm_job_instance ji      WHERE ji.running_job_instance_id = j.running_instance2_id   AND ji.project_id =({projectId})  AND j.running_instance2_id IN  (          SELECT DISTINCT ji_jig.running_instance_id          FROM  bjm_ji_jig_mapping ji_jig          WHERE job_instance_Group_name IN (              SELECT ji_jig.job_instance_Group_name              FROM bjm_job_instance ji , bjm_ji_jig_mapping ji_jig              WHERE ji_jig.running_instance_id  = ji.running_job_instance_id              AND ji.running_job_instance_id = ({running_job_instance_id})               AND ji.project_id =({projectId})) )  UNION DISTINCT      SELECT cj.Lvl + 1 AS Lvl, j2.running_instance2_id startNode ,j2.running_instance1_id endNode,    ji2.start_time AS StartTime,       ji2.end_time AS EndTime, CASE WHEN ji2.Status IN (''Failed'', ''Cancelled'') THEN TIMESTAMPADD(HOUR,-1,ji2.End_time) ELSE ji2.End_time END  AS PredictedTime , ji2.project_id Project  FROM bjm_ji_ji_mapping j2 , child_jobs cj, bjm_job_instance ji2     WHERE ji2.running_job_instance_id = j2.running_instance2_id   AND j2.running_instance2_id = cj.endNode   AND ji2.project_id=cj.Project )  SELECT DISTINCT  Lvl,  startNode , endNode,  StartTime,EndTime, PredictedTime FROM child_jobs) AS dependency","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''running_job_instance_id'':''running_job_instance_id'',''projectId'':''ji.project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm3_NetworkGraph' ;

UPDATE mldataset 
SET attributes ='{\"filter\":\"\",\"mode\":\"query\",\"Query\":\"WITH RECURSIVE parent_jobs AS ( (  SELECT  j.running_instance2_id StartNode, j.running_instance1_id EndNode      FROM bjm_ji_ji_mapping j          WHERE j.running_instance1_id = ({running_job_instance_id})    AND j.project_id = ({projectId}) )      UNION ALL       ( SELECT  j2.running_instance2_id  StartNode, j2.running_instance1_id  EndNode      FROM  bjm_ji_ji_mapping j2 , parent_jobs pj       WHERE j2.running_instance1_id = pj.StartNode) )                SELECT EndNode, COUNT(*) COUNT_PREDECCESSORS FROM parent_jobs WHERE EndNode = ({running_job_instance_id})  Group By EndNode\",\"Cacheable\":\"false\",\"isStreaming\":\"false\",\"defaultValues\":\"\",\"writeMode\":\"append\",\"params\":\"{\'running_job_instance_id\':\'\\\\\'JobX2_2\\\\\'\',\'projectId\':\'j.project_id\'}\",\"tableName\":\"\",\"uniqueIdentifier\":\"\"}'
WHERE ALIAS = 'Acme_L3_CountPredecessors' ;

UPDATE mldataset 
SET attributes ='{\"filter\":\"\",\"mode\":\"query\",\"Query\":\"WITH RECURSIVE child_jobs AS  ((        SELECT j.running_instance1_id  StartNode, j.running_instance2_id  EndNode        FROM bjm_ji_ji_mapping j        WHERE j.running_instance2_id = ({running_job_instance_id})  AND j.project_id = ({projectId}) )              UNION ALL     SELECT j2.running_instance1_id StartNode, j2.running_instance2_id  EndNode          FROM bjm_ji_ji_mapping j2 , child_jobs cj     WHERE j2.running_instance2_id = cj.StartNode )           SELECT EndNode, COUNT(*) COUNT_SUCCESSORS FROM child_jobs WHERE EndNode = ({running_job_instance_id})  Group By EndNode \",\"Cacheable\":\"false\",\"isStreaming\":\"false\",\"defaultValues\":\"\",\"writeMode\":\"append\",\"params\":\"{\'running_job_instance_id\':\'\\\\\'JobX2_2\\\\\'\',\'projectId\':\'j.project_id\'}\",\"tableName\":\"\",\"uniqueIdentifier\":\"\"}'
WHERE ALIAS = 'Acme_L3_CountSuccessors' ;

UPDATE mldataset 
SET attributes ='{\"filter\":\"\",\"mode\":\"query\",\"Query\":\"SELECT job_name JOB_NAME, running_job_instance_id JOB_INSTANCE_ID,    TIMESTAMPDIFF(MINUTE,start_time,end_time)  DURATION_SEC, STATUS , start_time Start_Time,   end_time End_Time     FROM bjm_job_instance jiParent    WHERE jiParent.job_name IN  ( SELECT job_name            FROM  bjm_job_instance  jiChild                             WHERE  jiChild.running_job_instance_id = ({running_job_instance_id})           AND jiChild.project_id = ({projectId}) )  AND jiParent.start_time <  (SELECT start_time        FROM  bjm_job_instance  jiChild                         WHERE  jiChild.running_job_instance_id = ({running_job_instance_id})       AND jiChild.project_id = ({projectId}))   ORDER BY start_time DESC\",\"Cacheable\":\"false\",\"isStreaming\":\"false\",\"defaultValues\":\"\",\"writeMode\":\"append\",\"params\":\"{\'running_job_instance_id\':\'\\\\\'JobX2_2\\\\\'\',\'project_id\':\'jiChild.project_id\'}\",\"tableName\":\"\",\"uniqueIdentifier\":\"\"}'
WHERE ALIAS = 'Acme_L3_PastJobInstance_Details' ;

UPDATE mldataset 
SET attributes ='{\"filter\":\"\",\"mode\":\"query\",\"Query\":\"SELECT job_name JOB_NAME, running_job_instance_id JOB_INSTANCE_ID,    TIMESTAMPDIFF(MINUTE,start_time,end_time)  DURATION_SEC, STATUS , start_time Start_Time,   end_time End_Time   FROM bjm_job_instance jiParent    WHERE jiParent.job_name IN (SELECT job_name       FROM  bjm_job_instance  jiChild      WHERE jiChild.running_job_instance_id = ({running_job_instance_id})       AND jiChild.project_id = ({projectId}) )  AND jiParent.start_time > ( SELECT start_time       FROM  bjm_job_instance  jiChild       WHERE  jiChild.running_job_instance_id = ({running_job_instance_id})       AND jiChild.project_id = ({projectId}) )  ORDER BY start_time ASC\",\"Cacheable\":\"false\",\"isStreaming\":\"false\",\"defaultValues\":\"\",\"writeMode\":\"append\",\"params\":\"{\'running_job_instance_id\':\'\\\\\'JobX2_2\\\\\'\',\'projectId\':\'jiChild.project_id\'}\",\"tableName\":\"\",\"uniqueIdentifier\":\"\"}'
WHERE ALIAS = 'Acme_L3_FutureJobInstance_Details' ;

UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"WITH RECURSIVE parent_jobs AS (  SELECT 1 AS Lvl, j.running_instance2_id AS startNode , j.running_instance1_id AS endNode, ji.start_time AS StartTime, ji.end_time AS EndTime, IFNULL(ji.predicted_start_time,ji.start_time) AS PredictedTime , ji.project_id Project  FROM bjm_ji_ji_mapping j ,bjm_job_instance ji  WHERE ji.running_job_instance_id = j.running_instance1_id  AND ji.project_id = ({projectId}) AND j.running_instance1_id = ({running_job_instance_id}) UNION DISTINCT  SELECT pj.Lvl + 1 AS Lvl, j2.running_instance2_id startNode ,j2.running_instance1_id endNode, ji2.start_time AS StartTime, ji2.end_time AS EndTime, IFNULL(ji2.predicted_start_time,ji2.start_time) AS PredictedTime , ji2.project_id Project FROM bjm_ji_ji_mapping j2 , parent_jobs pj, bjm_job_instance ji2 WHERE ji2.running_job_instance_id = j2.running_instance1_id AND j2.running_instance1_id = pj.startNode AND ji2.project_id=pj.Project) SELECT DISTINCT Lvl, startNode , endNode, StartTime,EndTime, PredictedTime FROM parent_jobs","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''running_job_instance_id'':''j.running_instance1_id'',''projectId'':''ji.project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_L3_PredecessorNetworkGraph' ;

UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"WITH RECURSIVE child_jobs AS (  SELECT 1 AS Lvl, j.running_instance2_id AS startNode , j.running_instance1_id AS endNode, ji.start_time AS StartTime, ji.end_time AS EndTime, IFNULL(ji.predicted_start_time,ji.start_time) AS PredictedTime , ji.project_id Project  FROM bjm_ji_ji_mapping j ,bjm_job_instance ji  WHERE ji.running_job_instance_id = j.running_instance2_id  AND ji.project_id = ({projectId}) AND j.running_instance2_id = ({running_job_instance_id}) UNION DISTINCT  SELECT cj.Lvl + 1 AS Lvl, j2.running_instance2_id startNode ,j2.running_instance1_id endNode, ji2.start_time AS StartTime, ji2.end_time AS EndTime, IFNULL(ji2.predicted_start_time,ji2.start_time) AS PredictedTime , ji2.project_id Project FROM bjm_ji_ji_mapping j2 , child_jobs cj, bjm_job_instance ji2 WHERE ji2.running_job_instance_id = j2.running_instance2_id AND j2.running_instance2_id = cj.endNode AND ji2.project_id=cj.Project) SELECT DISTINCT Lvl, startNode , endNode, StartTime,EndTime, PredictedTime FROM child_jobs","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''running_job_instance_id'':''j.running_instance2_id '',''projectId'':''ji.project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_L3_SuccessorNetworkGraph' ;

UPDATE mldataset 
SET attributes ='{\"filter\":\"\",\"mode\":\"query\",\"Query\":\"SELECT seq.seq  MONTH, MONTHNAME(CONCAT( YEAR(NOW()), \'-\', seq.seq, \'-01\')) MONTH_NAME, YEAR(ji.start_time)  YEAR, COUNT(*)  FAILED_INSTANCE_COUNT FROM ( SELECT 1  seq UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 )  seq LEFT JOIN bjm_job_instance  ji ON seq.seq = MONTH(ji.start_time) WHERE ji.project_id = ({projectId}) AND ji.start_time >= ({startDate}) AND ji.start_time <= ({endDate}) AND ji.status IN (\'Cancelled\',\'failed\',\'Failed\') GROUP BY YEAR(ji.start_time),seq.seq ORDER BY YEAR(ji.start_time),seq.seq\",\"Cacheable\":\"false\",\"isStreaming\":\"false\",\"defaultValues\":\"\",\"writeMode\":\"append\",\"params\":\"{\'projectId\':\'ji.project_id\',\'startDate\':\'\\\\\'2018-04-01\\\\\'\' , \'endDate\':\'(SELECT CURRENT_TIMESTAMP)\'}\",\"tableName\":\"\",\"uniqueIdentifier\":\"\"}'
WHERE ALIAS = 'Acme_bjm2_monthwise_failed_job_instances' ;

UPDATE mldataset 
SET attributes ='{\"filter\":\"\",\"mode\":\"query\",\"Query\":\"SELECT job_name JOB_NAME, running_job_instance_id JOB_INSTANCE_ID, status Status,  start_time Start_Time, end_time End_Time, TIMESTAMPDIFF(HOUR,start_time,end_time) Duration  FROM bjm_job_instance WHERE  status IN (\'Cancelled\',\'failed\',\'Failed\') and project_id = ({projectId}) AND start_time BETWEEN ({startDate}) AND ({endDate})\",\"Cacheable\":false,\"isStreaming\":\"false\",\"defaultValues\":\"\",\"writeMode\":\"append\",\"params\":\"{\'projectId\':\'project_id\',\'startDate\':\'\\\\\'2018-04-01\\\\\'\' , \'endDate\':\'(SELECT CURRENT_TIMESTAMP)\'}\",\"tableName\":\"\",\"uniqueIdentifier\":\"\"}'
WHERE ALIAS = 'Acme_bjm2_Failed_Job_Instances_Name' ;

UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"SELECT count(job_name) TOTAL_JOBS FROM bjm_ji_jig_mapping WHERE project_id = ({projectId}) AND job_instance_group_name = ({job_instance_group_name});","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''projectId'':''project_id'',''job_instance_group_name'':''job_instance_group_name''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm2_GroupsTotalJobs' ;

UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"SELECT count(running_instance_id)  TOTAL_JOB_INSTANCES FROM bjm_ji_jig_mapping WHERE project_id = ({projectId}) AND job_instance_group_name = ({job_instance_group_name});","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''projectId'':''project_id'',''job_instance_group_name'':''job_instance_group_name''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm2_GroupsTotalJobInstances' ;

UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"SELECT running_job_instance_id RUNNING_JOB_INSTANCE_ID, IFNULL(TIMESTAMPDIFF(Minute,start_time,end_time),0) DURATION FROM bjm_job_instance WHERE running_job_instance_id in (SELECT running_instance_id FROM bjm_ji_jig_mapping WHERE job_instance_group_name = ({job_instance_group_name}) and project_id = ({projectId})) AND project_id = ({projectId})","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''projectId'':''project_id'',''job_instance_group_name'':''job_instance_group_name''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm2_GroupsTotalJobInstanceNames' ;

UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"SELECT status STATUS ,IFNULL(count(running_job_instance_id),0)  COUNT_JOB_INSTANCE FROM bjm_job_instance WHERE job_name = ({job_name})  and project_id = ({projectId}) GROUP BY status","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''job_name'':''job_name'', ''projectId'':''project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm2_StatuswiseJobInstancesCount' ;

UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"select ''On Time''  STATE, count(running_job_instance_id)  COUNT_JOB_INSTANCES from bjm_job_instance where job_name = ({job_name}) and project_id = ({projectId}) and timestampdiff(Second,predicted_start_time,start_time) is null Union all select ''Before Time''  STATE, count(running_job_instance_id)  COUNT_JOB_INSTANCES from bjm_job_instance where job_name = ({job_name}) and project_id = ({projectId}) and timestampdiff(Second,predicted_start_time,start_time) < 0 Union all select ''Delayed''  STATE, count(running_job_instance_id)  COUNT_JOB_INSTANCES from bjm_job_instance where job_name = ({job_name}) and project_id = ({projectId}) and timestampdiff(Second,predicted_start_time,start_time) > 0 ","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''job_name'':''job_name'',''projectId'':''project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm2_Statewise_Job_Instances_Count' ;

UPDATE mldataset 
SET attributes ='{"filter":"","mode":"query","Query":"select running_job_instance_id JOB_INSTANCE_ID, job_name JOB_NAME, ADDTIME( start_time , ''5:30'') Start_Time, ADDTIME( end_time, ''5:30'') End_Time from bjm_job_instance WHERE job_name = ({job_name}) and project_id = ({projectId}) order by start_time desc","Cacheable":false,"isStreaming":"false","defaultValues":"","writeMode":"append","params":"{''job_name'':''job_name'', ''projectId'':''project_id''}","tableName":"","uniqueIdentifier":""}'
WHERE ALIAS = 'Acme_bjm2_Job_Instance_table_data' ;
