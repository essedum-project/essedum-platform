package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonPropertyOrder({"scope","name","mountPath","sizeinGB"})
public class VolumeV2 {	
	private String scope ;
	private String name ;
	private String mountPath;
	private Integer sizeinGB;

    }
