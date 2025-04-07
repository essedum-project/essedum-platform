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
@JsonPropertyOrder({ "computeType", "cpu", "memory", "gpuMemory", "gpuQty",

})
@Generated("jsonschema2pojo")
public class StepResourceConfig {

	@JsonProperty("computeType")
	private String computeType;
	@JsonProperty("cpu")
	private String cpu;
	@JsonProperty("memory")
	private String memory;
	@JsonProperty("gpuMemory")
	private String gpuMemory;
	@JsonProperty("gpuQty")
	private String gpuQty;

	@JsonIgnore
	private Map<String, Object> stepResourceConfigProps = new HashMap<String, Object>();

	@JsonProperty("computeType")
	public String getComputeType() {
		return computeType;
	}

	@JsonProperty("computeType")
	public void setComputeType(String computeType) {
		this.computeType = computeType;
	}

	public StepResourceConfig withComputeType(String computeType) {
		this.computeType = computeType;
		return this;
	}

	@JsonProperty("cpu")
	public String getCpu() {
		return cpu;
	}

	@JsonProperty("cpu")
	public void setCpu(String cpu) {
		this.cpu = cpu;
	}

	public StepResourceConfig withCpu(String cpu) {
		this.cpu = cpu;
		return this;
	}

	@JsonProperty("memory")
	public String getMemory() {
		return memory;
	}

	@JsonProperty("memory")
	public void setMemory(String memory) {
		this.memory = memory;
	}

	public StepResourceConfig withMemory(String memory) {
		this.memory = memory;
		return this;
	}

	@JsonProperty("gpuMemory")
	public String getGpuMemory() {
		return gpuMemory;
	}

	@JsonProperty("gpuMemory")
	public void setGpuMemory(String gpuMemory) {
		this.gpuMemory = gpuMemory;
	}

	public StepResourceConfig withGpuMemory(String gpuMemory) {
		this.gpuMemory = gpuMemory;
		return this;
	}

	@JsonProperty("gpuQty")
	public String getGpuQty() {
		return gpuQty;
	}

	@JsonProperty("gpuQty")
	public void setGpuQty(String gpuQty) {
		this.gpuQty = gpuQty;
	}

	public StepResourceConfig withGpuQty(String gpuQty) {
		this.gpuQty = gpuQty;
		return this;
	}

	@JsonAnyGetter
	public Map<String, Object> getStepResourceConfigProps() {
		return this.stepResourceConfigProps;
	}

	@JsonAnySetter
	public void setStepResourceConfigProps(String name, Object value) {
		this.stepResourceConfigProps.put(name, value);
	}

	public StepResourceConfig withStepResourceConfigProps(String name, Object value) {
		this.stepResourceConfigProps.put(name, value);
		return this;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
		sb.append(StepResourceConfig.class.getName()).append('@')
				.append(Integer.toHexString(System.identityHashCode(this))).append('[');
		sb.append("computeType");
		sb.append('=');
		sb.append(((this.computeType == null) ? "<null>" : this.computeType));
		sb.append(',');
		sb.append("cpu");
		sb.append('=');
		sb.append(((this.cpu == null) ? "<null>" : this.cpu));
		sb.append(',');
		sb.append("memory");
		sb.append('=');
		sb.append(((this.memory == null) ? "<null>" : this.memory));
		sb.append(',');
		sb.append("gpuMemory");
		sb.append('=');
		sb.append(((this.gpuMemory == null) ? "<null>" : this.gpuMemory));
		sb.append(',');
		sb.append("gpuQty");
		sb.append('=');
		sb.append(((this.gpuQty == null) ? "<null>" : this.gpuQty));
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
		result = ((result * 31) + ((this.computeType == null) ? 0 : this.computeType.hashCode()));
		result = ((result * 31) + ((this.cpu == null) ? 0 : this.cpu.hashCode()));
		result = ((result * 31) + ((this.memory == null) ? 0 : this.memory.hashCode()));
		result = ((result * 31) + ((this.gpuMemory == null) ? 0 : this.gpuMemory.hashCode()));
		result = ((result * 31) + ((this.gpuQty == null) ? 0 : this.gpuQty.hashCode()));

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
		StepResourceConfig src = (StepResourceConfig) obj;
		return Objects.equals(computeType, src.computeType) && Objects.equals(cpu, src.cpu)
				&& Objects.equals(gpuMemory, src.gpuMemory) && Objects.equals(gpuQty, src.gpuQty)
				&& Objects.equals(memory, src.memory);
	}

}
