UPDATE usm_permission_api SET api='/api/get-dash-constants\\?projectId=.*' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'is_whitelisted'  AND permission ='is_whitelisted' LIMIT 1) AND api='/api/get-dash-constants?projectId=.*';

UPDATE usm_permission_api SET api='/api/usm-portfolioss/page.*' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'usm' AND permission ='portfolioss-view' LIMIT 1) AND api='/api/usm-portfolioss/page';
UPDATE usm_permission_api SET api='/api/usm-portfolios/' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'usm' AND permission ='portfolio-create' LIMIT 1) AND api='/api/usm-portfolios';
UPDATE usm_permission_api SET api='/api/usm-portfolios/' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'usm' AND permission ='portfolio-edit' LIMIT 1) AND api='/api/usm-portfolios';
UPDATE usm_permission_api SET api='/api/projectss/page.*' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'usm' AND permission ='projectss-view' LIMIT 1) AND api='/api/projectss/page';
UPDATE usm_permission_api SET api='/api/user-project-roless/page.*' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'usm' AND permission ='user-project-roless-view' LIMIT 1) AND api='/api/user-project-roless/page';
UPDATE usm_permission_api SET api='/api/projects' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'usm' AND permission ='projects-create' LIMIT 1) AND api='/api/projects/';
UPDATE usm_permission_api SET api='/api/user-project-roles-list' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'usm' AND permission ='user-project-roles-list-create' LIMIT 1) AND api='/api/user-project-roles-list/';
UPDATE usm_permission_api SET api='/api/user-project-roles' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'usm' AND permission ='user-project-roles-edit' LIMIT 1) AND api='/api/user-project-roles';
UPDATE usm_permission_api SET api='/api/projects' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'usm' AND permission ='project-edit' LIMIT 1) AND api='/api/projects/';
UPDATE usm_permission_api SET api='/api/roles' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'usm' AND permission ='role-edit' LIMIT 1) AND api='/api/roles/';
UPDATE usm_permission_api SET api='/api/users/page.*' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'usm' AND permission ='users-view' LIMIT 1) AND api='/api/users/page';
UPDATE usm_permission_api SET api='/api/userss' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'usm' AND permission ='userss-edit' LIMIT 1) AND api='/api/userss/';
UPDATE usm_permission_api SET api='/api/dash-constants/' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'usm' AND permission ='dash-constants-create' LIMIT 1) AND api='/api/dash-constants';
UPDATE usm_permission_api SET api='/api/get-extension-key?.*' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'usm' AND permission ='get-extension-key-view' LIMIT 1) AND api='/api/get-extension-key';
UPDATE usm_permission_api SET api='/api/roles' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'usm' AND permission ='roles-create' LIMIT 1) AND api='/api/roles/';
UPDATE usm_permission_api SET api='/api/roles' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'usm' AND permission ='role-edit' LIMIT 1) AND api='/api/roles/';
UPDATE usm_permission_api SET api='/api/palette-config/' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'dbs' AND permission ='palette-config-create' LIMIT 1) AND api='/api/palette-config';
UPDATE usm_permission_api SET api='/api/usm-user-user-list/' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'usm' AND permission ='user-user-list-create' LIMIT 1) AND api='/api/usm-user-user-list';
UPDATE usm_permission_api SET api='/api/usm-role-role-list/' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'usm' AND permission ='role-role-list-create' LIMIT 1) AND api='/api/usm-role-role-list';
UPDATE usm_permission_api SET api='/api/search/users/page?.*' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'usm' AND permission ='users-page-create' LIMIT 1) AND api='/api/search/users/page';
UPDATE usm_permission_api SET api='/api/internaljob/dataset/[A-Za-z0-9- _.]*/[A-Za-z0-9- _.]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='internaljob-DatasetByNameAndOrg' LIMIT 1) and api="/api/internaljob/dataset/[A-Za-z0-9- _.]*/[A-Za-z0-9- _.]*";
UPDATE usm_permission_api SET api='/api/internaljob/console/[a-zA-Z0-9]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='internalJob-getConsoleByJobid' LIMIT 1) and api="/api/internaljob/console/[a-zA-Z0-9]*";
UPDATE usm_permission_api SET api='/api/user-project-role-dashboard.*' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'dbs' AND permission ='user-project-role-dashboard-view' LIMIT 1) AND api='/api/user-project-role-dashboard';
UPDATE usm_permission_api SET api='/api/datasets/datasource/.*' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip' AND permission ='Dataset-byDatasourceAndOrg' LIMIT 1) AND api='/api/datasets/datasource/[A-Za-z0-9- _]*';
UPDATE usm_permission_api SET api='/api/datasets/getData/.*/.*' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip' AND permission ='Dataset-getData-ByNamestrAndOrg' LIMIT 1) AND api='/api/datasets/getData/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*';
UPDATE usm_permission_api SET TYPE='DELETE' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='Dataset-Delete-ByNamestrAndOrg' LIMIT 1) and api="/api/datasets/delete/[A-Za-z0-9- _.]*/[A-Za-z0-9- _]*";
UPDATE usm_permission_api SET TYPE='DELETE' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='app-delete-byID' LIMIT 1) and api="/api/app/delete/[0-9]*";
UPDATE usm_permission_api SET api='/api/search/usm-portfolios/page.*' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'usm' AND permission ='portfolios-page-create' LIMIT 1) AND api='/api/search/usm-portfolios/page';
UPDATE usm_permission_api SET api='/api/search/projects/page.*' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'usm' AND permission ='projects-page-create' LIMIT 1) AND api='/api/search/projects/page';
UPDATE usm_permission_api SET api='/api/widget-configurations/.*' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'dbs' AND permission ='widget-configurations-delete' LIMIT 1) AND api='/api/widget-configurations/[0-9]{0,6}/[A-Za-z0-9-_ ]*';
UPDATE usm_permission_api SET api='/api/widget-configurations/' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'dbs' AND permission ='widget-configurations-edit' LIMIT 1) AND api='/api/widget-configurations';

INSERT INTO usm_permissions (module,permission) VALUES ('dbs','get-dashboard-data');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/dashboard-configurations/get-data/.*/.*', 'POST', 1, 'get Dashboard data in Excel', id FROM usm_permissions WHERE module = 'dbs'  AND permission ='get-dashboard-data' LIMIT 1;
INSERT INTO usm_permissions (module,permission) VALUES ('dbs','dashboard-configurations-update');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/dashboard-configurations', 'PUT', 1, 'Create a new dashboard_configuration', id FROM usm_permissions WHERE module = 'dbs'  AND permission ='dashboard-configurations-update' LIMIT 1;
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/get-dash-constants\?projectId=.*', 'GET', 1, 'get the dash-constants-view', id FROM usm_permissions WHERE module = 'usm'  AND permission ='get-dash-constants-view' LIMIT 1;
INSERT INTO usm_permissions (module,permission) VALUES ('usm','get-startup-constants');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/get-startup-constants/[A-Za-z0-9- _.]*/[A-Za-z0-9- _]*', 'GET', 1, 'get the startup-constants', id FROM usm_permissions WHERE module = 'usm'  AND permission ='get-startup-constants' LIMIT 1;



