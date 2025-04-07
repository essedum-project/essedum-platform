package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;


	

	import java.util.HashMap;
	import java.util.Map;
	import java.util.Objects;

	import javax.annotation.processing.Generated;

	import org.json.JSONArray;
	import org.json.JSONObject;

	import com.fasterxml.jackson.annotation.JsonIgnore;
	import com.fasterxml.jackson.annotation.JsonInclude;
	import com.fasterxml.jackson.annotation.JsonProperty;
	import com.fasterxml.jackson.annotation.JsonPropertyOrder;

	@JsonInclude(JsonInclude.Include.NON_NULL)
	@JsonPropertyOrder({ "name",
		"version"

	})
	@Generated("jsonschema2pojo")
	public class Framework {
	    private String name;
	    private String version;
	    public String getName() {
	        return name;
	    }
	    public void setName(String name) {
	        this.name = name;
	    }
	    public String getVersion() {
	        return version;
	    }
	    public void setVersion(String version) {
	        this.version = version;
	    }
	
		
		
		@Override
		public String toString() {
			StringBuilder sb = new StringBuilder();
			sb.append(Framework.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this)))
					.append('[');
			sb.append("name");
			sb.append('=');
			sb.append(((this.name == null) ? "<null>" : this.name));
			sb.append(',');

			sb.append("version");
			sb.append('=');
			sb.append(((this.version == null) ? "<null>" : this.version));
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
			result = ((result * 31) + ((this.version == null) ? 0 : this.version.hashCode()));

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
			Framework other = (Framework) obj;
			return Objects.equals(name, other.name)
					&& Objects.equals(version, other.version);
		}
	}


