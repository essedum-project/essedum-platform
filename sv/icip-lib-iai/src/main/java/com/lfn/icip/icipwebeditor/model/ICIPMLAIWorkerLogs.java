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
@Table(name = "mlaiworkerlogs")
@NoArgsConstructor

@Getter
@Setter
public class ICIPMLAIWorkerLogs {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	@EqualsAndHashCode.Include
	private Integer id;
	
	@Column(name = "task")
	private String task;
	
	@Column(name = "worker")
	private String worker;
	
	@Column(name = "runtime")
	private String runtime;
	
	@Column(name = "runtimeDsrc")
	private String runtimeDsrc;
	
	@Column(name = "context")
	private String context;
	
	@Column(name = "organization")
	private String organization;
	
	@Column(name = "submittedBy")
	private String submittedBy;
	
	@Column(name = "submittedOn")
	public Timestamp submittedOn;
	
	@Column(name = "finishtime")
	public Timestamp finishTime;
	
	@Column(name = "jobStatus")
	private String jobStatus;
	
	@Column(name = "uid")
	private String uid;
	
}
