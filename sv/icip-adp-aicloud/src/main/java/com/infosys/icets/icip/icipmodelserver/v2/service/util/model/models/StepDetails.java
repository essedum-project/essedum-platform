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
	    "sourceStorageType",
	    "sourceDirectory",
	    "mainScriptFile",
	    "stepResourceConfig",
	   
	})
	@Generated("jsonschema2pojo")
	public class StepDetails {

	    @JsonProperty("sourceStorageType")
	    private String sourceStorageType;
	    @JsonProperty("sourceDirectory")
	    private String sourceDirectory;
	    @JsonProperty("mainScriptFile")
	    private String mainScriptFile;
	    @JsonProperty("stepResourceConfig")
	    private StepResourceConfig stepResourceConfig;
	   
	    @JsonIgnore
	    private Map<String, Object> stepDetailsProperties = new HashMap<String, Object>();

	    @JsonProperty("sourceStorageType")
		public String getSourceStorageType() {
			return sourceStorageType;
		}
	    @JsonProperty("sourceStorageType")
		public void setSourceStorageType(String sourceStorageType) {
			this.sourceStorageType = sourceStorageType;
		}
	    public StepDetails withSourceStorageType(String sourceStorageType) {
	        this.sourceStorageType = sourceStorageType;
	        return this;
	    }
	    
	    @JsonProperty("sourceDirectory")
		public String getSourceDirectory() {
			return sourceDirectory;
		}
	    
	    @JsonProperty("sourceDirectory")
		public void setSourceDirectory(String sourceDirectory) {
			this.sourceDirectory = sourceDirectory;
		}
		
		 public StepDetails withSourceDirectory(String sourceDirectory) {
		        this.sourceDirectory = sourceDirectory;
		        return this;
		    }
		@JsonProperty("mainScriptFile")
		public String getMainScriptFile() {
			return mainScriptFile;
		}
		@JsonProperty("mainScriptFile")
		public void setMainScriptFile(String mainScriptFile) {
			this.mainScriptFile = mainScriptFile;
		}
		
		 public StepDetails withMainScriptFile(String mainScriptFile) {
		        this.mainScriptFile = mainScriptFile;
		        return this;
		    }
		
		@JsonProperty("stepResourceConfig")
		public StepResourceConfig getStepResourceConfig() {
			return stepResourceConfig;
		}
		@JsonProperty("stepResourceConfig")
		public void setStepResourceConfig(StepResourceConfig stepResourceConfig) {
			this.stepResourceConfig = stepResourceConfig;
		}
		 public StepDetails withStepResourceConfig(StepResourceConfig stepResourceConfig) {
		        this.stepResourceConfig = stepResourceConfig;
		        return this;
		    }
		 
		public Map<String, Object> getStepDetailsProperties() {
			return stepDetailsProperties;
		}
		 @JsonAnySetter
		    public void setAdditionalProperty(String name, Object value) {
		        this.stepDetailsProperties.put(name, value);
		    }
		 public StepDetails withAdditionalProperty(String name, Object value) {
		        this.stepDetailsProperties.put(name, value);
		        return this;
		    }
		
		@Override
		public String toString() {
			StringBuilder sb = new StringBuilder();
			sb.append(StepDetails.class.getName()).append('@')
					.append(Integer.toHexString(System.identityHashCode(this))).append('[');
			sb.append("sourceStorageType");
			sb.append('=');
			sb.append(((this.sourceStorageType == null) ? "<null>" : this.sourceStorageType));
			sb.append(',');
			sb.append("sourceDirectory");
			sb.append('=');
			sb.append(((this.sourceDirectory == null) ? "<null>" : this.sourceDirectory));
			sb.append(',');
			sb.append("mainScriptFile");
			sb.append('=');
			sb.append(((this.mainScriptFile == null) ? "<null>" : this.mainScriptFile));
			sb.append(',');
			sb.append("stepResourceConfig");
			sb.append('=');
			sb.append(((this.stepResourceConfig == null) ? "<null>" : this.stepResourceConfig));
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
			result = ((result * 31) + ((this.sourceStorageType == null) ? 0 : this.sourceStorageType.hashCode()));
			result = ((result * 31) + ((this.sourceDirectory == null) ? 0 : this.sourceDirectory.hashCode()));
			result = ((result * 31) + ((this.mainScriptFile == null) ? 0 : this.mainScriptFile.hashCode()));
			result = ((result * 31) + ((this.stepResourceConfig == null) ? 0 : this.stepResourceConfig.hashCode()));
			

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
			StepDetails other = (StepDetails) obj;
			return Objects.equals(mainScriptFile, other.mainScriptFile)
					&& Objects.equals(sourceDirectory, other.sourceDirectory)
					&& Objects.equals(sourceStorageType, other.sourceStorageType)
					&& Objects.equals(stepDetailsProperties, other.stepDetailsProperties)
					&& Objects.equals(stepResourceConfig, other.stepResourceConfig);
		}
	    
	    
}