UPDATE usm_permission_api SET api='/api/usm-permissionss/' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'usm'  AND permission ='permission-create' LIMIT 1) AND api='/api/usm-permissionss';
UPDATE usm_permission_api SET api='/api/usm-permissionss/' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'usm'  AND permission ='permission-edit' LIMIT 1) AND api='/api/usm-permissionss';
UPDATE usm_permission_api SET api='/api/usm-role-permissionss-list/' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'usm'  AND permission ='role-permissionss-list-create' LIMIT 1) AND api='/api/usm-role-permissionss-list';
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/search/usm-permissions-api', 'POST', 0, 'to search api', id FROM usm_permissions WHERE module = 'usm'  AND permission ='permissionss-view' LIMIT 1;
UPDATE usm_permission_api SET api='/api/datasources/types.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='Datasources-type' LIMIT 1) and api='/api/datasources/types';
UPDATE usm_permission_api SET api='/api/datasources/names.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='Datasources-names' LIMIT 1) and api='/api/datasources/names';
UPDATE usm_permission_api SET api='/api/datasources/delete/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='Datasources-delete' LIMIT 1) and api='/api/datasources/delete/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*';
UPDATE usm_permission_api SET api='/api/event/all/search.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='event-all-search' LIMIT 1) and api="/api/event/all/search";
UPDATE usm_permission_api SET api='/api/datasets/[A-Za-z0-9- _%]*/[A-Za-z0-9- _]*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='Datasets-ByNameStrAndOrg' LIMIT 1) and api='/api/datasets/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*';
UPDATE usm_permission_api SET api='/api/datasets/getPaginatedData/[A-Za-z0-9- %_]*/[A-Za-z0-9- _]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission = 'Datasets-getPaginatedByNamestrAndOrg' LIMIT 1) and api='/api/datasets/getPaginatedData/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*';
UPDATE usm_permission_api SET api='/api/datasets/searchDataCount.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='Datasets-searchDataCount' LIMIT 1) and api='/api/datasets/searchDataCount';
UPDATE usm_permission_api SET api='/api/datasets/searchData.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='Datasets-searchData' LIMIT 1) and api='/api/datasets/searchData';
UPDATE usm_permission_api SET api='/api/datasets/downloadCsvData.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='Datasets-downloadCsvData' LIMIT 1) and api='/api/datasets/downloadCsvData';
UPDATE usm_permission_api SET api='/api/schemaRegistry/schemas/all.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='schemaRegistry-schemas-All' LIMIT 1) and api='/api/schemaRegistry/schemas/all';
UPDATE usm_permission_api SET api='/api/groups/paginated/all.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='groups-paginated-all' LIMIT 1) and api='/api/groups/paginated/all';
UPDATE usm_permission_api SET api='/api/datasets/viewData/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='Datasets-ViewData' LIMIT 1) and api='/api/datasets/viewData/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*';
UPDATE usm_permission_api SET api='/api/groups/names.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='groups-names' LIMIT 1) and api='/api/groups/names';
UPDATE usm_permission_api SET api='/api/groups/all/[A-Za-z0-9- %_.]*/[A-Za-z0-9- %_.]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='groups-all-ByEntitytypeAndEntity' LIMIT 1) and api='/api/groups/all/[A-Za-z0-9- %_.]*/[A-Za-z0-9- %_.]*';
UPDATE usm_permission_api SET api='/api/datasets/istablepresent/[A-Za-z0-9- %_]*/[A-Za-z0-9- _%]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='Datasets-IsTablePresent' LIMIT 1) and api='/api/datasets/istablepresent/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*';
UPDATE usm_permission_api SET api='/api/datasets/checkIfSupported/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='Datasets-checkIfSupportedByNamestrAndOrg' LIMIT 1) and api='/api/datasets/checkIfSupported/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*';
UPDATE usm_permission_api SET api='/api/chainjob/fetch/[A-Za-z0-9- _.]*/[A-Za-z0-9- _]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='chainjob-fetch' LIMIT 1) and api='/api/chainjob/fetch/[A-Za-z0-9- _.]*/[A-Za-z0-9- _]*';
UPDATE usm_permission_api SET api='/api/chain/name/[A-Za-z0-9- _]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='chain-name' LIMIT 1) and api='/api/chain/name/[A-Za-z0-9- _]*';
UPDATE usm_permission_api SET api='/api/jobs/[A-Za-z0-9- _.]*/[A-Za-z0-9- _.]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='jobs-byNameStrAndOrg' LIMIT 1) and api='/api/jobs/[A-Za-z0-9- _.]*/[A-Za-z0-9- _.]*';
UPDATE usm_permission_api SET api='/api/chainjob/run/tree/[A-Za-z0-9- _.]*/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='chainjob-run-tree' LIMIT 1) and api='/api/chainjob/run/tree/[A-Za-z0-9- _.]*/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*';
UPDATE usm_permission_api SET api='/api/groups/all.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='groups-all' LIMIT 1) and api='/api/groups/all';
UPDATE usm_permission_api SET api='/api/event/all.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='event-getall' LIMIT 1) and api='/api/event/all';
UPDATE usm_permission_api SET api='/api/event/all/len.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='event-getall-len' LIMIT 1) and api='/api/event/all/len';
UPDATE usm_permission_api SET api='/api/event/apiClasses.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='event-apiClasses' LIMIT 1) and api='/api/event/apiClasses';
UPDATE usm_permission_api SET api='/api/chain/[A-Za-z0-9- _]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='chain-get-ByOrg' LIMIT 1) and api='/api/chain/[A-Za-z0-9- _]*';
UPDATE usm_permission_api SET api='/api/schedule/scheduleJob/all/[A-Za-z0-9- _]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='schedule-scheduleJob-all' LIMIT 1) and api='/api/schedule/scheduleJob/all/[A-Za-z0-9- _]*';
UPDATE usm_permission_api SET api='/api/streamingServices/allPipelinesByOrg.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='streamingServices-allPipelinesByOrg' LIMIT 1) and api='/api/streamingServices/allPipelinesByOrg';
UPDATE usm_permission_api SET api='/api/schedule/scheduleJob/[A-Za-z0-9- _.]*/[A-Za-z0-9- _.]*/[A-Za-z0-9- _.]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='schedule-scheduleJob' LIMIT 1) and api='/api/schedule/scheduleJob/[A-Za-z0-9- _.]*/[A-Za-z0-9- _.]*/[A-Za-z0-9- _.]*';
UPDATE usm_permission_api SET api='/api/schedule/updateJob.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='schedule-updateJob' LIMIT 1) and api='/api/schedule/updateJob';
UPDATE usm_permission_api SET api='/api/chain/update/tree/[A-Za-z0-9- _.]*/[A-Za-z0-9- _]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='chain-update-tree' LIMIT 1) and api='/api/chain/update/tree/[A-Za-z0-9- _.]*/[A-Za-z0-9- _]*';
UPDATE usm_permission_api SET api='/api/datasets/len/[A-Za-z0-9- _]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='Datasets-lenByOrg' LIMIT 1) and api='/api/datasets/len/[A-Za-z0-9- _]*';
UPDATE usm_permission_api SET api='/api/datasets/search/[A-Za-z0-9- _]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='Datasets-SearchByOrg' LIMIT 1) and api='/api/datasets/search/[A-Za-z0-9- _]*';
UPDATE usm_permission_api SET api='/api/datasources/all/[A-Za-z0-9- _]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='Datasources-all-ByGroup' LIMIT 1) and api='/api/datasources/all/[A-Za-z0-9- _]*';
UPDATE usm_permission_api SET api='/api/schedule/cronScheduleJob/[A-Za-z0-9- _.]*/[A-Za-z0-9- _.]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='schedule-cronScheduleJob' LIMIT 1) and api="/api/schedule/cronScheduleJob/[A-Za-z0-9- _.]*/[A-Za-z0-9- _.]*";
UPDATE usm_permission_api SET api='/api/datasources/all.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='Datasources-getAll' LIMIT 1) and api='/api/datasources/all';
UPDATE usm_permission_api SET api='/api/streamingServices/allPipelineNames.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='streamingServices-allPipelineNames' LIMIT 1) and api='/api/streamingServices/allPipelineNames';
UPDATE usm_permission_api SET api='/api/event/trigger/[A-Za-z0-9- _.]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='event-post-triggerByName' LIMIT 1) and api='/api/event/trigger/[A-Za-z0-9- _.]*';

