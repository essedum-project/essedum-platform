package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;


	import java.util.HashMap;
	import java.util.Map;
import java.util.Objects;

import javax.annotation.processing.Generated;

	import com.fasterxml.jackson.annotation.JsonAnyGetter;
	import com.fasterxml.jackson.annotation.JsonAnySetter;
	import com.fasterxml.jackson.annotation.JsonIgnore;
	import com.fasterxml.jackson.annotation.JsonInclude;
	import com.fasterxml.jackson.annotation.JsonProperty;
	import com.fasterxml.jackson.annotation.JsonPropertyOrder;

	@JsonInclude(JsonInclude.Include.NON_NULL)
	@JsonPropertyOrder({
	    "name",
	    "artificatStorageType",
	    "inputArtifacts",
	    "stepDetails",
	    "stepArguments",
	    "environment",
	    "framework",
	    "preTrainedModelPath",
	    "outputArtifacts",
	    "metricDetails"
	})
	@Generated("jsonschema2pojo")
	public class TrainingSteps {

	    @JsonProperty("name")
	    private String name;
	    @JsonProperty("artificatStorageType")
	    private String artificatStorageType;
	    @JsonProperty("inputArtifacts")
	    private String inputArtifacts;
	    @JsonProperty("stepDetails")
	    private StepDetails stepDetails;
	    @JsonProperty("stepArguments")
	    private String stepArguments;
	    @JsonProperty("environment")
	    private String environment;
	    @JsonProperty("framework")
	    private String framework;
	    @JsonProperty("preTrainedModelPath")
	    private String preTrainedModelPath;
	    @JsonProperty("outputArtifacts")
	    private String outputArtifacts;
	    @JsonProperty("metricDetails")
	    private String metricDetails;
	    @JsonIgnore
	    private Map<String, Object> trainingStepsProperties = new HashMap<String, Object>();
		
	    public String getName() {
			return name;
		}
		public void setName(String name) {
			this.name = name;
		}
		public String getArtificatStorageType() {
			return artificatStorageType;
		}
		public void setArtificatStorageType(String artificatStorageType) {
			this.artificatStorageType = artificatStorageType;
		}
		public String getInputArtifacts() {
			return inputArtifacts;
		}
		public void setInputArtifacts(String inputArtifacts) {
			this.inputArtifacts = inputArtifacts;
		}
		public StepDetails getStepDetails() {
			return stepDetails;
		}
		public void setStepDetails(StepDetails stepDetails) {
			this.stepDetails = stepDetails;
		}
		public String getStepArguments() {
			return stepArguments;
		}
		public void setStepArguments(String stepArguments) {
			this.stepArguments = stepArguments;
		}
		public String getEnvironment() {
			return environment;
		}
		public void setEnvironment(String environment) {
			this.environment = environment;
		}
		public String getFramework() {
			return framework;
		}
		public void setFramework(String framework) {
			this.framework = framework;
		}
		public String getPreTrainedModelPath() {
			return preTrainedModelPath;
		}
		public void setPreTrainedModelPath(String preTrainedModelPath) {
			this.preTrainedModelPath = preTrainedModelPath;
		}
		public String getOutputArtifacts() {
			return outputArtifacts;
		}
		public void setOutputArtifacts(String outputArtifacts) {
			this.outputArtifacts = outputArtifacts;
		}
		public String getMetricDetails() {
			return metricDetails;
		}
		public void setMetricDetails(String metricDetails) {
			this.metricDetails = metricDetails;
		}
		public Map<String, Object> getTrainingStepsProperties() {
			return trainingStepsProperties;
		}
		public void setTrainingStepsProperties(Map<String, Object> trainingStepsProperties) {
			this.trainingStepsProperties = trainingStepsProperties;
		}
		
		
		
		@Override
		public String toString() {
			StringBuilder sb = new StringBuilder();
			sb.append(TrainingSteps.class.getName()).append('@')
					.append(Integer.toHexString(System.identityHashCode(this))).append('[');
			sb.append("name");
			sb.append('=');
			sb.append(((this.name == null) ? "<null>" : this.name));
			sb.append(',');
			sb.append("artificatStorageType");
			sb.append('=');
			sb.append(((this.artificatStorageType == null) ? "<null>" : this.artificatStorageType));
			sb.append(',');
			sb.append("inputArtifacts");
			sb.append('=');
			sb.append(((this.inputArtifacts == null) ? "<null>" : this.inputArtifacts));
			sb.append(',');
			sb.append("stepDetails");
			sb.append('=');
			sb.append(((this.stepDetails == null) ? "<null>" : this.stepDetails));
			sb.append(',');
			sb.append("stepArguments");
			sb.append('=');
			sb.append(((this.stepArguments == null) ? "<null>" : this.stepArguments));
			sb.append(',');
			sb.append("environment");
			sb.append('=');
			sb.append(((this.environment == null) ? "<null>" : this.environment));
			sb.append(',');
			sb.append("framework");
			sb.append('=');
			sb.append(((this.framework == null) ? "<null>" : this.framework));
			sb.append(',');
			sb.append("preTrainedModelPath");
			sb.append('=');
			sb.append(((this.preTrainedModelPath == null) ? "<null>" : this.preTrainedModelPath));
			sb.append(',');
			sb.append("outputArtifacts");
			sb.append('=');
			sb.append(((this.outputArtifacts == null) ? "<null>" : this.outputArtifacts));
			sb.append(',');
			sb.append("metricDetails");
			sb.append('=');
			sb.append(((this.metricDetails == null) ? "<null>" : this.metricDetails));
			sb.append(',');
			

			if (sb.charAt((sb.length() - 1)) == ',') {
				sb.setCharAt((sb.length() - 1), ']');
			} else {
				sb.append(']');
			}
			return sb.toString();
		}
		
		@Override
		public int hashCode() {
			int result = 1;
			result = ((result * 31) + ((this.name == null) ? 0 : this.name.hashCode()));
			result = ((result * 31) + ((this.artificatStorageType == null) ? 0 : this.artificatStorageType.hashCode()));
			result = ((result * 31) + ((this.inputArtifacts == null) ? 0 : this.inputArtifacts.hashCode()));
			result = ((result * 31) + ((this.stepDetails == null) ? 0 : this.stepDetails.hashCode()));
			result = ((result * 31) + ((this.stepArguments == null) ? 0 : this.stepArguments.hashCode()));
			result = ((result * 31) + ((this.environment == null) ? 0 : this.environment.hashCode()));
			result = ((result * 31) + ((this.framework == null) ? 0 : this.framework.hashCode()));
			result = ((result * 31) + ((this.preTrainedModelPath == null) ? 0 : this.preTrainedModelPath.hashCode()));
			result = ((result * 31) + ((this.outputArtifacts == null) ? 0 : this.outputArtifacts.hashCode()));
			result = ((result * 31) + ((this.metricDetails == null) ? 0 : this.metricDetails.hashCode()));

			return result;
		}
		
		@Override
		public boolean equals(Object obj) {
			if (this == obj)
				return true;
			if (obj == null)
				return false;
			if (getClass() != obj.getClass())
				return false;
			TrainingSteps other = (TrainingSteps) obj;
			return Objects.equals(artificatStorageType, other.artificatStorageType)
					&& Objects.equals(environment, other.environment) 
					&& Objects.equals(framework, other.framework)
					&& Objects.equals(inputArtifacts, other.inputArtifacts)
					&& Objects.equals(metricDetails, other.metricDetails) 
					&& Objects.equals(name, other.name)
					&& Objects.equals(outputArtifacts, other.outputArtifacts)
					&& Objects.equals(preTrainedModelPath, other.preTrainedModelPath)
					&& Objects.equals(stepArguments, other.stepArguments)
					&& Objects.equals(stepDetails, other.stepDetails)
					&& Objects.equals(trainingStepsProperties, other.trainingStepsProperties);
		}
	    
	    
}
