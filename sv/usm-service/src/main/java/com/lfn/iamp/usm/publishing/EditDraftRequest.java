package com.lfn.iamp.usm.publishing;

/** Body for PUT /api/usm/assets/versions/{id} — edit a draft in place, or POST .../assets/{id}/versions to re-open. */
public class EditDraftRequest {
	private String name;
	private String payloadRef;
	private Integer actorId;
	private String actorName;

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