UPDATE usm_permission_api SET api='/api/pipeline/run/[A-Za-z0-9- _.]*/[A-Za-z0-9- _.]*/[A-Za-z0-9- _]*/[A-Za-z0-9- _.]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='pipeline-run-ByJobtypeAndCnameAndOrgAndRuntime' LIMIT 1) and api='/api/pipeline/run/[A-Za-z0-9- _.]*/[A-Za-z0-9- _.]*/[A-Za-z0-9- _]*/[A-Za-z0-9- _.]*';

UPDATE usm_permission_api SET api='/api/file/create/[A-Za-z0-9- _.]*/[A-Za-z0-9- _]*/[A-Za-z0-9- _.]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='File-Create' LIMIT 1) and api='/api/file/create/[A-Za-z0-9- _.]*/[A-Za-z0-9- _]*/[A-Za-z0-9- _.]*';

UPDATE usm_permission_api SET api='/api/jobs/console/[a-zA-Z0-9]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='jobs-Console-ByJobID' LIMIT 1) and api='/api/jobs/console/[a-zA-Z0-9]*';
UPDATE usm_permission_api SET api='/api/service/codebuddy/v1/generate.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='codebuddy-v1-generate' LIMIT 1) and api='/api/service/codebuddy/v1/generate';
UPDATE usm_permission_api SET api='/api/pipeline/getPipelines/[A-Za-z0-9- _]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='pipeline-getPipelines' LIMIT 1) and api="/api/pipeline/getPipelines/[A-Za-z0-9- _]*";
UPDATE usm_permission_api SET api='/api/streamingServices/pipelinesCopy/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='StreamingServices-pipelineCopy' LIMIT 1) and api="/api/streamingServices/pipelinesCopy/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*";
UPDATE usm_permission_api SET api='/api/internaljob/jobname/[A-Za-z0-9- _.]*/[A-Za-z0-9- _.]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='internaljob-Jobname-ByNameAndOrg' LIMIT 1) and api="/api/internaljob/jobname/[A-Za-z0-9- _.]*/[A-Za-z0-9- _.]*";
UPDATE usm_permission_api SET api='/api/datasets/datasetsCopy/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='Dataset-datasetCopySourceToTarget' LIMIT 1) and api="/api/datasets/datasetsCopy/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*";
UPDATE usm_permission_api SET api='/api/datasets/dsetNames/[A-Za-z0-9- _]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='DatasetDsetnames-ByOrg' LIMIT 1) and api="/api/datasets/dsetNames/[A-Za-z0-9- _]*";
UPDATE usm_permission_api SET api='/api/datasets/direct/viewData/[A-Za-z0-9- _.]*/[A-Za-z0-9- _]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='Dataset-directViewData-ByNameAndOrg' LIMIT 1) and api="/api/datasets/direct/viewData/[A-Za-z0-9- _.]*/[A-Za-z0-9- _]*";
INSERT INTO usm_permissions (module,permission) Values('cip','v1-streamingServices-allPipelineNames');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/service/v1/streamingServices/allPipelineNames.*', 'GET', 0, 'v1 streamingServices allPipelineNames', id FROM usm_permissions WHERE module = 'cip'  AND permission ='v1-streamingServices-allPipelineNames' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','plugin-deleteAllNode');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/plugin/deleteAllNode/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*', 'DELETE', 0, 'api-plugin-deleteAllNode by name and org', id FROM usm_permissions WHERE module = 'cip'  AND permission ='plugin-deleteAllNode' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','plugin-count-ByType');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/plugin/count/[A-Za-z0-9- _]*', 'GET', 0, 'get plugin count by type', id FROM usm_permissions WHERE module = 'cip'  AND permission ='plugin-count-ByType' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','copyCIP');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/copyCip/[A-Za-z0-9- _.]*', 'POST', 0, 'copy CIP', id FROM usm_permissions WHERE module = 'cip'  AND permission ='copyCIP' limit 1;
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/importCip/[A-Za-z0-9- _.]*', 'POST', 0, 'import CIP', id FROM usm_permissions WHERE module = 'cip'  AND permission ='copyCIP' limit 1;
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/exportCip/[A-Za-z0-9- _.]*', 'POST', 0, 'export CIP', id FROM usm_permissions WHERE module = 'cip'  AND permission ='copyCIP' limit 1;

UPDATE usm_permission_api SET api='/api/datasources/type/count/[a-zA-Z0-9]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='Datasources-type-Count-ByType' LIMIT 1) and api="/api/datasources/type/count/[a-zA-Z0-9]*";

