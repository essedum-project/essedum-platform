package com.lfn.iamp.usm.domain;

import jakarta.annotation.Generated;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.lfn.ai.comm.lib.util.listener.AuditListener;
import com.lfn.iamp.usm.domain.Project;
import com.lfn.iamp.usm.domain.Project2;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "usm_secrets",uniqueConstraints = @UniqueConstraint(columnNames = { "project_id", "key_"}))
@Data
public class UsmSecret {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	Integer id;
	
	@Column(name="key_")
	String key;
	
	@Column(name="value_")
	String value;
	
	@JoinColumn(name = "project_id")
	@ManyToOne
	public Project projectId;
	
	@Column(name="salt_")
	String salt;
	
	

}
