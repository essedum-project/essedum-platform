import { environment } from "./environment";


export const COMMON_URLS = {
  CHART_ENV: environment.chartUrl,
  DATA_PREVIEW: '/data_catalog/data/preview',
  APPLY_ACTION: '/apply_action',
  ADVISORY_DETAILS: '/statistics_advisory_details',
  USER_STORY: environment.baseUrl + '/userstory',
  EXP_DETAILS: environment.baseUrl + '/experiment',
  PIVOT_TABLE_DATA: environment.baseUrl + '/pivot_table',
  FILE_UPLOAD: environment.baseUrl + `/upload_files`,
};

export const WRANGLING_URLS = {
  EXECUTE_JOB: environment.baseUrl + '/execute_job',
  TRANSFORMED_DATA: '/transformed_file_data',
  SAVE_TRANSFORM: '/save_transformation',
  EDIT_TRANSFORM: '/edit_transformation',
  AUTO_SUGGESTION: environment.baseUrl + '/auto_suggestion',
  FE_TARGET_SET: environment.baseUrl + '/target_distribution',
  PIVOT_RECIPE: environment.baseUrl + '/save_recipe',
  PCA_CHARTS: environment.chartUrl + '/charts/pca_chart',
  DROP_MISSING_VALUE: environment.statUrl + '/alert_drop_missing_value',
  FILL_MISSING_DATES: '/alert_fill_missing_dates'
};

export const ANALYTICS_URLS = {
  USER_STORIES: environment.baseUrl + '/user_stories/',
  GET_USER_STORY: environment.baseUrl + '/get_userstory',
  FILTER_DATA: environment.baseUrl + '/filter_data',
  GET_CHARTS: environment.baseUrl + '/charts',
  GET_SPECIFIC_CHART: environment.chartUrl + '/charts',
  QUICK_STATS: environment.baseUrl + '/quick_stats',
  BIVARIATE_CHART: environment.chartUrl + '/charts/bivariate',
  BIVARIATE_TABLE: environment.baseUrl + '/bivariate_table',
  GET_SCREENSHOT: environment.baseUrl + '/screenshot',
  EDIT_DESCRIPTION: environment.baseUrl + '/edit_description',
  DENDOGRAM_VALIDATION: environment.baseUrl + '/dendrogram_table',
};

export const CATALOG_URLS = {
  GET_COLLECTIONS: environment.baseUrl + '/collections/',
  GET_EXPERIMENTS: environment.baseUrl + '/experiments/',
  DELETE_EXPERIMENT: environment.baseUrl + '/api/aip/2.0/mlflow/experiments/delete',
  CONN_DETAILS: environment.baseUrl + '/connection/objects',
  GET_COLLECTION: environment.baseUrl + '/collection',
  GET_ALL_CONNECTIONS: environment.baseUrl + '/connection_details',
  CREATE_NEW_CONNECTION: environment.baseUrl + '/connection_cs',
  CONNECTION_DETAILS: environment.baseUrl + '/connection',
  DATA_CATALOG: environment.baseUrl + '/details/data_catalog',
  ADD_TO_CATALOG: environment.baseUrl + '/data_catalog',
  GET_RECIPE: environment.baseUrl + '/recipes',
  CREATE_USER: environment.baseUrl + '/createuser',
  CHANGE_PASSWORD: environment.baseUrl + '/password_change',
  LOAD_SAMPLE_DATA: environment.baseUrl + '/sample_project_setup/',
  UNIVERSAL_SEARCH: environment.baseUrl + '/search/',
  DOWNLOAD_CATALOG_OBJECT: environment.baseUrl + '/data_catalog/data/download',
  CREATE_CONNECTION: environment.baseUrl + '/db/create_connection',
  TEST_CONNECTION: environment.baseUrl + '/db/test_db_connection',
  FETCH_TABLES: environment.baseUrl + '/db/fetch_tables_and_views',
  // FETCH_TABLES: environment.baseUrl + '/db/fetch_tables_and_views_dftype',
  FETCH_TABLE_SAMPLE: environment.baseUrl + '/db/fetch_table_or_view_limit',
  ADD_TABLE_TO_CONN: environment.baseUrl + '/db/import_resource',
  DOWNLOAD_TABLE_OBJECT: environment.baseUrl + '/db/download_file',
  FETCH_METADATA: environment.baseUrl + '/db/fetch_metadata',
  UNREGISTER_TABLE:environment.baseUrl + '/db/unregister_table',
  DBCONN_DETAILS:environment.baseUrl + '/db/connection_objects',
  URL_DATA:environment.baseUrl + '/url_connection',
  CRREATE_URL_CONN:environment.baseUrl + '/create_url_connection',
  MANAGE_URL_DATA:environment.baseUrl + '/manage_url_connection',
  UPLOAD_GCP:environment.baseUrl + '/connection',
  IMPORT_URL_TABLE:environment.baseUrl + '/url_import_resource',
  UNREGISTER_URL_TABLE:environment.baseUrl + '/url_unregister_table',
  FETCH_DF_COLUMNS:environment.baseUrl + '/dataframe/df_columnlist',
  JOIN_MERGE_PREVIEW:environment.baseUrl + '/dataframe/join_filter',
  JOIN_MERGE_DATAFRAMES:environment.baseUrl + '/dataframe/confirmation_join_filter',
  FETCH_TABLE_COLUMNS:environment.baseUrl + '/db/source_tables_column_details',
  GENERATE_QUERY:environment.baseUrl + '/db/generate_sql_query',
  VERIFY_TABLE_NAME:environment.baseUrl + '/object/verify_name',
  JOIN_MERGE_TABLES:environment.baseUrl + '/db/execute_join_filter_tables'
  // UPLOAD_GCP:environment.baseUrl + '/upload_gcp_json_files'
};

export const LOGIN = {
  USER_LOGIN: environment.baseUrl + '/login',
};

export const MODELLING_URLS = {
  VALIDATE_PARAMS: environment.baseUrl + '/validate_parms',
  EXECUTE_MODEL: environment.baseUrl + '/execute_model',
  // EVALUATE_MODEL: environment.baseUrl + '/evaluate_model',
  EVALUATE_MODEL: environment.modeUrl + '/evaluate_model',
  GET_EXPMNT_ID:
    environment.modeUrl +
    '/api/aip/2.0/mlflow/experiments/get-by-name?experiment_name=',
  FINALIZE_VERSION: environment.baseUrl + '/finalize_version',
  EXECUTE_MODEL_HOC: environment.baseUrl + '/execute_model_hoc',
  FINALIZE_EXPMNT_VERSION: environment.baseUrl + '/finalize_experiment_version',
  UPLOAD_PREDICTION: environment.baseUrl + '/upload_prediction',
  PREDICT_DATA: environment.baseUrl + '/predict_data',
  PREDICT_DATA_TS:environment.baseUrl + '/predict_data_ts',
  DOWNLOAD_PREDICTION: environment.baseUrl + '/download_prediction',
  QUESTIONNAIRE: `${environment.baseUrl}/advisory_questionnaire`,
  INTERRUPT: environment.modeUrl + '/interrupt_automl',
};