UPDATE usm_permission_api SET api='/api/datasources/type/paginated/[a-zA-Z0-9]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip'  AND permission ='Datasources-type-paginatedByType' LIMIT 1) and api="/api/datasources/type/paginated/[a-zA-Z0-9]*";
INSERT INTO usm_permissions (module,permission) Values('cip','mlinstances-getFiltersByOrganization');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/mlinstances/getFiltersByOrganization/[A-Za-z0-9_ -]*', 'GET', 0, 'api-mlinstances-getFiltersByOrganization', id FROM usm_permissions WHERE module = 'cip'  AND permission ='mlinstances-getFiltersByOrganization' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','plugin-updateplugin');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/plugin/updateplugin/[A-Za-z0-9- _]*', 'POST', 0, 'api plugin updateplugin by id', id FROM usm_permissions WHERE module = 'cip'  AND permission ='plugin-updateplugin' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','mlspectemplates-getSpecTemplatesByOrganization');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/mlspectemplates/getSpecTemplatesByOrganization/[A-Za-z0-9_ -]*', 'GET', 0, 'api mlspectemplates getSpecTemplatesByOrganization', id FROM usm_permissions WHERE module = 'cip'  AND permission ='mlspectemplates-getSpecTemplatesByOrganization' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','mlinstances-getMlInstanceByOrganization');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/mlinstances/getMlInstanceByOrganization/[A-Za-z0-9 _-]*', 'GET', 0, 'mlinstances-getMlInstanceByOrganization by org', id FROM usm_permissions WHERE module = 'cip'  AND permission ='mlinstances-getMlInstanceByOrganization' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','mlinstances-getMlInstanceByNameAndOrganization');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/mlinstances/getMlInstanceByNameAndOrganization/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*', 'GET', 0, 'mlinstances getMlInstanceByNameAndOrganization', id FROM usm_permissions WHERE module = 'cip'  AND permission ='mlinstances-getMlInstanceByNameAndOrganization' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','mlinstances-getMlInstanceNamesByAdapterNameAndOrganization');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/mlinstances/getMlInstanceNamesByAdapterNameAndOrganization/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*', 'GET', 0, 'mlinstances getMlInstanceNames ByAdapterName And Organization', id FROM usm_permissions WHERE module = 'cip'  AND permission ='mlinstances-getMlInstanceNamesByAdapterNameAndOrganization' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','mlspectemplates-getSpecTemplateNamesByOrganization');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/mlspectemplates/getSpecTemplateNamesByOrganization/[A-Za-z0-9- _]*', 'GET', 0, 'mlspectemplates getSpecTemplateNames By Organization', id FROM usm_permissions WHERE module = 'cip'  AND permission ='mlspectemplates-getSpecTemplateNamesByOrganization' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','mladapters-getAdapterNamesByOrganization');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/mladapters/getAdapterNamesByOrganization/[A-Za-z0-9- _]*', 'GET', 0, 'mladapters getAdapterNamesByOrganization', id FROM usm_permissions WHERE module = 'cip'  AND permission ='mladapters-getAdapterNamesByOrganization' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','mlinstances-getMlInstanceNamesByOrganization');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/mlinstances/getMlInstanceNamesByOrganization/[A-Za-z0-9- _]*', 'GET', 0, 'mlinstances getMlInstanceNamesByOrganization', id FROM usm_permissions WHERE module = 'cip'  AND permission ='mlinstances-getMlInstanceNamesByOrganization' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','mladapters-getAdapteByNameAndOrganization');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/mladapters/getAdapteByNameAndOrganization/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*[A-Za-z0-9- _]*', 'GET', 0, 'mladapters getAdapteByNameAndOrganization', id FROM usm_permissions WHERE module = 'cip'  AND permission ='mladapters-getAdapteByNameAndOrganization' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','mlspectemplates-specTemplateByDomainNameAndOrg');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/mlspectemplates/specTemplateByDomainNameAndOrg/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*', 'GET', 0, 'mlspectemplates specTemplateByDomainNameAndOrg', id FROM usm_permissions WHERE module = 'cip'  AND permission ='mlspectemplates-specTemplateByDomainNameAndOrg' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','mladapters-getAdaptesByOrganization');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/mladapters/getAdaptesByOrganization/[A-Za-z0-9- _]*', 'GET', 0, 'mladapters getAdaptesByOrganization', id FROM usm_permissions WHERE module = 'cip'  AND permission ='mladapters-getAdaptesByOrganization' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','mladapters-getFiltersByOrganization');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/mladapters/getFiltersByOrganization/[A-Za-z0-9- _]*', 'GET', 0, 'mladapters getFiltersByOrganization', id FROM usm_permissions WHERE module = 'cip'  AND permission ='mladapters-getFiltersByOrganization' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','mlinstances-add');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/mlinstances/add', 'POST', 0, 'api to mlinstances add', id FROM usm_permissions WHERE module = 'cip'  AND permission ='mlinstances-add' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','mlinstances-update');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/mlinstances/update', 'POST', 0, 'api mlinstances update', id FROM usm_permissions WHERE module = 'cip'  AND permission ='mlinstances-update' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','mlinstances-delete-byNameAndOrg');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/mlinstances/delete/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*', 'DELETE', 0, ' mlinstances delete by name and org', id FROM usm_permissions WHERE module = 'cip'  AND permission ='mlinstances-delete-byNameAndOrg' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','mladapters-add');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/mladapters/add', 'POST', 0, 'add for mladapters', id FROM usm_permissions WHERE module = 'cip'  AND permission ='mladapters-add' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','mladapters-update');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/mladapters/update', 'POST', 0, 'mladapters update', id FROM usm_permissions WHERE module = 'cip'  AND permission ='mladapters-update' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','mladapters-delete-ByNameAndOrg');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/mladapters/delete/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*', 'DELETE', 0, 'delete by name and org', id FROM usm_permissions WHERE module = 'cip'  AND permission ='mladapters-delete-ByNameAndOrg' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','mlspectemplates-getFiltersByOrganization');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/mlspectemplates/getFiltersByOrganization/[A-Za-z0-9- _]*', 'GET', 0, 'api mlspectemplates getFiltersByOrganization', id FROM usm_permissions WHERE module = 'cip'  AND permission ='mlspectemplates-getFiltersByOrganization' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','mladapters-getAdaptersBySpecTemDomNameAndOrg');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/mladapters/getAdaptersBySpecTemDomNameAndOrg/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*', 'GET', 0, 'api for mladapters getAdaptersBySpecTemDomNameAndOrg', id FROM usm_permissions WHERE module = 'cip'  AND permission ='mladapters-getAdaptersBySpecTemDomNameAndOrg' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','mlspectemplates-update');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/mlspectemplates/update', 'POST', 0, 'mlspectemplates update', id FROM usm_permissions WHERE module = 'cip'  AND permission ='mlspectemplates-update' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','mlspectemplates-add');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/mlspectemplates/add', 'POST', 0, 'mlspectemplates add api', id FROM usm_permissions WHERE module = 'cip'  AND permission ='mlspectemplates-add' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','mlspectemplates-delete-ByNameAndOrg');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/mlspectemplates/delete/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*', 'DELETE', 0, 'mlspectemplates delete By Name And Org', id FROM usm_permissions WHERE module = 'cip'  AND permission ='mlspectemplates-delete-ByNameAndOrg' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','app-byNameAndOrg');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/app/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*', 'GET', 0, 'get api by name and org', id FROM usm_permissions WHERE module = 'cip'  AND permission ='app-byNameAndOrg' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','app-save');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/app/save', 'POST', 0, 'save api app', id FROM usm_permissions WHERE module = 'cip'  AND permission ='app-save' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','service-v1-pipelines-count');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/service/v1/pipelines/count.*', 'GET', 0, 'service-v1-pipelines count', id FROM usm_permissions WHERE module = 'cip'  AND permission ='service-v1-pipelines-count' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','app-delete-byID');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/app/delete/[0-9]*', 'GET', 0, 'delete app by id', id FROM usm_permissions WHERE module = 'cip'  AND permission ='app-delete-byID' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','secrets-update');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/secrets/update.*', 'PUT', 0, 'secrets-update', id FROM usm_permissions WHERE module = 'cip'  AND permission ='secrets-update' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','secrets-create');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/secrets/add.*', 'PUT', 0, 'secrets_create', id FROM usm_permissions WHERE module = 'cip'  AND permission ='secrets-create' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','secrets-delete');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/secrets/delete.*', 'DELETE', 0, 'secrets delete', id FROM usm_permissions WHERE module = 'cip'  AND permission ='secrets-delete' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','access-token-apis');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/access-token/.*', 'ALL', 0, 'access-token-apis', id FROM usm_permissions WHERE module = 'cip'  AND permission ='access-token-apis' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','secrets-apis');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/secrets/.*', 'ALL', 0, 'secrets-apis', id FROM usm_permissions WHERE module = 'cip'  AND permission ='secrets-apis' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','mashups-apis');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/mashups/.*', 'ALL', 0, 'mashups-apis', id FROM usm_permissions WHERE module = 'cip'  AND permission ='mashups-apis' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','mldatasettopics-apis');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/mldatasettopics/.*', 'ALL', 0, 'mldatasettopics-apis', id FROM usm_permissions WHERE module = 'cip'  AND permission ='mldatasettopics-apis' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','services-apis');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/services/.*', 'ALL', 0, 'services-apis', id FROM usm_permissions WHERE module = 'cip'  AND permission ='services-apis' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','mltopics-apis');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/mltopics/.*', 'ALL', 0, 'mltopics-apis', id FROM usm_permissions WHERE module = 'cip'  AND permission ='mltopics-apis' limit 1;

INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/service/v1/jobs/streamingLen/[A-Za-z0-9- _.]*/[A-Za-z0-9- _]*', 'GET', 0, 'get v1 job streaming Len', id FROM usm_permissions WHERE module = 'cip'  AND permission ='jobs-StreamingLen' limit 1;

INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/service/v1/jobs/corelid/[a-zA-Z0-9]*', 'GET', 0, 'get v1 service job by corelid', id FROM usm_permissions WHERE module = 'cip'  AND permission ='jobs-Corelid-ByCorelid' limit 1;

INSERT INTO usm_permissions (module,permission) Values('cip','mladapters-updateAPISpec');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/mladapters/updateAPISpec', 'POST', 0, 'post api for mladapters updateAPISpec', id FROM usm_permissions WHERE module = 'cip'  AND permission ='mladapters-updateAPISpec' limit 1;
UPDATE usm_permission_api SET api='/api/streamingServices/pipelinesCopy/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'is_whitelisted'  AND permission ='StreamingServices-pipelineCopy' LIMIT 1) and api="/api/streamingServices/pipelinesCopy/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*";
 
UPDATE usm_permission_api SET api='/api/internaljob/jobname/[A-Za-z0-9- _.]*/[A-Za-z0-9- _.]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'is_whitelisted'  AND permission ='internaljob-Jobname-ByNameAndOrg' LIMIT 1) and api="/api/internaljob/jobname/[A-Za-z0-9- _.]*/[A-Za-z0-9- _.]*";
 
UPDATE usm_permission_api SET api='/api/pipeline/getPipelines/[A-Za-z0-9- _]*.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'is_whitelisted'  AND permission ='pipeline-getPipelines' LIMIT 1) and api="/api/pipeline/getPipelines/[A-Za-z0-9- _]*";







UPDATE usm_permission_api SET api='/api/exp/discussions/subscription/[0-9a-zA-Z-_ .]*/.*' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'cip' AND permission ='discussion-subscription' LIMIT 1) AND api='/api/exp/discussions/subscription/{userId}/{orgId}';



INSERT INTO `usm_permissions` (module, permission) VALUES ('usm','usm-read');
INSERT INTO usm_permission_api (api,TYPE,permission_id,is_whitelisted,DESCRIPTION)
SELECT api,TYPE,(SELECT id FROM `usm_permissions` WHERE permission='usm-read')permission_id,0,DESCRIPTION FROM `usm_permission_api` WHERE TYPE='GET' AND permission_id IN (SELECT id FROM `usm_permissions` WHERE module = 'usm');
 
INSERT INTO `usm_permissions` (module, permission) VALUES ('usm','usm-all');
INSERT INTO usm_permission_api (api,TYPE,permission_id,is_whitelisted,DESCRIPTION)
SELECT api,TYPE,(SELECT id FROM `usm_permissions` WHERE permission='usm-all')permission_id,0,DESCRIPTION FROM `usm_permission_api` WHERE permission_id IN (SELECT id FROM `usm_permissions` WHERE module = 'usm' AND permission !='usm-read');

INSERT INTO `usm_permissions` (module, permission) VALUES ('dbs','dbs-read');
INSERT INTO usm_permission_api (api,TYPE,permission_id,is_whitelisted,DESCRIPTION)
SELECT api,TYPE,(SELECT id FROM `usm_permissions` WHERE permission='dbs-read')permission_id,0,DESCRIPTION FROM `usm_permission_api` WHERE TYPE='GET' AND permission_id IN (SELECT id FROM `usm_permissions` WHERE module = 'dbs');
 
