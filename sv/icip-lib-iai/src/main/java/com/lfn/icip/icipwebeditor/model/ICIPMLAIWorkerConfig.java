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
@Table(name = "mlaiworkerconfig")
@NoArgsConstructor

@Getter
@Setter

public class ICIPMLAIWorkerConfig {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer id;

	@Column(name = "name")
	private String name;
	
	@Column(name = "alias")
	private String alias;
	
	@Column(name = "description")
	private String description;
	
	@Column(name = "llm")
	private String llm;
	
	@Column(name = "knowledge_base")
	private String knowledgeBase;
	
	@Column(name = "planner")
	private String planner;
	
	@Column(name = "validator")
	private String validator;
	
	@Column(name = "generator")
	private String generator;
	
	@Column(name = "executor")
	private String executor;
	
	/**@Column(name = "task")
	private String task;
	
	@Column(name = "userinputs")
	private String userInputs;
	
	@Column(name = "bots")
	private String bots;**/
	
	@Column(name = "task_group")
	private String taskGroup;
	
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
	
	
}
