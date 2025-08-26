package com.lfn.icip.icipwebeditor.model;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PortPayload {
	String startport;
	String endport;
	String exiendport;
	String existartport;
	boolean defaultPort;
	boolean exiPort;
	Integer datasourceid;
	String organization;
	boolean isAssigned;

}
