package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;

import org.json.JSONArray;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ModelDetailsV1 {
	private String displayName;
	private String tasktype;
	private JSONArray customTags;
	private String overview;
	private String documentation;
	private JSONArray owners;
	private JSONArray versionHistory;
	private JSONArray licenses;
	private JSONArray references;
	private JSONArray citations;
	private String path;

}
