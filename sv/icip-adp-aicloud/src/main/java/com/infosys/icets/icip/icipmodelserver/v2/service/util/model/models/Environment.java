package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;


	import java.util.Collection;
import java.util.HashMap;
	import java.util.Map;
	import java.util.Objects;

	import javax.annotation.processing.Generated;

import org.json.JSONObject;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
		import com.fasterxml.jackson.annotation.JsonAnySetter;
		import com.fasterxml.jackson.annotation.JsonIgnore;
		import com.fasterxml.jackson.annotation.JsonInclude;
		import com.fasterxml.jackson.annotation.JsonProperty;
		import com.fasterxml.jackson.annotation.JsonPropertyOrder;

		@JsonInclude(JsonInclude.Include.NON_NULL)
		@JsonPropertyOrder({
		    "python",
		    "docker",
		    "environmentVariables",
		    "osDependencies",
		   
		})
		@Generated("jsonschema2pojo")
		public class Environment {

		    private static final String pversion = null;
			private static final String dependencyFilePath = null;
			private static final Collection<?> runCmd = null;
			private static final Collection<?> shmSize = null;
			private static final Collection<?> baseImage = null;
			private static final Collection<?> baseDockerfile = null;
			@JsonProperty("python")
		    private String python;
		    @JsonProperty("docker")
		    private String docker;
		    @JsonProperty("environmentVariables")
		    private String environmentVariables;
		    @JsonProperty("osDependencies")
		    private String osDependencies;
		   
		    @JsonIgnore
		    private Map<String, Object> environmentProperties = new HashMap<String, Object>();

		    @JsonProperty("python")
			public JSONObject getPython() {
				return this.pythonVar();
			}
		    @JsonProperty("python")
			public void setPython(String python) {
				this.python = python;
			}
		    public Environment withPython(String python) {
		        this.python = python;
		        return this;
		    }
		    
		    @JsonProperty("docker")
			public String getDocker() {
				return this.getDocker();
			}
		    
		    @JsonProperty("docker")
			public void setDocker(String docker) {
				this.docker = docker;
			}
			
			 public Environment withDocker(String docker) {
			        this.docker = docker;
			        return this;
			    }
			@JsonProperty("environmentVariables")
			public String getEnvironmentVariables() {
				return environmentVariables;
			}
			@JsonProperty("environmentVariables")
			public void setEnvironmentVariables(String environmentVariables) {
				this.environmentVariables = environmentVariables;
			}
			
			 public Environment withEnvironmentVariables(String environmentVariables) {
			        this.environmentVariables = environmentVariables;
			        return this;
			    }
			
			@JsonProperty("osDependencies")
			public String getOsDependencies() {
				return osDependencies;
			}
			@JsonProperty("osDependencies")
			public void setOsDependencies(String osDependencies) {
				this.osDependencies = osDependencies;
			}
			 public Environment withOsDependencies(String osDependencies) {
			        this.osDependencies = osDependencies;
			        return this;
			    }
			 
			public Map<String, Object> getStepDetailsProperties() {
				return environmentProperties;
			}
			 @JsonAnySetter
			    public void setAdditionalProperty(String name, Object value) {
			        this.environmentProperties.put(name, value);
			    }
			 public Environment withAdditionalProperty(String name, Object value) {
			        this.environmentProperties.put(name, value);
			        return this;
			    }
			
			 public JSONObject pythonVar() {
				
				JSONObject pythonvars = new JSONObject();
				pythonvars.put("version", pversion);
				pythonvars.put("dependencyFilePath", dependencyFilePath);
				return pythonvars;
			 }
			 
			 public JSONObject dockerVar() {
				JSONObject dockervars = new JSONObject();
				dockervars.put("baseDockerfile", baseDockerfile);
				dockervars.put("baseImage", baseImage);
				dockervars.put("shmSize", shmSize);
				dockervars.put("runCmd", runCmd);
				
				
				return dockervars; 
				
			 }
			 
			@Override
			public String toString() {
				StringBuilder sb = new StringBuilder();
				sb.append(Environment.class.getName()).append('@')
						.append(Integer.toHexString(System.identityHashCode(this))).append('[');
				sb.append("python");
				sb.append('=');
				sb.append(((this.python == null) ? "<null>" : this.python));
				sb.append(',');
				sb.append("docker");
				sb.append('=');
				sb.append(((this.docker == null) ? "<null>" : this.docker));
				sb.append(',');
				sb.append("environmentVariables");
				sb.append('=');
				sb.append(((this.environmentVariables == null) ? "<null>" : this.environmentVariables));
				sb.append(',');
				sb.append("osDependencies");
				sb.append('=');
				sb.append(((this.osDependencies == null) ? "<null>" : this.osDependencies));
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
				result = ((result * 31) + ((this.python == null) ? 0 : this.python.hashCode()));
				result = ((result * 31) + ((this.docker == null) ? 0 : this.docker.hashCode()));
				result = ((result * 31) + ((this.environmentVariables == null) ? 0 : this.environmentVariables.hashCode()));
				result = ((result * 31) + ((this.osDependencies == null) ? 0 : this.osDependencies.hashCode()));
				

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
				Environment other = (Environment) obj;
				return Objects.equals(environmentVariables, other.environmentVariables)
						&& Objects.equals(docker, other.docker)
						&& Objects.equals(python, other.python)
						&& Objects.equals(environmentProperties, other.environmentProperties)
						&& Objects.equals(osDependencies, other.osDependencies);
			}
		    
		    
}
