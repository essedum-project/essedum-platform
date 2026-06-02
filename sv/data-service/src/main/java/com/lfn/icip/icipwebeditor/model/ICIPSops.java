package com.lfn.icip.icipwebeditor.model;

import java.io.Serializable;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import com.lfn.ai.comm.lib.util.listener.AuditListener;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

//TODO: Auto-generated Javadoc
//
/**
* A IcmSops.
*/
/**
* @author essedum
*/
@EntityListeners(AuditListener.class)
@Entity
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id", scope = ICIPSops.class)
@Table(name = "icm_sops")

/**
* Sets the sop doc.
*
* @param sopDoc the new sop doc
*/
@Setter

/**
* Gets the sop doc.
*
* @return the sop doc
*/
@Getter

/**
* Hash code.
*
* @return the int
*/
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)

/**
* To string.
*
* @return the java.lang. string
*/
@ToString
public class ICIPSops implements Serializable{


	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The created by date. */
	@Column(name = "created_by_date")
	@JsonFormat(pattern = "yyyy-MM-dd")
	private LocalDate createdByDate;

	/** The description. */
	private String description;

	/** The details. */
	private String details;

	/** The flowchart json. */
	@Column(name = "flowchart_json")
	private String flowchartJson;

	/** The workflow engine. */
	@Column(name = "workflow_engine")
	private String workflowEngine;

	/** The workflow name. */
	@Column(name = "workflow_name")
	private String workflowName;
	
	/** The project id. */
	@Column(name = "project_id")
	private Integer projectId;

	/** The id. */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer id;

	/** The created by. */
	@Column(name = "created_by")
	private String createdBy;

	/** The name. */
	private String name;

	/** The sop doc name. */
	@Column(name = "sop_doc_name")
	private String sopDocName;

	/** The sop doc content type. */
	@Column(name = "sop_doc_content_type")
	private String sopDocContentType;

	/** The alias id. */
	@JoinColumn(name = "alias_id")
	@ManyToOne
	private ICIPSopsAlias aliasId;

	/** The alias type. */
	@Column(name = "alias_type")
	private String aliasType;

	/** The sop doc. */
	@Column(name = "sop_doc")
	@Lob
	private byte[] sopDoc;

	/**
	 * Alias type.
	 *
	 * @param aliasType the alias type
	 * @return the icm sops
	 */
	public ICIPSops setAliasType(String aliasType) {
		this.aliasType = aliasType;
		return this;
	}

	/**
	 * Alias id.
	 *
	 * @param aliasId the alias id
	 * @return the icm sops
	 */
	public ICIPSops setAliasId(ICIPSopsAlias aliasId) {
		this.aliasId = aliasId;
		return this;
	}

	/**
	 * Description.
	 *
	 * @param description the description
	 * @return the icm sops
	 */
	public ICIPSops setDescription(String description) {
		this.description = description;
		return this;
	}

	/**
	 * Equals.
	 *
	 * @param obj the obj
	 * @return the boolean value
	 */
//	@Override
//	public boolean equals(Object obj) {
//		if (this == obj)
//			return true;
//		if (obj == null)
//			return false;
//		if (getClass() != obj.getClass())
//			return false;
//		ICIPSops other = (ICIPSops) obj;
//		if (id == null) {
//			if (other.id != null)
//				return false;
//		} else if (!id.equals(other.id))
//			return false;
//		return true;
//	}
	@Override
	public boolean equals(Object obj) {
	    if (this == obj)
	        return true;
	    if (obj == null)
	        return false;
	    if (getClass() != obj.getClass())
	        return false;
	    ICIPSops other = (ICIPSops) obj;
	    if (getId() == null) {
	        if (other.getId() != null)
	            return false;
	    } else if (!getId().equals(other.getId()))
	        return false;
	    return true;
	}


	/**
	 * hashCode.
	 *
	 * @return the hashcode
	 */
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((getId() == null) ? 0 : getId().hashCode());
		return result;
	}
	
	


	/**
	 * Name.
	 *
	 * @param name the name
	 * @return the icm sops
	 */
//	 public IcmSops setName(String name) {
//		this.name = name;
//		return this;
//	}
}
