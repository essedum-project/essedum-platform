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
@JsonPropertyOrder({ "jobArgumentName"

})
@Generated("jsonschema2pojo")
public class StepArguments {

	@JsonProperty("jobArgumentName")
	private JSONArray jobArgumentName;
	
	public JSONArray getJobArgumentName() {
		return jobArgumentName;
	}
	public void setJobArgumentName(JSONArray jsonArray) {
		this.jobArgumentName = jsonArray;
	}

	
	
	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
		sb.append(StepArguments.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this)))
				.append('[');
		sb.append("jobArgumentName");
		sb.append('=');
		sb.append(((this.jobArgumentName == null) ? "<null>" : this.jobArgumentName));
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
		result = ((result * 31) + ((this.jobArgumentName == null) ? 0 : this.jobArgumentName.hashCode()));

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
		StepArguments other = (StepArguments) obj;
		return Objects.equals(jobArgumentName, other.jobArgumentName);
	}
}
