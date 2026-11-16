package com.lfn.iamp.usm.publishing;

/** Body for POST /api/usm/assets — creates an asset and its first draft version. */
public class CreateDraftRequest {
	private Integer projectId;
	private String assetType;
	private String name;
	private String payloadRef;
	private Integer actorId;
	private String actorName;

	public Integer getProjectId() {
		return projectId;
	}

	public void setProjectId(Integer projectId) {
		this.projectId = projectId;
	}

	public String getAssetType() {
		return assetType;
	}

	public void setAssetType(String assetType) {
		this.assetType = assetType;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getPayloadRef() {
		return payloadRef;
	}

	public void setPayloadRef(String payloadRef) {
		this.payloadRef = payloadRef;
	}

	public Integer getActorId() {
		return actorId;
	}

	public void setActorId(Integer actorId) {
		this.actorId = actorId;
	}

	public String getActorName() {
		return actorName;
	}

	public void setActorName(String actorName) {
		this.actorName = actorName;
	}
}
