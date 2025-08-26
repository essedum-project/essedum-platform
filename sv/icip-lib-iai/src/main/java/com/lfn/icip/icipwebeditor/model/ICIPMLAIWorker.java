package com.lfn.icip.icipwebeditor.model;

import java.io.Serializable;
import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.lfn.ai.comm.lib.util.listener.AuditListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@EntityListeners(AuditListener.class)
@Entity
@Table(name = "mlaiworker")
@NoArgsConstructor

@Getter
@Setter


public class ICIPMLAIWorker {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	@EqualsAndHashCode.Include
	private Integer id;

	@Column(name = "name")
	private String name;
	
	@Column(name = "alias")
	private String alias;
	
	@Column(name = "description")
	private String description;
	
	@Column(name = "createdby")
	private String createdby;
	
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	@Column(name = "createdon")
	public Timestamp createdon;
	
	@Column(name = "lastmodifiedby")
	private String lastmodifiedby;
	
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	@Column(name = "lastmodifiedon")
	public Timestamp lastmodifiedon;
	
	@Column(name = "organization")
	private String organization;
	
	@Column(name = "task")
	private String task;
	
	@Column(name = "inputsjson")
	private String inputsjson;
	
	@Column(name = "sop")
	private String sop;
	
	@Column(name = "plan")
	private String plan;
	
	@Column(name = "workflow_steps")
	private String workflowSteps;
	
	@Column(name = "validation_result")
	private String validationResult;
	
	@Column(name = "langgraph_json")
	private String langgraphJson;
	
	@Column(name = "bpm")
	private String bpm;
	
	@Column(name = "navigate_url")
	private String navigateUrl;
	
	@Column(name = "configuration")
	private String configuration;
	
	@Column(name = "versionname")
	private String versionname;
	
	@Column(name = "isdefault")
	private Boolean isdefault;
	
}
