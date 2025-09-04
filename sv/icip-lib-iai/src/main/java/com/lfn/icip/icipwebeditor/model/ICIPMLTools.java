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
@Table(name = "mltools")
@NoArgsConstructor

@Getter
@Setter
public class ICIPMLTools {
	
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
	
	@Column(name = "organization")
	private String organization;
	
	@Column(name = "createdBy")
	private String createdBy;
	
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	@Column(name = "createdOn")
	public Timestamp createdOn;
	
	@Column(name = "category")
	private String category;
	
	@Column(name = "toolType")
	private String toolType;
	
	@Column(name = "inputParams")
	private String inputParams;
	
	@Column(name = "outputParams")
	private String outputParams;
	
	@Column(name = "jsonContent")
	private String jsonContent;
	
	
}
