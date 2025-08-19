package com.lfn.icip.icipwebeditor.model;

public class PortDetails {
	private String startport;
	private String endport;
	private String existartport;
	private String exiendport;
	private Boolean exiPort;
	private Boolean defaultPort;

	// Constructor
	public PortDetails(String startport, String endport, String existartport, String exiendport, Boolean exiPort,
			Boolean defaultPort) {
		super();
		this.startport = startport;
		this.endport = endport;
		this.existartport = existartport;
		this.exiendport = exiendport;
		this.exiPort = exiPort;
		this.defaultPort = defaultPort;
	}

	// Getters and Setters
	public String getStartport() {
		return startport;
	}

	public void setStartport(String startport) {
		this.startport = startport;
	}

	public String getEndport() {
		return endport;
	}

	public void setEndport(String endport) {
		this.endport = endport;
	}

	public String getExistartport() {
		return existartport;
	}

	public void setExistartport(String existartport) {
		this.existartport = existartport;
	}

	public String getExiendport() {
		return exiendport;
	}

	public void setExiendport(String exiendport) {
		this.exiendport = exiendport;
	}

	public Boolean getExiPort() {
		return exiPort;
	}

	public void setExiPort(Boolean exiPort) {
		this.exiPort = exiPort;
	}

	public Boolean getDefaultPort() {
		return defaultPort;
	}

	public void setDefaultPort(Boolean defaultPort) {
		this.defaultPort = defaultPort;
	}

}