INSERT INTO `usm_permissions` (module, permission) VALUES ('dbs','dbs-all');
INSERT INTO usm_permission_api (api,TYPE,permission_id,is_whitelisted,DESCRIPTION)
SELECT api,TYPE,(SELECT id FROM `usm_permissions` WHERE permission='dbs-all')permission_id,0,DESCRIPTION FROM `usm_permission_api` WHERE permission_id IN (SELECT id FROM `usm_permissions` WHERE module = 'dbs' AND permission !='dbs-read');

INSERT INTO `usm_permissions` (module, permission) VALUES ('cip','cip-read');
INSERT INTO usm_permission_api (api,TYPE,permission_id,is_whitelisted,DESCRIPTION)
SELECT api,TYPE,(SELECT id FROM `usm_permissions` WHERE permission='cip-read')permission_id,0,DESCRIPTION FROM `usm_permission_api` WHERE TYPE='GET' AND permission_id IN (SELECT id FROM `usm_permissions` WHERE module = 'cip');
 
INSERT INTO `usm_permissions` (module, permission) VALUES ('cip','cip-all');
INSERT INTO usm_permission_api (api,TYPE,permission_id,is_whitelisted,DESCRIPTION)
SELECT api,TYPE,(SELECT id FROM `usm_permissions` WHERE permission='cip-all')permission_id,0,DESCRIPTION FROM `usm_permission_api` WHERE permission_id IN (SELECT id FROM `usm_permissions` WHERE module = 'cip' AND permission !='cip-read');



INSERT INTO `usm_permissions` (module, permission) VALUES ('ivm','ivm-read');
INSERT INTO usm_permission_api (api,TYPE,permission_id,is_whitelisted,DESCRIPTION)
SELECT api,TYPE,(SELECT id FROM `usm_permissions` WHERE permission='ivm-read')permission_id,0,DESCRIPTION FROM `usm_permission_api` WHERE TYPE='GET' AND permission_id IN (SELECT id FROM `usm_permissions` WHERE module = 'ivm');
 
INSERT INTO `usm_permissions` (module, permission) VALUES ('ivm','ivm-all');
INSERT INTO usm_permission_api (api,TYPE,permission_id,is_whitelisted,DESCRIPTION)
SELECT api,TYPE,(SELECT id FROM `usm_permissions` WHERE permission='ivm-all')permission_id,0,DESCRIPTION FROM `usm_permission_api` WHERE permission_id IN (SELECT id FROM `usm_permissions` WHERE module = 'ivm' AND permission !='ivm-read');



INSERT INTO usm_permissions (module,permission) Values('cip','adapterBy-adapterName-methodName-org');
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) 
SELECT '/api/adapters/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*/[A-Za-z0-9- _]*', 'ALL', 0, 'to enable permission for backend to backend api calls', id FROM usm_permissions WHERE module = 'cip'  AND permission ='adapterBy-adapterName-methodName-org' limit 1;


-- for ivm module new permissions api
UPDATE usm_permission_api SET api='/api/ivm/(add-valueLever|favorites|add-metric-lever-initiatives|createOpq|addInitiative|save-initiative-tasks|save-initiativeSubTasks|org-value-map|upload-business-case-data|create-goal|add-value-lever).*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='edit' limit 1) and api="/api/ivm/(add-valueLever|favorites|add-metric-lever-initiatives|createOpq|addInitiative|save-initiative-tasks|save-initiativeSubTasks)";
UPDATE usm_permission_api SET api='/api/ivm/(transformationtypedetails|transformation-scopes-all|subindustryy|sub-industry-all|sub-industries|ref-propels-all|questionnaire-home-pages|metrics|metricNames).*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='view' limit 1) and api="/api/ivm/(transformationtypedetails|transformation-scopes-all|subindustryy|sub-industry-all|sub-industries|ref-propels-all|questionnaire-home-pages|metrics)";
UPDATE usm_permission_api SET api='/api/ivm/(metrics-name|metrics-page|get-unit-of-measurement|get-all-metrics|initiative-canvas-All|geos|geoCountryRegion|dimension-scores|data-assessment-all|active-questionnaire-by-portfolioId).*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='view' limit 1) and api="/api/ivm/(metrics-name|metrics-page|get-unit-of-measurement|get-all-metrics|initiative-canvas-All|geos|geoCountryRegion|dimension-scores|data-assessment-all)";
UPDATE usm_permission_api SET api='/api/ivm/(get-calculation-method|metric-industry-all|tools|tool-type|getProjectSummaryInExcel).*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='view' limit 1) and api="/api/ivm/(get-calculation-method|metric-industry-all|tools|tool-type|getProjectSummaryInExcel)/";
UPDATE usm_permission_api SET api='/api/ivm/svy-(regions|countrys-ids|questions|questions-new|questionnaires|take-survey|parameterized-url-data|questionnaires-pid).*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='view' limit 1) and api="/api/ivm/svy-(regions|countrys-ids|questions|questions-new|questionnaires|take-survey|parameterized-url-data)";
UPDATE usm_permission_api SET api='/api/ivm/svy-(answer-options|dimensions|dimensions-details-score|dimensions-all|questionnaire-instances-filter).*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='view' limit 1) and api="/api/ivm/svy-(answer-options|dimensions|dimensions-details-score|dimensions-all)";

UPDATE usm_permission_api SET api='/api/ivm/svy-(geo-country|countrys|answers|answer-options|get-dimension-exclusion).*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='view' limit 1) and api="/api/ivm/svy-(geo-country|countrys|answers|answer-options|get-dimension-exclusion)/[0-9]{0,6}";
UPDATE usm_permission_api SET api='/api/ivm/(org-details_by_orgId|org-details_by_PID|valueLever|parentDimension|parameter-scores|leaf-node-dimension|individual-opq-score|dimension-score-config|dimensionNames).*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='view' limit 1) and api="/api/ivm/(org-details_by_orgId|org-details_by_PID|valueLever|parentDimension|parameter-scores|leaf-node-dimension|individual-opq-score|dimension-score-config)/[0-9]{0,6}";

