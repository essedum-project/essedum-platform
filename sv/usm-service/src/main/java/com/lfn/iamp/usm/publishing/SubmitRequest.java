package com.lfn.iamp.usm.publishing;

/** Body for POST /api/usm/assets/versions/{id}/submit. */
public class SubmitRequest {
	private String gate;
	private Integer actorId;
	private String actorName;
	private String note;

	public String getGate() {
		return gate;
	}

	public void setGate(String gate) {
		this.gate = gate;
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

	public String getNote() {
		return note;
	}

	public void setNote(String note) {
		this.note = note;
	}
}
