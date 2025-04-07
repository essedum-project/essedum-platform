export const TITLES = {
    NEWCONNECTIONHEADER: 'CREATE CONNECTION',
    UPDATECONNECTIONHEADER: 'EDIT CONNECTION',
    NEWQUERYHEADER: 'CREATE NEW QUERY',
    VIEWMETADATATITLE: 'DATASET',
    PREVIEWDATASETTITLE: 'PREVIEW',
    EDITFLOW: 'EDIT FLOW',
    CREATEFLOW: 'CREATE FLOW',
    ADDCOLLECTION: 'CREATE COLLECTION',
    ALLCONNECTIONS: 'CONNECTION OBJECTS',
    VIEWCOLLECTION: 'COLLECTION',
    STORYBOARD: 'STORY BOARD',
    UPDATEMODEL: 'EDIT MODEL',
    CREATEMODEL: 'CREATE MODEL',
    CREATESTORY: 'CREATE STORY',
    NEWRECIPE: 'CREATE/EDIT RECIPE',
    STORYNAME: 'STORY : ',
    VIEWFLOW: 'VIEW FLOW',
    VIEWMODEL: 'VIEW MODEL',
    EDITSTORY: 'EDIT STORY : ',
    ADDFILES: 'ADD FILES FROM CATALOG',
    NEWFILENAME: 'NEW FILE',
    COMPAREALGORITHMS: 'COMPARISON OF ALGORITHMS',
    NEWEXPERIMENT: 'CREATE/EDIT EXPERIMENT',
  };
  export const CONNDETAILSCONFIG = [
    { field: 'connection_name', header: 'Connection' },
    { field: 'collection_name', header: 'Tagged Collections' },
    { field: 'object_name', header: 'Object Name' },
    { field: 'object_type', header: 'Object Type' },
    { field: 'recipe_name_source', header: 'Recipe Name' },
    { field: 'actions', header: 'Actions' },
  ];
  export const COLLENTITYCONFIG = [
    { field: 'connection_name', header: 'Connection' },
    { field: 'object_name', header: 'Object Name' },
    { field: 'object_type', header: 'Object Type' },
    { field: 'catalog_added', header: 'Is Added to Catalog' },
    { field: 'dataset_type', header: 'Dataset Type' },
  ];
  export const DELIMITER = [
    { name: 'At (@)', code: '@' },
    { name: 'Cap (^)', code: '^' },
    { name: 'Comma (,)', code: ',' },
    { name: 'Dollar ($)', code: '$' },
    { name: 'Hash (#)', code: '#' },
    { name: 'Percentage (%)', code: '%' },
    { name: 'Pipe (|)', code: '|' },
    { name: 'Tilda (~)', code: '~' },
    { name: 'Tab', code: '  ' },
    { name: 'Colon (:)', code: ':' },
  ];
  export const FILEDOWNLOADfORMAT = [
    { name: 'CSV', value: '.csv' },
    { name: 'XLSX', value: '.xlsx' },
  ];
  export const FILEEXTENSION = [
    { name: 'CSV', code: '.csv' },
    { name: 'DAT', code: '.dat' },
    { name: 'TEXT', code: 'text' },
    { name: 'XLS', code: '.xls' },
    { name: 'XLSX', code: '.xlsx' },
  ];
  export const SEPERATOR = [{ name: 'New Line', code: '\n' }];
  export const ANALYTICSMENU = [
    {
      label: 'Quick Stats',
      icon: '',
      id: 1,
      routerLink: ['./stats'],
    },
    {
      label: 'Bivariate Analytics',
      icon: '',
      id: 2,
      routerLink: ['./bivariate'],
    },
    {
      label: 'Open Exploration',
      icon: '',
      id: 3,
      routerLink: ['./exploration'],
    },
    {
      label: 'Pivots',
      icon: '',
      id: 5,
      routerLink: ['./pivot'],
    },
    {
      label: 'Multivariate Analytics',
      icon: '',
      id: 4,
      routerLink: ['./multivariate'],
    },
  ];
  export const DROPLENGENDSLABEL = {
    color: 'Color based drop here',
    shape: 'Shape based drop here',
    size: 'Size based drop here',
  };
  export const CATALOGMENU = [
    { label: 'Data Sets', icon: '', id: 1 },
    { label: 'Models', icon: '', id: 2 },
    { label: 'Stories', icon: '', id: 3 },
    { label: 'Flows', icon: '', id: 4 },
  ];
  export const COLUMNDATATYPES = [
    { name: 'Int', code: 'int64' },
    { name: 'Float', code: 'float64' },
    { name: 'Int', code: 'int32' },
    { name: 'Int', code: 'uint8' },
    { name: 'Float', code: 'float32' },
    { name: 'String', code: 'object' },
    { name: 'String', code: 'string' },
    { name: 'String', code: 'category' },
    { name: 'Datetime', code: 'datetime64' },
  ];
  export const CATEGORICALFUNCTIONS = ['count', 'mode'];
  export const TEMPORALFUNCTIONS = ['count'];
  export const QUANTITATIVEFUNCTIONS = [
    'sum',
    'min',
    'max',
    'mean',
    'median',
    'stddev',
    'variance',
  ];
  export const OPENEXPFILTERDEFAULTLBL = 'Drop here to filter';
  export const QUANTDATATYPES = ['int64', 'float64', 'int32', 'float32'];
  export const CATAGORICALDATATYPES = ['category', 'string', 'object'];
  export const TEMPORALDATATYPES = ['datetime64'];
  export const CHARTAPI = {
    vertical_bar: '/vbar',
    horizontal_bar: '/hbar',
    pie_chart: '/pie',
    doughnut_chart: '/doughnut',
    histogram: '/histogram',
    box_plot: '/boxplot',
    scatter_chart: '/scatter',
    heatmap: '/heatmap',
    line_chart: '/linechart',
    barstack: '/bar_stack',
    columnstack: '/column_stack',
    areastack: '/area_stack',
    hexbin: '/hexbin',
    kde: '/kde',
    pareto: '/pareto',
    joint_plot: '/joint_plot',
    line_scatter: '/scatterline',
    bubble_chart: '/bubble',
    sl_plot: '/sl_plot',
    qq_plot: '/qq_plot',
    timeseries_range_chart: '/timeseries',
    timeseries_decomposition_chart: '/timeseries',
    timeseries_line_chart: '/timeseries',
    timeseries_outliers_chart: '/timeseries',
    word_length_similarity_chart: '/nlp',
    word_frequency_chart: '/nlp',
    word_cloud: '/wordcloud_chart',
    splom_chart: '/splom_chart',
    parallel_coordinates_plot: '/parallel_chart',
    correlation_node_chart: '/corr_node',
    dendrogram: '/dendrogram',
    sunburst_chart: '/sunburst',
    ridge_plot: '/ridge_chart'
  };
  export const NOAGGREGATECHARTS = [
    'histogram',
    'box_plot',
    'hexbin',
    'kde',
    'joint_plot',
    'timeseries_line_chart',
    'timeseries_decomposition_chart',
    'timeseries_range_chart',
    'timeseries_outliers_chart',
    'word_frequency_chart',
    'word_length_similarity_chart',
  ];
  export const SELECTCATAGORICALDATA = ['doughnut_chart', 'pie_chart'];
  export const SELECTQUANTITATIVEDATA = ['scatter_chart', 'histogram'];
  export const TRANSDUPACTIONARRAY = ['shuffle_column', 'frame_sorter'];
  export const TRANSNONCOLUMNACTIONS = [
    'drop_missing_data_by_threshold_value',
    'drop_missing_values',
    'drop_duplicate_columns',
    'first_row_as_header',
  ];
  
  export const AGGREGATES_QUAN_XAXIS = [
    'count',
    'sum',
    'mean',
    'min',
    'max',
    'stddev',
    'variance',
    'median',
  ];
  export const AGGREGATES_CAT_XAXIS = ['count'];
  export const SCATTER_AGGREGATES_QUAN_YAXIS = [
    'count',
    'sum',
    'mean',
    'min',
    'max',
    'stddev',
    'variance',
    'median',
  ];
  export const OTHERCHARTS_AGGREGATES_QUAN_YAXIS = [
    'sum',
    'count',
    'mean',
    'min',
    'max',
    'stddev',
    'variance',
    'median',
  ];
  export const AGGREGATES_CAT_YAXIS = ['count', 'mode'];
  export const AGGREGATES_TEM_YAXIS = ['count', 'min', 'max'];
  export const PIE_CAT_XAXIS = ['count'];
  export const OTHERCHARTS_QUAN_XAXIS = ['count', 'mode'];
  export const FLOWSUBMENU = ['create-flow', 'all-flows'];
  export const MODELSUBMENU = ['create-model', 'all-models'];
  export const COLLECTIONSUBMENU = ['create-collection', 'all-collections'];
  export const STORYSUBMENU = ['create-story', 'all-stories'];
  export const TAGGEDCONNECTIONSTABLE = [
    { field: 'connection_name', header: 'Connection Name' },
    { field: 'object_name', header: 'Object Name' },
    { field: 'object_type', header: 'Object Type' },
    { field: 'recipe_name_source', header: 'Recipe Name' },
    { field: 'actions', header: 'Actions' },
  ];
  export const TAGGEDEXPERIMENTSTABLE = [
    { field: 'experiment_name', header: 'Experiment Name' },
    { field: 'object_name', header: 'Object Name' },
    { field: 'target_attribute', header: 'Target Attribute' },
    { field: 'actions', header: 'Actions' },
  ];
  export const TAGGEDSTORIESTABLE = [
    { field: 'user_stories_name', header: 'Story Name' },
    // { field: 'object_name', header: 'Object Name' },
    // { field: 'target_attribute', header: 'Target Attribute' },
    { field: 'actions', header: 'Actions' },
  ];
  export const CONNECTIONSEARCHPARAMS = [
    'connection_id',
    'connection_name',
    'database_name',
    'collection_name',
  ];
  
  export const MODELLINGPROBLEMLIST = [
    { label: 'Classification', id: 1, value: 'classification', filter: 'classification_scikit' },
    { label: 'Clustering', id: 2, value: 'clustering', filter: 'clustering_scikit' },
    { label: 'Regression', id: 3, value: 'regression', filter: 'regression_scikit' },
  ];
  //modified
  export const MODELLINGXGBOOSTPROBLEMLIST = [
    { label: 'Classification', id: 1, value: 'classification', filter: 'classification_xg' },
    { label: 'Regression', id: 2, value: 'regression', filter: 'regression_xg' },
  ];
  export const MODELLINGLIGHTGBMPROBLEMLIST = [
    { label: 'Classification', id: 1, value: 'classification', filter: 'classification_lgbm' },
    { label: 'Regression', id: 2, value: 'regression', filter: 'regression_lgbm' },
  ];
  // export const MODELINGFBPROPHETPROBLEMLIST =[
  //   { label: 'Forecasting', id: 1, value: 'Forecasting', filter: 'forecasting_fbp' },
  // ];
  
  export const MODELLINGDARTSPROBLEMLIST =[
    // { label: 'Forecasting', id: 1, value: 'Forecasting', filter: 'Forecasting_dt' },
    { label: 'Forecasting', id: 1, value: 'Forecasting', filter: 'Forecasting_dt' },
  ];
  //
  export const MODELLINGSAPROBLEMLIST= [
    { label: 'Sentiment Analysis', id: 1, value: 'sentiment_analysis', filter: 'sentiment_analysis' },
  ];
  export const MODELLINGXGBOOSTSAPROBLEMLIST = [
    { label: 'Sentiment Analysis', id: 1, value: 'sentiment_analysis_xg', filter: 'sentiment_analysis_xg' },
  ];
  export const MODELLINGLIGHTGBMSAPROBLEMLIST = [
    { label: 'Sentiment Analysis', id: 1, value: 'sentiment_analysis_lgbm', filter: 'sentiment_analysis_lgbm' },
  ];
  
  export const MODELLINGALGORITHMS = {
    classification_scikit: [
      { label: 'K-NearestNeighbors', id: 1 },
      { label: 'Gaussian Naive Bayes', id: 2 },
      { label: 'Decision Trees', id: 3 },
      { label: 'Random Forest', id: 4 },
      { label: 'Support Vector Machine', id: 5 },
      { label: 'Logistic Regression', id: 6 },
      { label: 'Neural Networks', id: 7 },
      { label: 'Linear discriminant Analysis', id: 8 },
      { label: 'Gradient Boosting', id: 9 },
      // { label: 'Light Gradient Boosting', id: 9},
      { label: 'Bernoulli Naive Bayes', id: 10 },
      { label: 'Multinomial Naive Bayes', id: 11},
    ],
  
    clustering_scikit: [
      { label: 'KMeans Clustering', id: 1 },
      { label: 'MiniBatch KMeans', id: 2 },
      { label: 'Agglomerative Clustering', id: 3 },
      { label: 'DBSCAN', id: 4 },
      { label: 'OPTICS', id: 5 },
      { label: 'Birch', id: 6 },
    ],
    regression_scikit: [
      { label: 'Linear Regression', id: 1 },
      { label: 'Polynomial Regression', id: 2 },
      { label: 'Lasso Regression', id: 3 },
      { label: 'Ridge Regression', id: 4 },
      { label: 'Decision Tree Regression', id: 5 },
      { label: 'Random Forest Regression', id: 6 },
      { label: 'Support Vector Regression', id: 7 },
      { label: 'Gradient Boosting Regression', id: 8 },
    ],
    classification_xg: [
      { label: 'XGBoost Classifier', id: 1 },
    ],
    regression_xg: [
      { label: 'XGBoost Regressor', id: 1 },
    ],
    classification_lgbm: [
      { label: 'Light Gradient Boosting', id: 1 }
    ],
    regression_lgbm: [
      { label: 'Light Gradient Boosting Regressor', id: 1 }
    ],
    // forecasting_fbp:[
    // { label: 'FBProphet', id: 1 }
    // ],
    Forecasting_dt:[
    // { label: 'FBProphet', id: 1 },
      { label: 'Arima', id: 1 },
      { label: 'Sarima', id: 2},
       { label: 'FBProphet', id: 3},
    ],
    sentiment_analysis:[ 
      { label: 'K-NearestNeighbors', id: 1 },
      { label: 'Gaussian Naive Bayes', id: 2 },
      { label: 'Decision Trees', id: 3 },
      { label: 'Random Forest', id: 4 },
      { label: 'Support Vector Machine', id: 5 },
      { label: 'Logistic Regression', id: 6 },
      { label: 'Neural Networks', id: 7 },
      { label: 'Linear discriminant Analysis', id: 8 },
      { label: 'Gradient Boosting', id: 9 },
      { label: 'Bernoulli Naive Bayes', id: 10 },
      { label: 'Multinomial Naive Bayes', id: 11},
    ],
    sentiment_analysis_xg: [
      { label: 'XGBoost Classifier', id: 1 },
    ],
    sentiment_analysis_lgbm: [
      { label: 'Light Gradient Boosting', id: 1 }
    ],
  };
  
  export const MODELLINGALGORITHMCODES = [
    //Classification
    {
      label: 'K-NearestNeighbors',
      value: 'knn_classification',
      problem: 'classification_scikit',
    },
    {
      label: 'Gaussian Naive Bayes',
      value: 'gaussian_naive_bayes_classification',
      problem: 'classification_scikit',
    },
    {
      label: 'Decision Trees',
      value: 'decision_tree_classification',
      problem: 'classification_scikit',
    },
    {
      label: 'Random Forest',
      value: 'random_forest_classification',
      problem: 'classification_scikit',
    },
    {
      label: 'Support Vector Machine',
      value: 'svc_classification',
      problem: 'classification_scikit',
    },
    {
      label: 'Logistic Regression',
      value: 'logistic_regression_classification',
      problem: 'classification_scikit',
    },
    {
      label: 'Neural Networks',
      value: 'multi_layer_perceptron_classification',
      problem: 'classification_scikit',
    },
    {
      label: 'Linear discriminant Analysis',
      value: 'linear_discriminant_analysis_classification',
      problem: 'classification_scikit',
    },
    {
      label: 'Gradient Boosting',
      value: 'gradient_boost_classification',
      problem: 'classification_scikit',
    },
    {
      label: 'Bernoulli Naive Bayes',
      value: 'bernoulli_naive_bayes_classification',
      problem: 'classification_scikit',
    },
    {
      label: 'Multinomial Naive Bayes',
      value: 'multinomial_naive_bayes_classification',
      problem: 'classification_scikit',
    },
  
    //LightGBM
    { label: 'Light Gradient Boosting', value: 'lgbm_classification', problem: 'classification_lgbm' },
    { label: 'Light Gradient Boosting Regressor', value: 'lgbm_regression', problem: 'regression_lgbm' },
  
    // XGboost
    { label: 'XGBoost Classifier', value: 'xgboost_classification', problem: 'classification_xg' },
    { label: 'XGBoost Regressor', value: 'xgboost_regression', problem: 'regression_xg' },
  
   // FBProphet
   { label: 'FBProphet', value: 'FBPROPHET', problem: 'Forecasting_dt' },
  
     //Arima & Sarima
   // { label: 'FBProphet', value: 'fbprophet', problem: 'forecasting_dt' },
     { label: 'Arima', value: 'ARIMA', problem: 'Forecasting_dt' },
     { label: 'Sarima', value: 'SARIMA', problem: 'Forecasting_dt'},
    //Clustering
    {
      label: 'KMeans Clustering',
      value: 'kmeans_clustering',
      problem: 'clustering_scikit',
    },
    {
      label: 'MiniBatch KMeans',
      value: 'mini_batch_kmeans_clustering',
      problem: 'clustering_scikit',
    },
    {
      label: 'Agglomerative Clustering',
      value: 'agglomerative_clustering',
      problem: 'clustering_scikit',
    },
    { label: 'DBSCAN', value: 'dbscan_clustering', problem: 'clustering_scikit' },
    { label: 'OPTICS', value: 'optics_clustering', problem: 'clustering_scikit' },
    { label: 'Birch', value: 'birch_clustering', problem: 'clustering_scikit' },
    //Regression
    {
      label: 'Linear Regression',
      value: 'linear_regression',
      problem: 'regression_scikit',
    },
    {
      label: 'Polynomial Regression',
      value: 'polynomial_regression',
      problem: 'regression_scikit',
    },
    {
      label: 'Lasso Regression',
      value: 'lasso_regression',
      problem: 'regression_scikit',
    },
    {
      label: 'Ridge Regression',
      value: 'ridge_regression',
      problem: 'regression_scikit',
    },
    {
      label: 'Decision Tree Regression',
      value: 'decision_tree_regression',
      problem: 'regression_scikit',
    },
    {
      label: 'Random Forest Regression',
      value: 'random_forest_regression',
      problem: 'regression_scikit',
    },
    {
      label: 'Support Vector Regression',
      value: 'support_vector_regression',
      problem: 'regression_scikit',
    },
    {
      label: 'Gradient Boosting Regression',
      value: 'gradient_boosting_regression',
      problem: 'regression_scikit',
    },
    //sentiment Analysis
    {
      label: 'K-NearestNeighbors',
      value: 'knn',
      problem: 'sentiment_analysis',
    },
    {
      label: 'Gaussian Naive Bayes',
      value: 'gaussian_naive_bayes',
      problem: 'sentiment_analysis',
    },
    {
      label: 'Decision Trees',
      value: 'decision_tree',
      problem: 'sentiment_analysis',
    },
    {
      label: 'Random Forest',
      value: 'random_forest',
      problem: 'sentiment_analysis',
    },
    {
      label: 'Support Vector Machine',
      value: 'svc',
      problem: 'sentiment_analysis',
    },
    {
      label: 'Logistic Regression',
      value: 'logistic_regression',
      problem: 'sentiment_analysis',
    },
    {
      label: 'Neural Networks',
      value: 'multi_layer_perceptron',
      problem: 'sentiment_analysis',
    },
    {
      label: 'Linear discriminant Analysis',
      value: 'linear_discriminant_analysis',
      problem: 'sentiment_analysis',
    },
    {
      label: 'Gradient Boosting',
      value: 'gradient_boost',
      problem: 'sentiment_analysis',
    },
    {
      label: 'Bernouli Naive Bayes',
      value: 'bernouli_naive_bayes',
      problem: 'sentiment_analysis',
    },
    {
      label: 'Multinomial Naive Bayes',
      value: 'multinomial_naive_bayes',
      problem: 'sentiment_analysis',
    },
    //Sentiment Analysis Xgboost
    { label: 'XGBoost Classifier', value: 'xgboost', problem: 'sentiment_analysis_xg' },
    //Sentiment Analysis lgbm
    { label: 'Light Gradient Boosting', value: 'lgbm', problem: 'sentiment_analysis_lgbm' },
  ];
  
  export const EMPTYIMAGEDATA =
    'iVBORw0KGgoAAAANSUhEUgAAAEQAAABECAAAAAAdeMxuAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPo' +
    'AAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAHdElNRQfkBQQDJSTQNWF8AAAD/klEQVRYw83Ya0xTSRQA' +
    '4NPSh1owoKISV8Tgq5ooJrqsAfEdCNH4QozxHTXREGP0j2bdxXWjq64Y9YcJLvjAJwbjA8UfGlHjO6KQUFREhRKVBtRY0UKhvcdzpy' +
    '29LW3t3G6i59e9k5mvt3fOzJwW8H8I+AkRu40r7D6QjwUrMrliyf433kjjAjVwhmJitReyR8lrUKxq90AsaczmCLG//q0HYk4CUC7' +
    'LOxh05K3TAgx42QnRlfLMamUPn0j4DS6k549EBLPxbWuISP225Hj9rEJLKEjleDavXTeY5SPvU50pptotHznZsS70dXIRYXVHtmuL5' +
    'SLt89wrL1/2k6zqQDTnZb+Tw2EuZPAr2YgpxWko/xJkI/gggRnqFR9QPoI1G0fHxE7+j+Wa/LVjb3xa89l5/WNXsQzk/RWDECryZr5m6' +
    'K0QkdoZNJ1jnnmOFGxcSPUUlhRp76RG885FNzkQQ7Jzra38LEEud4P40qCRit9c60SdbXUjO6hh+P0gkbKx7qMyIt89RWxLSSgPCrk7' +
    'Unrg9r3kMixTWUOiIQjk+jDPY3tYmbNrwwhHQ8rz7yIl8d6Hf5Kzb3kvZ8PU14ER4dwvnUuITLb4sVjrakgzBkKEwhgfdYhyLTuw9jr36' +
    'aieujkNVX4R+7HePquZLjliqq6hM2fo8gMlD5/cLqqsGeIPye8FviPqFGJLGvyaa3QlfnvFxn6+kGu5kX4rq7ib2DA+2yRdBPay9bWdEN' +
    '08/wbAaEPjLbFEa6srLTxRXMH2SIu1E6IIXPstFYsKy6VFg3SqMG3vlN21kodyI4GjRxF1q14a3jFjowqtvIjid3qjj8aIl7rYuGjxII' +
    'vY2cqJjDIiPhfXZdTmGy/rKo5O7wrQbZ/AhShyEL8uFK8icllR35zbByDmDhfSrwrxgs6RMgXs84XTVINmWniQGS1ozaSjPJ1msO9FNsS2' +
    'CSDyDg+yhWamP8A20yy6GXiNjXk2AGA7BxJWQFuEBiLvYe0kutXfE8e0zQXIaA8e0VCBdVQJg+sRqxLpfuRjcdAfABOag0e0JYh5CtCLB0h5' +
    'AjUkiT91tgMkmyXI12kBEdUZxDMq6M9+Jd0Vt89Uypss2p0sEkRUA8UeGtsdNEWs79VYaplj+kRPnyV9sdgwM+DyW2zDJsr5DMcHn6WtS7Hk' +
    'SDioTnggaNo3N9VvTMui776Vlk0B6yscp71RHUUnmdEToSlrDRCUpS/oXcReYElvd2xfYf+iN/LdOER5H/3niza6bMwQkfQmfsS6pQvtI' +
    '3Hzs//JGieuo8Qq5EfQkhMtyeJ0A8pB0HZ9ZqSDUA/f1YTyEMQvt/+enTRuypqT9dJ6jv9fi7Zmc4tXRfgz/n8SQnwDy+2/4LRz0ckAAAA' +
    'ldEVYdGRhdGU6Y3JlYXRlADIwMjAtMDUtMDRUMDM6Mzc6MzYtMDQ6MDCUt/DqAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIwLTA1LTA0VDAzOj' +
    'M3OjM2LTA0OjAw5epIVgAAAABJRU5ErkJggg==';
  export const QUANT_QUERY_OPERATORS = [
    { name: 'SUM', code: 'SUM' },
    { name: 'AVG', code: 'AVG' },
    { name: 'MIN', code: 'MIN' },
    { name: 'MAX', code: 'MAX' },
  ];
  export const CAT_QUERY_OPERATORS = [{ name: 'COUNT', code: 'COUNT' }];
  export const TEMP_QUERY_OPERATORS = [{ name: 'COUNT', code: 'COUNT' }];
  export const ALL_QUERY_OPERATORS = [
    {
      name: 'SUM',
      code: 'SUM',
      dataTypes: ['int64', 'float64', 'int32', 'float32'],
    },
    {
      name: 'AVG',
      code: 'AVG',
      dataTypes: ['int64', 'float64', 'int32', 'float32'],
    },
    {
      name: 'MIN',
      code: 'MIN',
      dataTypes: ['int64', 'float64', 'int32', 'float32'],
    },
    {
      name: 'MAX',
      code: 'MAX',
      dataTypes: ['int64', 'float64', 'int32', 'float32'],
    },
    { name: 'COUNT', code: 'COUNT', dataTypes: ['category', 'string', 'object'] },
  ];
  export const FEATURE_ENGG_FUNCTIONS = [
    { label: 'Feature Scaling', name: 'feature_scaling' },
    { label: 'Principal Component Analysis', name: 'feature_pca' },
    { label: 'Feature Encoding', name: 'feature_encoding' },
    { label: 'Binning', name: 'feature_binning' },
    { label: 'Target Selection', name: 'shuffle_column' },
    { label: 'Remove Columns', name: 'drop_columns' },
    { label: 'Remove Outlier', name: 'drop_rows' },
    { label: 'Impute Numeric Columns', name: 'impute_na_value_numeric' },
    { label: 'Impute Categorical Columns', name: 'impute_na_value_categorical' },
    { label: 'Impute Outlier Numeric Columns', name: 'impute_outlier_numeric' },
    { label: 'Impute Outlier Categorical Columns', name: 'impute_outlier_categorical' },
    { label: 'Feature Balance', name: 'feature_imbalance' },
    { label: 'Multiple Correspondence Analysis', name: 'feature_mca' },
    { label: 'Factor Analysis', name: 'feature_famd' },
    { label: 'Remove Outliers', name: 'feature_outliers' },
    { label: 'Feature Selection', name: 'drop_features' },
    { label: 'Diff', name: 'transform_diff' },
    { label: 'Cyclic Encoding', name: 'encode_cyclic_data' },
    { label: 'Expanding', name: 'expand' },
    { label: 'Rolling', name: 'rolling' },
    { label: 'Log', name: 'transform_log' },
    { label: 'Lags Leads Generation', name: 'lags_leads_generation' },
    // { label: 'Extract DateColumn Features', name: 'featurize_date' },
    { label: 'BoxCox', name: 'transform_boxcox' },
    { label: 'Glove Embedding', name: 'glove_embedding' },
    {label: 'Feature Embedding', name: 'feature_embedding' },
  ];
  
  export const FE_ACTION_WITH_TARGET = [
    'feature_scaling',
    'feature_pca',
    'feature_imbalance',
    'feature_mca',
    'feature_famd',
    'feature_outliers',
  ];
  export const FEATURENONCOLUMNACTIONS = ['feature_scaling', 'pca'];
  export const LEXERELIMITERS = ['.', '(', ')', '=', ','];
  export const ATTRIBUTEPATTERNREGEX = /[\[.*\]]+$/;
  // export const FUNCPATTERNREGEX = /^[A-Z(_)a-z]+$/;
  export const FUNCPATTERNREGEX = /^[A-Z_a-z]+$/;
  export const MODELLINGMETRICS = [
    // Classification
    { label: 'Accuracy', code: 'accuracy' },
    { label: 'Area Under ROC', code: 'area_under_roc' },
    { label: 'F1 Score', code: 'f1_score' },
    { label: 'Precision', code: 'precision' },
    { label: 'Recall', code: 'recall' },
    // Clustering
    { label: 'Calinski Harabasz Score', code: 'calinski_harabasz_score' },
    { label: 'Davies Douldin Score', code: 'davies_bouldin_score' },
    { label: 'Silhoutte Score', code: 'silhoutte_score' },
    // Regression
    { label: 'Adjusted Rsquared', code: 'Adj_Rsquared' },
    { label: 'RMSE', code: 'RMSE' },
    { label: 'MAE', code: 'MAE' },
    { label: 'R2', code: 'r2' },
    //Forecasting
    { label: 'MAE', code: 'MAE' },
    { label: 'MAPE', code: 'MAPE' },
    { label: 'MSE', code: 'MSE' },
    { label: 'RMSE', code: 'RMSE' },
    { label: 'MDAE', code: 'MDAE' },
  
  ];
  // export const Logistic_List = [
  //   { name: 'cap', code: 'cap' },
  //   { name: 'floor', code: 'floor' },]
  
  const htmlPrefix = 'app-flowchart';
  const leftConnectorType = 'leftConnector';
  const rightConnectorType = 'rightConnector';
  
  export const FlowchartConstants = {
    htmlPrefix,
    leftConnectorType,
    rightConnectorType,
    curvedStyle: 'curved',
    lineStyle: 'line',
    dragAnimationRepaint: 'repaint',
    dragAnimationShadow: 'shadow',
    canvasClass: htmlPrefix + '-canvas',
    selectedClass: htmlPrefix + '-selected',
    editClass: htmlPrefix + '-edit',
    activeClass: htmlPrefix + '-active',
    hoverClass: htmlPrefix + '-hover',
    draggingClass: htmlPrefix + '-dragging',
    edgeClass: htmlPrefix + '-edge',
    edgeLabelClass: htmlPrefix + '-edge-label',
    connectorClass: htmlPrefix + '-connector',
    magnetClass: htmlPrefix + '-magnet',
    nodeClass: htmlPrefix + '-node',
    nodeOverlayClass: htmlPrefix + '-node-overlay',
    leftConnectorClass: htmlPrefix + '-' + leftConnectorType + 's',
    rightConnectorClass: htmlPrefix + '-' + rightConnectorType + 's',
    canvasResizeThreshold: 200,
    canvasResizeStep: 200,
  };
  export const NOTIFYMESSAGE = 'Please go to My Catalog -> Data Catalog';
  export const WRANGPAGEHEIRARCHY = [
    {
      label: 'My Catalog',
      routerLink: '../catalog/data-catalog',
    },
    {
      label: 'Wrangling',
      routerLink: './process',
    },
  ];
  export const ANALYTICSPAGEHEIRARCHY = [
    {
      label: 'My Catalog',
      routerLink: '../catalog/data-catalog',
    },
    {
      label: 'Analytics',
      routerLink: './stats',
    },
  ];
  export const FEPAGEHEIRARCHY = [
    {
      label: 'My Catalog',
      routerLink: '../catalog/data-catalog',
    },
    {
      label: 'Feature Engineering',
      routerLink: './feature',
    },
  ];
  export const MONITORINGPAGEHEIRARCHY = [
    {
      label: 'My Catalog',
      routerLink: '../catalog/data-catalog',
    },
    {
      label: 'Monitoring',
      routerLink: '../monitoring',
    },
  ];
  export const MODELLINGPAGEHEIRARCHY = [
    {
      label: 'My Catalog',
      routerLink: '../catalog/data-catalog',
    },
    {
      label: 'Modelling',
      routerLink: './selection',
    },
  ];
  export const TEXTMSGCONST = {
    NODATA: 'No data available',
  };
  export const FWITHCONDITIONALATTRIBUTES = [
    'MINIF',
    'MAXIF',
    'MODEIF',
    'MEANIF',
    'SUMIF',
  ];
  export const ALLOWEDSYMBOLS = ['>', '<', '=', '<>', '<=', '>='];
  export const WRANACTIONSTATS = {
    field: 'columns-converted-to-rows',
    header: 'columns-converted-to-rows',
    type: '',
    min: '',
    max: '',
    mean: '',
    median: '',
    count: '',
    std: '',
    unique: '',
    top: '',
    freq: '',
    nullCount: '',
    startdate: '',
    enddate: '',
  };
  export const WRANACTIONCOLSSTATS = {
    field: 'converted-column-values',
    header: 'converted-column-values',
    type: '',
    min: '',
    max: '',
    mean: '',
    median: '',
    count: '',
    std: '',
    unique: '',
    top: '',
    freq: '',
    nullCount: '',
    startdate: '',
    enddate: '',
  };
  export const EMPTYEXPTEXT =
    'Please start an expression => [newcol] = [existing_column] . functionName()';
  export const FLOWTAB = {
    label: 'FLOWS',
    icon: 'fa fa-exchange',
    close: false,
    recipe: null,
    colsMetaData: null,
    objDetails: null,
    tooltip: '',
    actionsPerformed: [],
    saveBtnLabel: '',
    selectedFunctions: [],
    selectedArgs: [],
    actionsAvailable: [],
    selectedColumnActions: [],
    selectedColumnsTableAction: [],
    columnDataTypes: null,
    updatedRecipeActions: [],
    rows: [],
    columns: [],
    values: [],
    filter: [],
    attributeList: [],
  };
  
  export const DUALARGFUNCTIONS = ['QUOTIENT', 'ADD', 'SUB', 'DIVIDE', 'PRODUCT', 'VARGROUPBY',
    'COUNTGROUPBY', 'MEDIANGROUPBY', 'MODEGROUPBY', 'MEANGROUPBY', 'MAXGROUPBY', 'MINGROUPBY', 'SUMGROUPBY', 'BASE'];
  export const CONNECTIONSTABLE = [
    { field: 'connection_name', header: 'Connection Name' },
    { field: 'collection_name', header: 'Tagged Collections' },
    { field: 'actions', header: 'Actions' },
  ];
  export const STORIESTABLE = [
    { field: 'user_stories_name', header: 'Story Name' },
    { field: 'collection_name', header: 'Tagged Collections' },
    { field: 'actions', header: 'Actions' },
  ];
  export const DEFAULT_BTN_TOGGLE_VIEW = {
    browse: { label: 'Browse Files', icon: 'fa fa-eye' },
    edit: { label: 'Edit', icon: 'fa fa-pencil-alt' },
    upload: { label: 'Upload Files', icon: 'fa fa-upload' },
    tag: { label: 'Tag Collection', icon: 'fa fa-tag' },
    remove: { label: 'Remove', icon: 'fa fa-times' },
  };
  export const CONNECTION_BTN_TOGGLE_VIEW = {
    managedata: { label: 'Manage Meta Data', icon: 'fa fa-database' },
    browse: { label: 'Browse Files', icon: 'fa fa-eye' },
    edit: { label: 'Edit', icon: 'fa fa-pencil-alt' },
    upload: { label: 'Upload Files', icon: 'fa fa-upload' },
    tag: { label: 'Tag Collection', icon: 'fa fa-tag' },
    remove: { label: 'Remove', icon: 'fa fa-times' },
  };
  export const STORY_BTN_TOGGLE_VIEW = {
    browse: { label: 'Browse Files', icon: 'fa fa-eye' },
    edit: { label: 'Edit', icon: 'fa fa-pencil-alt' },
    tag: { label: 'Tag Collection', icon: 'fa fa-tag' },
    remove: { label: 'Remove', icon: 'fa fa-times' },
  };
  export const COLLECTIONTABLE = [
    { field: 'collection_name', header: 'Collection Name' },
    { field: 'actions', header: 'Actions' },
  ];
  export const COLLECTION_BTN_TOGGLE_VIEW = {
    browse: { label: 'Browse', icon: 'fa fa-eye' },
    remove: { label: 'Remove', icon: 'fa fa-times' },
  };
  export const EXP_BTN_TOGGLE_VIEW = {
    browse: { label: 'Predict', icon: 'fa fa-chart-line' },
    edit: { label: 'Evaluate', icon: 'fa fa-flask' },
    tag: { label: 'Tag Collection', icon: 'fa fa-tag' },
    remove: { label: 'Remove', icon: 'fa fa-times' },
  };
  export const EXPTABLE = [
    { field: 'experiment_name', header: 'Experiment Name' },
    { field: 'collection_name', header: 'Tagged Collections' },
    { field: 'actions', header: 'Actions' },
  ];
  export const FLOW_BTN_TOGGLE_VIEW = {
    browse: { label: 'Browse', icon: 'fa fa-eye' },
    tag: { label: 'Tag Collection', icon: 'fa fa-tag' },
    remove: { label: 'Remove', icon: 'fa fa-times' },
  };
  export const FLOWTABLE = [
    { field: 'flowName', header: 'Flow Name' },
    { field: 'collection_name', header: 'Tagged Collections' },
    { field: 'actions', header: 'Actions' },
  ];
  export const QUICKSTATSCOLUMNS = [
    { field: 'type', header: 'Data Type' },
    { field: 'count', header: 'Count' },
    { field: 'nullCount', header: 'Null Count' },
    { field: 'unique', header: 'Unique Count' },
    { field: 'top', header: 'Frequent Value' },
    { field: 'freq', header: 'Frequency' },
    { field: 'min', header: 'Min Value' },
    { field: 'max', header: 'Max Value' },
    { field: 'mean', header: 'Mean' },
    { field: 'median', header: 'Median' },
    { field: 'std', header: 'Std Deviation' },
    { field: 'chart', header: 'Chart' },
  ];
  export const SAMEATTRIBUTEFUNCTIONS = ['FILL_NA', 'FILL_EMPTY'];
  export const LIST_VALUE_FUNCTIONS = ['IN', 'NOTIN'];
  export const OPERATOR_PACKS = [
    { label: 'Aggregate', value: 'aggregate' },
    { label: 'Math', value: 'math' },
    { label: 'General', value: 'general' },
    { label: 'Comparison', value: 'comparison' },
  ];
  export const DEFAULT_OPERATOR_PACKS = [
    { pack: 'comparison' },
    { pack: 'general' },
    { pack: 'math' },
    { pack: 'aggregate' },
    { pack: 'logical' },
    { pack: 'groupby' },
    { pack: 'datetime' },
    { pack: 'trigonometric' },
    { pack: 'type' },
    { pack: 'financepack' },
  ];
  export const ARTIFACT_TYPES = [
    { code: 'COLLECTIONS', label: 'Collection' },
    { code: 'CONNECTIONS', label: 'Connection' },
    { code: 'EXPERIMENTS', label: 'Experiment' },
    { code: 'RECIPES', label: 'Recipe' },
    { code: 'USER_STORIES', label: 'Story' },
  ];
  export const QUERY_OPERATOR_TABLE_HEADERS = ['Operator Packs', 'Formula'];
  export const BIVARIATE_DETAILS_CHART = {
    'Correlation Heatmap': 'correlation_chart',
    'Correlation Node': 'correlation_node_chart',
  };
  export const CORR_CHART_ENDPOINTS = {
    'Correlation Heatmap': '/correlation_plot',
    'Correlation Node': '/corr_node',
  };
  
  export const BOOL_LIST = [
    { name: 'TRUE', code: 'True' },
    { name: 'FALSE', code: 'False' },
  ];
  export const LINKAGE_LIST = [
    { name: 'Ward', code: 'ward' },
    { name: 'Single', code: 'single' },
    { name: 'Complete', code: 'complete' },
    { name: 'Average', code: 'average' },
    { name: 'Weighted', code: 'weighted' },
    { name: 'Centroid', code: 'centroid' },
    { name: 'Median', code: 'median' }
  ];
  export const MODELLING_LIB = [
    { label: 'Scikit-Learn', value: 'scikit-learn', disabled: false , datasetType:'machine_learning'},
    { label: 'XGBoost', value: 'xgboost', disabled: false , datasetType:'machine_learning'},
    { label: 'LightGBM', value: 'lightgbm', disabled: false , datasetType:'machine_learning'},
    { label: 'Scikit-Learn', value: 'scikit-learn_txt', disabled: false , datasetType:'text_analytics'},
    { label: 'XGBoost', value: 'xgboost_txt', disabled: false , datasetType:'text_analytics'},
    { label: 'LightGBM', value: 'lightgbm_txt', disabled: false , datasetType:'text_analytics'},
    //{ label: 'FBProphet', value: 'fbprophet', disabled: false , datasetType:'timeseries'},
    { label: 'Darts', value: 'darts', disabled: false , datasetType:'timeseries'},
    { label: 'CatBoost', value: 'catboost', disabled: true , datasetType:'machine_learning'},
    { label: 'PyTorch', value: 'pytorch', disabled: true , datasetType:'machine_learning'},
    { label: 'TensorFlow', value: 'tensorflow', disabled: true , datasetType:'machine_learning'},
    { label: 'H2O', value: 'h2o', disabled: true , datasetType:'machine_learning'},
  ];
  
  export const DISABLED_ADVISORIES = [
    'find_and_update_column_data',
    'cleanse_column_data',
  ];
  export const MULTICLASS_MSG = 'multiclass classification';
  export const META_DATA_ESTIMATOR = [
    { label: 'None', value: 'None' },
    { label: 'One Vs Rest', value: 'one_vs_rest' },
    { label: 'One vs One', value: 'one_vs_one' },
    { label: 'Output Code', value: 'output_code' },
  ];
  
  export const MULTI_VARIATE_ENDPOINTS = {
    parallel_coordinates_plot: '/parallel_chart',
    ridge_plot: '/ridge_chart',
    splom_chart: '/splom_chart',
    correlation_node_chart: '/corr_node',
    dendrogram: '/dendrogram',
    sunburst_chart: '/sunburst',
  };
  
  export const SCREEN_DOC = {
    '/advisory/catalog/data-catalog': '/docs/intro/',
    '/advisory/catalog/conn-catalog': '/docs/exampleDataset/',
    '/advisory/catalog/flows': '/docs/flowsWorking/',
    '/advisory/catalog/experiments': '/docs/modExperiment/',
    '/advisory/catalog/collections': '/docs/working/',
    '/advisory/catalog/stories': '/docs/storyboard/',
    '/advisory/wrangling/process': '/docs/basicWrangling/',
    '/advisory/analytics/stats': '/docs/quickStats/',
    '/advisory/analytics/bivariate': '/docs/bivariateAnalytics/',
    '/advisory/analytics/exploration': '/docs/openExploration/',
    '/advisory/analytics/pivot': '/docs/pivots/',
    '/advisory/analytics/multivariate': '/docs/multivariateAnalytics/',
    '/advisory/featureEngg/feature': '/docs/FE/',
    '/advisory/modelling/evaluate': '/docs/modWorking/',
    '/advisory/modelling/selection': '/docs/modWorking/',
    '/advisory/modelling/prediction': '/docs/modWorking/',
  };
  export const EXCECPTION_PACKS = ['logical'];
  export const NO_ATTRIBUTE_FUNCTION = ['TODAY'];
  export const FE_MULTI_PARAM_ADVISORY = ['feature_encoding', 'feature_binning'];
  
  export const THEME_COLORS = [
    { color: '#2F115F', tableColor: '#ff4778' },
    { color: '#007ad9', tableColor: '#e02365' },
    { color: '#2d2d2d', tableColor: '#ffd92c' }
  ];
  