UPDATE usm_permission_api SET api='/api/ivm/(question-options-by-questionId|new-svy-question-options|get-questionnaire-id|subindustry|subindustry-id|ref-propel|questionnairePagesByQuestionnaireId|questionnaire-mapped|get-questionnaire-instances).*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='view' limit 1) and api="/api/ivm/(question-options-by-questionId|new-svy-question-options|get-questionnaire-id|subindustry|subindustry-id|ref-propel|questionnairePagesByQuestionnaireId)/[0-9]{0,6}";
UPDATE usm_permission_api SET api='/api/ivm/(questionnaire-home-pages|milestone|metrics|metrics-category|get-metrics|get-metric-lever-details|get-all-metrics|get-all-metrics-dd|filtered-metrics|all-questions|get-operational-lever).*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='view' limit 1) and api="/api/ivm/(questionnaire-home-pages|milestone|metrics|metrics-category|get-metrics|get-metric-lever-details|get-all-metrics|get-all-metrics-dd|filtered-metrics)/[0-9]{0,6}";
UPDATE usm_permission_api SET api='/api/ivm/svy-usm-constants-(view|uploadSurveyButton|titleComparison|surveyComment|showReportScore|showQuartileValues|approvalworkflowneeded|selectQuestionnaireDropdownView|notice|coverage|DisableAnswersAfterSubmit|showDimensionExclusion|industyBenchmark-button-text|showDescription).*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='view' limit 1) and api='/api/ivm/svy-usm-constants-(view|uploadSurveyButton|titleComparison|surveyComment|showReportScore|showQuartileValues)/[0-9]{0,6}';
UPDATE usm_permission_api SET api='/api/ivm/(svy-get-quarter-year|track-milestone|metric-lever-initiatives|get-all-metric-lever-initiatives|opqByProjectIdQuesId|get-maturity-level).*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='view' limit 1) and api="/api/ivm/(svy-get-quarter-year|track-milestone|metric-lever-initiatives|get-all-metric-lever-initiatives|opqByProjectIdQuesId|get-maturity-level)/[0-9]{0,6}/[0-9]{0,6}";
UPDATE usm_permission_api SET api='/api/ivm/(initiatives|initiatives-by-metric-id|get-industry-benchmark|get-questionnaire-instances|data-org-subtask|questionnairePagesByProjectId|all-questionnaires).*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='view' limit 1) and api='/api/ivm/(initiatives|initiatives-by-metric-id|get-industry-benchmark|get-questionnaire-instances|data-org-subtask|questionnairePagesByProjectId|all-questionnaires)/[0-9]{0,6}/[0-9]{0,6}';
UPDATE usm_permission_api SET api='/api/ivm/(track-initiatives|initiative-intelligence-level|getInitiatives-reportBased|target-level).*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='view' limit 1) and api="/api/ivm/(track-initiatives|initiative-intelligence-level|getInitiatives-reportBased)/[0-9]{0,6}/[a-zA-Z]*";

UPDATE usm_permission_api SET api='/api/ivm/(addcreate-industry-benchmark|transformationtype|transformations-scopes|create-subtask|subindustry|ref-propel|questionnaire-home-pages|create-industry-benchmark).*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='edit' limit 1) and api="/api/ivm/(addcreate-industry-benchmark|transformationtype|transformations-scopes|create-subtask|subindustry|ref-propel|questionnaire-home-pages)";
UPDATE usm_permission_api SET api='/api/ivm/svy-(regions|questionnaires|questionnaire-instances|question-options|lk-question-types|industrys|country|answers|save-answers|answer-options).*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='edit' limit 1) and api="/api/ivm/svy-(regions|questionnaires|questionnaire-instances|question-options|lk-question-types|industrys|country|answers|save-answers|answer-options)";
UPDATE usm_permission_api SET api='/api/ivm/uploadMasterXL|uploadSurveyExcels|/.*' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='edit' LIMIT 1) AND api='/api/ivm/uploadMasterXL/[0-9]{0,6}/[0-9]{0,6}';
UPDATE usm_permission_api SET api='/api/ivm/svy-continue-survey/.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='edit' limit 1) and api="/api/ivm/svy-continue-survey/[0-9]{0,6}/[0-9]{0,6}/[0-9]{0,6}/[0-9]{0,6}";
UPDATE usm_permission_api SET api='/api/ivm/svy-dimension-exclusion/.*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='edit' limit 1) and api="/api/ivm/svy-dimension-exclusion/[0-9]{0,6}/[0-9]{0,6}/[0-9]{0,6}/[0-9]{0,6}/[0-9]{0,6}";
UPDATE usm_permission_api SET api='/api/ivm/(update-valueLever|add-metric-lever-initiatives|update-opq|update-initiative|initiative-list|update-initiativeTasks|update-value-lever).*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='edit' limit 1) and api="/api/ivm/(update-valueLever|add-metric-lever-initiatives|update-opq|update-initiative|initiative-list|update-initiativeTasks)";
UPDATE usm_permission_api SET api='/api/ivm/(update-initiativeSubTasks|transformationtype|transformations-scopes|subtasks-update|subindustry|ref-propel|questionnaire-home-pages).*' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='edit' LIMIT 1) AND api="/api/ivm/(update-initiativeSubTasks|transformationtype|transformations-scopes|subtasks-update|subindustry|ref-propel|questionnaire-home-pages)";

UPDATE usm_permission_api SET api='/api/ivm/svy-(regions|questionnaires|questionnaire-homepage-details|questionnaire-instances|question-options|lk-question-types|industrys|country|answers|answer-options).*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='edit' limit 1) and api="/api/ivm/svy-(regions|questionnaires|questionnaire-homepage-details|questionnaire-instances|question-options|lk-question-types|industrys|country|answers|answer-options)";
UPDATE usm_permission_api SET api='/api/ivm/(addscore-config|save-monthly-data|org-value-map|add-initiative|create-goal|create-canvas-data).*' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='edit' LIMIT 1) AND api='/api/ivm/(addscore-config|save-monthly-data|org-value-map|add-initiative|create-goal|create-canvas-data)';
UPDATE usm_permission_api SET api='/api/ivm/getBulkData|downloadSurveyExcel|/.*' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='view' LIMIT 1) AND api='/api/ivm/getBulkData/[0-9]{0,6}/[0-9]{0,6}/[0-9]{0,6}';
UPDATE usm_permission_api SET api='/api/ivm/svy-usm-constants-(show-on-score-zero|reportTitle|recommendInitiativeBasis|quartilename|qualitativeMetrics|getCanvasType|coverage|DisableAnswersAfterSubmit|approvalworkflowneeded|showScoreForChildDimensions|getMaturityScoreText|manage-initiative-rolename|getMetricNotApplicable).*' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='view' LIMIT 1) AND api='/api/ivm/svy-usm-constants-(show-on-score-zero|reportTitle|recommendInitiativeBasis|quartilename|qualitativeMetrics|getCanvasType|coverage|DisableAnswersAfterSubmit|approvalworkflowneeded)/[0-9]{0,6}';
UPDATE usm_permission_api SET api='/api/ivm/svy-usm-constants-(showMetricScoreWithMetrics|showMaturityLevelRange|showMaturityLevel|showImmediateInitiatives|showCoverage|showAggregatedInitatives|showAllQuestionnaires|recommendInitiativeBasis|showAIInitiatives|getPlotbandsOnLevelBasis|getLevelHeadingText).*' where permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='view' limit 1) and api='/api/ivm/svy-usm-constants-(showMetricScoreWithMetrics|showMaturityLevelRange|showMaturityLevel|showImmediateInitiatives|showCoverage|showAggregatedInitatives|showAllQuestionnaires)/[0-9]{0,6}';
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/ivm/questionnaire-homepage-details/', 'PUT', 0, 'put api for questionnaire-homepage-details', id FROM usm_permissions WHERE module = 'ivm'  AND permission ='edit' limit 1;
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/ivm/questionnaire-homepage-details/', 'POST', 0, 'post api for questionnaire-homepage-details', id FROM usm_permissions WHERE module = 'ivm'  AND permission ='edit' limit 1;
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/ivm/milestones', 'POST', 0, 'post api for ivm milestone', id FROM usm_permissions WHERE module = 'ivm'  AND permission ='view' limit 1;
UPDATE usm_permission_api SET api='/api/ivm/svy-checkmail/.*' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='view' LIMIT 1) AND api='/api/ivm/svy-checkmail/[0-9]{0,6}/[0-9]{0,6}/[0-9]{0,6}/[0-9]{0,6}';
UPDATE usm_permission_api SET api='/api/ivm/svy-(questions|questionnaires|questionnaires-pid|questionnaire|questionnaire-instances|question-options|lk-question-types|industrys).*' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='view' LIMIT 1) AND api="/api/ivm/svy-(questions|questionnaires|questionnaires-pid|questionnaire|questionnaire-instances|question-options|lk-question-types|industrys)/[0-9]{0,6}";

