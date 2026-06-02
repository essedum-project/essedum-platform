package com.lfn.icip.icipwebeditor.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ICIPMLFederatedRuntimeModel {

	private Integer id;

	private Integer connid;

	private Integer connport;

	private Boolean isEXIPorts;

	private Integer exiPorts;

	private Integer pipelineid;

	private Integer appid;

	private String connendpoint;

	private Boolean isAssigned;

}
