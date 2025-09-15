package com.lfn.icip.icipwebeditor.job.model;

import org.json.JSONObject;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Containers {
	private String Image;
	private String ModelDataUrl;
	private String Mode;
	private String ContainerHostname;
	private JSONObject Environment;
}
