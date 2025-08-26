package com.lfn.icip.icipmodelserver.v2.service.util.model.models;

import javax.annotation.processing.Generated;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.Getter;
import lombok.Setter;

@Generated("jsonschema2pojo")
@Getter
@Setter
public class Configs {
	private String container;
	private String bucket;
	private String instance_count;
	private String source;
	private String role;
	private String py_version;
	private String instance_type;
	private String region_name;
	private String aws_secret_access_key;
	private String aws_access_key_id;
}