UPDATE usm_permission_api SET api='/api/ivm/(initiatives-all|initiative-intelligence|initiative-intelligence-chart|initiative-tasks|initiativeSubTasksByTaskId|initiativeSubTasks|org-vs-benchmark-details).*' WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'ivm'  AND permission ='view' LIMIT 1) AND api="/api/ivm/(initiatives-all|initiative-intelligence|initiative-intelligence-chart|initiative-tasks|initiativeSubTasksByTaskId|initiativeSubTasks|org-vs-benchmark-details)/[0-9]{0,6}";

INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/dashboard-configurations/[0-9]{0,6}', 'GET', 0, 'dbs-get-api-dashboard-configurations by id for Dashboard configurations', id FROM usm_permissions WHERE module = 'dbs'  AND permission ='dashboard-configurations-page-view' limit 1;


UPDATE usm_permission_api SET api='/api/exp/solution/submitSolution/' WHERE api='/api/exp/solution/submitSolution';
UPDATE usm_permission_api SET TYPE='PUT' WHERE api='/api/exp/project/editProject/[A-Za-z0-9- _]*';


INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/ivm/surveyupload', 'GET', 0, 'get api for survey_upload', id FROM usm_permissions WHERE module = 'ivm'  AND permission ='view' limit 1;


INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/ivm/svy-usm-constants-(view|show-on-score-zero|reportTitle|recommendInitiativeBasis|uploadSurveyButton|titleComparison|surveyComment|showReportScore|showQuartileValues|approvalworkflowneeded|selectQuestionnaireDropdownView|notice|coverage|DisableAnswersAfterSubmit|showDimensionExclusion|industyBenchmark-button-text|showDescription|getCanvasType|qualitativeMetrics|quartilename|showAllQuestionnaires)','GET',0,'usm-constant for ivm',id FROM usm_permissions WHERE module='ivm' AND permission='ivm-all' LIMIT 1;
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/ivm/svy-usm-constants-(showMetricScoreWithMetrics|showMaturityLevelRange|showMaturityLevel|showImmediateInitiatives|showCoverage|showAggregatedInitatives|showScoreForChildDimensions|getMetricNotApplicable|manage-initiative-rolename|getMaturityScoreText|getLevelHeadingText|getPlotbandsOnLevelBasis|showAIInitiatives|showOnlyQuestionnaireDashboard|showProjectsQuestionnaireDashboard|showPortfolioProjectsQuestionnaireDashboard)','GET',0,'usm-constant for ivm',id FROM usm_permissions WHERE module='ivm' AND permission='ivm-all' LIMIT 1;
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/ivm/all-questionnaires/[0-9]{0,6}/(true|false)','GET',0,'usm-constant for ivm',id FROM usm_permissions WHERE module='ivm' AND permission='ivm-all' LIMIT 1;
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/ivm/svy-checkmail/[0-9]{0,6}/[0-9]{0,6}/[0-9]{0,6}','GET',0,'checkemail api for ivm',id FROM usm_permissions WHERE module='ivm' AND permission='ivm-all' LIMIT 1;
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/ivm/svy-usm-constants-(setReportUrl|surveyupload|includecorequestionnaires)','GET',0,'usm-constant for ivm',id FROM usm_permissions WHERE module='ivm' AND permission='ivm-all' LIMIT 1;
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/ivm/add-metrics-hierarchy/[0-9]{0,6}','GET',0,'add-metrics-hierarchy api for ivm',id FROM usm_permissions WHERE module='ivm' AND permission='ivm-all' LIMIT 1;
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/ivm/organization-details','GET',0,'organization-details api for ivm',id FROM usm_permissions WHERE module='ivm' AND permission='ivm-all' LIMIT 1;
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/ivm/update-status-metric-lever-initiatives/.*','PUT',0,'update-status-metric-lever-initiatives api for ivm',id FROM usm_permissions WHERE module='ivm' AND permission='ivm-all' LIMIT 1;

INSERT INTO `usm_permission_api` (`api`, `type`, `permission_id`, `is_whitelisted`, `description`) VALUES('/api/exp/workbench/update','PUT','2010','0',NULL);
INSERT INTO `usm_permission_api` (`api`, `type`, `permission_id`, `is_whitelisted`, `description`) VALUES('/api/exp/workbench/update','PUT','3228','0',NULL);
INSERT INTO `usm_permission_api` (`api`, `type`, `permission_id`, `is_whitelisted`, `description`) VALUES('/api/exp/workbench/update','PUT','2233','0',NULL);
INSERT INTO usm_permission_api (api, TYPE, is_whitelisted, DESCRIPTION,permission_id) SELECT '/api/usm-role-permissionss/formodule/.*','ALL',1,'role permission',id FROM usm_permissions WHERE module='is_whitelisted' AND permission='is_whitelisted' LIMIT 1;
UPDATE usm_permission_api SET is_whitelisted=TRUE WHERE permission_id =(SELECT id FROM usm_permissions WHERE module = 'usm' AND permission ='role-permissionss-view' LIMIT 1) AND api='/api/usm-role-permissionss/formodule/.*';
INSERT INTO `usm_permission_api` (`api`, `type`, `permission_id`, `is_whitelisted`, `description`) VALUES('/api/exp/project/featureProject','PUT','2959','0',NULL);


