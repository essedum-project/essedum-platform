package com.lfn.icip.icipwebeditor.v1.events.model;

import org.springframework.context.ApplicationEvent;

import lombok.Getter;

@Getter
public class TaskActivityEvent extends ApplicationEvent{
	private static final long serialVersionUID = 1L;

	private String organization;

	private Integer initiativeId;

	private Integer artifactId;

	private String artifactType;
	
	private String activity_id;
	

	public TaskActivityEvent(Object source, String organization, Integer initiativeId,
			Integer artifactId, String artifactType, String activity_id) {
		super(source);
		this.organization = organization;
		this.initiativeId = initiativeId;
		this.artifactId = artifactId;
		this.artifactType = artifactType;
		this.activity_id = activity_id;
		}
}
