package com.lfn.icip.icipwebeditor.job.model;

import org.json.JSONArray;
import org.json.JSONObject;

import lombok.Getter;

import lombok.Setter;

@Getter
@Setter
public class ModelBody {
private String ExecutionRoleArn;
private String ModelName;
private JSONArray Containers;
}

/*
{
"ExecutionRoleArn": "arn:aws:iam::451256804668:role/service-role/A2ISageMaker-ExecutionRole-20220613T035320",
"ModelName": "string20aprilmodel",
"Containers": [ 
   { 
      IRECTOR"ContainerHostname": "Container1",
      "Environment": {
         "AUTOML_SPARSE_ENCODE_RECORDIO_PROTOBUF": "1",
         "SAGEMAKER_DEFAULT_INVOCATIONS_ACCEPT": "application/x-recordio-protobuf",
         "SAGEMAKER_PROGRAM": "sagemaker_serve",
         "SAGEMAKER_SUBMIT_DY": "/opt/ml/model/code"
     },
     "Image": "683313688378.dkr.ecr.us-east-1.amazonaws.com/sagemaker-sklearn-automl:2.5-1-cpu-py3",
     "Mode": "SingleModel",
     "ModelDataUrl": "s3://aiplatdata1/housing04April23/awstraining04April23/data-processor-models/awstraining04April23-dpp1-1-a4ae4b450dcf417a99f80bd2b9ae4140ce1/output/model.tar.gz"
   }
]
}

*/