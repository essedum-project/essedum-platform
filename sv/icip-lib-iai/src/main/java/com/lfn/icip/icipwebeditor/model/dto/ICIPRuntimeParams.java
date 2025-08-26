package com.lfn.icip.icipwebeditor.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
public class ICIPRuntimeParams {
	private Integer connectionId;
	private Boolean isDefaultPorts;
	private Boolean isEXIPorts;
	private Integer portStartRange;
	private Integer portEndRange;
	private Integer exiportStartRange;
	private Integer exiportEndRange;
	private String organization;

	public Integer getConnectionId() {
		return connectionId;
	}

	public void setConnectionId(Integer connectionId) {
		this.connectionId = connectionId;
	}

	public Boolean getIsDefaultPorts() {
		return isDefaultPorts;
	}

	public void setIsDefaultPorts(Boolean isDefaultPorts) {
		this.isDefaultPorts = isDefaultPorts;
	}

	public Boolean getIsEXIPorts() {
		return isEXIPorts;
	}

	public void setIsEXIPorts(Boolean isEXIPorts) {
		this.isEXIPorts = isEXIPorts;
	}

	public Integer getPortStartRange() {
		return portStartRange;
	}

	public void setPortStartRange(Integer portStartRange) {
		this.portStartRange = portStartRange;
	}

	public Integer getPortEndRange() {
		return portEndRange;
	}

	public void setPortEndRange(Integer portEndRange) {
		this.portEndRange = portEndRange;
	}

	public Integer getExiportStartRange() {
		return exiportStartRange;
	}

	public void setExiportStartRange(Integer exiportStartRange) {
		this.exiportStartRange = exiportStartRange;
	}

	public Integer getExiportEndRange() {
		return exiportEndRange;
	}

	public void setExiportEndRange(Integer exiportEndRange) {
		this.exiportEndRange = exiportEndRange;
	}

	public String getOrganization() {
		return organization;
	}

	public void setOrganization(String organization) {
		this.organization = organization;
	}

}
