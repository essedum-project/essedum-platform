package com.lfn.icip.icipwebeditor.job.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EndpointConfiguration {
   private String endpointConfigName;
   private String modelName;
   private String instanceType;
   private String variantName;
   private int initialInstanceCount;
}
