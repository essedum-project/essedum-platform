package com.lfn.icip.icipwebeditor.model;

public class ValidatePorts {
	private PortDetails portDetails;
	private String dsUrl;

	// Constructor
	public ValidatePorts(PortDetails portDetails, String dsUrl) {
		this.portDetails = portDetails;
		this.dsUrl = dsUrl;
	}

	// Getters and Setters
	public PortDetails getPortDetails() {
		return portDetails;
	}

	public void setPortDetails(PortDetails portDetails) {
		this.portDetails = portDetails;
	}

	public String getDsUrl() {
		return dsUrl;
	}

	public void setDsUrl(String dsUrl) {
		this.dsUrl = dsUrl;
	}

	@Override
	public String toString() {
		return "RequestPayload{" + "portDetails=" + portDetails + ", dsUrl='" + dsUrl + '\'' + '}';
	}
}

