package com.lfn.icip.dataset.constants;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ICIPPluginConstants {

	/** BigQuery Connection Scopes. */
	public static final List<String> CREDENTIALSCOPES = Arrays.asList("https://www.googleapis.com/auth/bigquery",
			"https://www.googleapis.com/auth/cloud-platform");
	public static final String FORWARD_SLASH = "/";
	public static final String ATTRIBUTES = "attributes";
	public static final String HEADERS = "Headers";
	public static final String KEY = "key";
	public static final String VALUE = "value";
	public static final String TEST_DATA_SET = "testDataset";
	public static final String REFERER_TITLE_CASE = "Referer";
	public static final String REFERER_LOWER_CASE = "referer";
	public static final String INSTANCE = "isInstance";
	public static final String INSTANCE_DS = "instance";
	public static final String TRUE = "true";
	public static final String ACTIVE = "Y";
	public static final String NOT_ACTIVE = "N";
	public static final String QUERY_PARAMS = "QueryParams";
	public static final String PATH_VARIABLES = "PathVariables";
	public static final String SIZE = "size";
	public static final String SIZE_10 = "10";
	public static final String PAGE = "page";
	public static final String PAGE_0 = "0";
	public static final String BODY = "Body";
	public static final String MESSAGE = "message";
	public static final String MESSAGE_SUCCESS = "success";
	public static final String MESSAGE_FAILED = "failed";
	public static final String AUTHORIZATION = "Authorization";
	public static final String REMOTE = "REMOTE";
	public static final String REST = "REST";
	public static final String URL = "Url";
	public static final String REQUEST_METHOD = "RequestMethod";
	public static final String PROJECT = "project";
	public static final String ADAPTER_INSTANCE = "adapter_instance";
	public static final String IS_CACHED = "isCached";
	public static final String CONTENT_LENGTH = "Content-Length";
	public static final String FALSE_STRING = "false";
	public static final String BODY_TYPE = "bodyType";
	public static final String JSON = "JSON";
	public static final String REQUEST_METHOD_POST = "post";
	public static final String REQUEST_METHOD_GET = "get";
	public static final String REQUEST_METHOD_DELETE = "delete";
	public static final String SCRIPT_REMOTE_ENDPOINT_PATH="/api/service/v1/function/execute";
	public static final String IS_REMOTE_DS = "isRemoteDS";
	public static final String EXECUTION_ENVIRONMENT = "executionEnvironment";
	public static final String MODEL_ID = "model_id";
	public static final String ENDPOINT_ID = "endpoint_id";
	public static final String RESPONSE = "response";
	public static final String VM_SUCCESS = "VM-success";
	public static final String VM_FAILED = "VM-failed";
	public static final String FILE = "FILE";
	public static final String FILE_LOWER_CASE = "file";
	public static final String CONTENT_TYPE = "Content-Type";
	public static final String UPLOAD_FILE_PATH = "uploadFilePath";
	public static final String UPLOAD_DIRECORY_PATH = "uploadDirecoryPath";
	public static final String IS_FOR_TEST = "isForTest";
	public static final String FILE_PARAM_NAME = "fileParamName";
	public static final String REMOTE_LOWER_CASE = "remote";
	public static final String ADAPTER_LOWER_CASE = "adapter";
	public static final String LIST_OF_METHODS = "listOfMethods";
	public static final String CONNECTION_LOWER_CASE = "connection";
	public static final String INDEX_NAME = "indexname";
	public static final String SUMMARY = "summary";
	public static final String PROJECT_CORE = "Core";
	public static final String SECRETS_PATTERN = "\\$\\{(\\w+)}";
	public static final String STRING_DOLLAR = "$";
	
	@SuppressWarnings("serial")
	public static final Map<String, String> MLOPS_APIS = new HashMap<>() {
		{
			put("projects_datasets_create", "/api/service/v1/datasets");
			put("projects_datasets_list_list", "/api/service/v1/datasets/list");
			put("projects_datasets_get", "/api/service/v1/datasets/{dataset_id}");
			put("projects_datasets_delete", "/api/service/v1/datasets/{dataset_id}");
			put("projects_datasets_export_create", "/api/service/v1/datasets/{dataset_id}/export");
			put("projects_endpoints_create", "/api/service/v1/endpoints/register");
			put("projects_endpoints_list_list", "/api/service/v1/endpoints/list");
			put("projects_endpoints_get", "/api/service/v1/endpoints/{endpoint_id}");
			put("projects_endpoints_delete", "/api/service/v1/endpoints/{endpoint_id}/delete");
			put("projects_endpoints_deploy_model_create", "/api/service/v1/endpoints/{endpoint_id}/deploy_model");
			put("projects_endpoints_explain_create", "/api/service/v1/endpoints/{endpoint_id}/explain");
			put("projects_endpoints_infer_create", "/api/service/v1/endpoints/{endpoint_id}/infer");
			put("projects_endpoints_undeploy_models_create", "/api/service/v1/endpoints/{endpoint_id}/undeploy_models");
			put("projects_models_list", "/api/service/v1/models/list");
			put("projects_models_register_create", "/api/service/v1/models/register");
			put("projects_models_get", "/api/service/v1/models/{model_id}");
			put("projects_models_delete", "/api/service/v1/models/{model_id}");
			put("projects_models_export_create", "/api/service/v1/models/{model_id}/export");
			put("training_automl_simplified_create", "/api/service/v1/pipelines/training/automl");
			put("training_custom_script_create", "/api/service/v1/pipelines/training/custom_script");
			put("training_istlist", "/api/service/v1/pipelines/training/list");
			put("training_train_create", "/api/service/v1/pipelines/training/train");
			put("training_cancel_list", "/api/service/v1/pipelines/training/{training_job_id}/cancel");
			put("training_delete", "/api/service/v1/projects_pipelines/{training_job_id}/delete");
			put("training_get_list", "/api/service/v1/pipelines/training/{training_job_id}/get");
			put("projects_inferencePipelines_create", "/api/service/v1/pipelines/inference");
			put("projects_inferencePipelines_list_list", "/api/service/v1/pipelines/inference/list");
			put("projects_inferencePipelines_delete", "/api/service/v1/pipelines/inference/{inference_job_id}");
			put("projects_inferencePipelines_cancel", "/api/service/v1/pipelines/inference/{inference_job_id}/cancel");
			put("projects_inferencePipelines_get", "/api/service/v1/pipelines/inference/{inference_job_id}/get");
		}
	};
}
