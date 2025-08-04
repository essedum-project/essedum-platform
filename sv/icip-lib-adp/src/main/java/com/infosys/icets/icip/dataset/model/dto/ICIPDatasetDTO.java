/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package com.infosys.icets.icip.dataset.model.dto;

import java.util.List;
import java.util.Map;

import com.infosys.icets.ai.comm.lib.util.domain.BaseDomain;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPDatasetDTO.
 *
 * @author icets
 */

/**
 * Gets the dataset type.
 *
 * @return the dataset type
 */

/**
 * Gets the schemajson.
 *
 * @return the schemajson
 */

/**
 * Gets the metadata.
 *
 * @return the metadata
 */
@Getter
/**
 * Sets the dataset type.
 *
 * @param datasetType the new dataset type
 */

/**
 * Sets the schemajson.
 *
 * @param schemajson the new schemajson
 */

/**
 * Sets the metadata.
 *
 * @param metadata the new metadata
 */
@Setter
/**
 * Instantiates a new ICIP dataset DTO.
 */

/**
 * Instantiates a new ICIP dataset DTO.
 */

/**
 * Instantiates a new ICIP dataset DTO.
 */
@NoArgsConstructor

/**
 * Hash code.
 *
 * @return the int
 */
@EqualsAndHashCode(callSuper = false)
public class ICIPDatasetDTO extends BaseDomain {

	/** The id. */
	private Integer id;

	/** The name. */
	private String name;

	/** The description. */
	private String description;

	/** The schema. */
	private ICIPSchemaRegistryDTO schema;

	/** The attributes. */
	private Map<String, Object> attributes;

	/** The type. */
	private String type;

	/** The datasource. */
	private ICIPDatasource datasource;

	/** The backing dataset. */
	private ICIPDatasetDTO backingDataset;

	/** The organization. */
	private String organization;

	/** The expStatus. */
	private Integer expStatus;

	/** The schemajson. */
	private String schemajson;

	/** The views. */
	private String views;

	/** The archival config. */
	private String archivalConfig;
	
	/** The context. */
	private String context;
	
	/** The is archival enabled. */
	private Boolean isArchivalEnabled;

	/** The is audit required. */
	private Boolean isAuditRequired;
	
	/** The is approval required. */
	private Boolean isApprovalRequired;
	
	/** The is permission managed. */
	private Boolean isPermissionManaged;
	
	/** The is inbox required. */
	private Boolean isInboxRequired;

	/** The dashboard. */
	private Integer dashboard;
	
	/** The metadata. */
	private String metadata;
	
	private List<Map<String, Object>> taskdetails;
	
	private String tags;
	
	private String interfacetype;
	
	private String adaptername;
	
	private String isadapteractive;
	
	private String indexname;
	
	private String summary;

	private String event_details;
	/**
	 * Equals.
	 *
	 * @param obj the obj
	 * @return the boolean value
	 */
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (!super.equals(obj))
			return false;
		if (getClass() != obj.getClass())
			return false;
		ICIPDatasetDTO other = (ICIPDatasetDTO) obj;
		if (archivalConfig == null) {
			if (other.archivalConfig != null)
				return false;
		} else if (!archivalConfig.equals(other.archivalConfig))
			return false;
		if (attributes == null) {
			if (other.attributes != null)
				return false;
		} else if (!attributes.equals(other.attributes))
			return false;
		if (backingDataset == null) {
			if (other.backingDataset != null)
				return false;
		} else if (!backingDataset.equals(other.backingDataset))
			return false;
		if (context == null) {
			if (other.context != null)
				return false;
		} else if (!context.equals(other.context))
			return false;
		if (dashboard == null) {
			if (other.dashboard != null)
				return false;
		} else if (!dashboard.equals(other.dashboard))
			return false;
		if (datasource == null) {
			if (other.datasource != null)
				return false;
		} else if (!datasource.equals(other.datasource))
			return false;
		if (description == null) {
			if (other.description != null)
				return false;
		} else if (!description.equals(other.description))
			return false;
		if (expStatus == null) {
			if (other.expStatus != null)
				return false;
		} else if (!expStatus.equals(other.expStatus))
			return false;
		if (id == null) {
			if (other.id != null)
				return false;
		} else if (!id.equals(other.id))
			return false;
		if (isApprovalRequired == null) {
			if (other.isApprovalRequired != null)
				return false;
		} else if (!isApprovalRequired.equals(other.isApprovalRequired))
			return false;
		if (isArchivalEnabled == null) {
			if (other.isArchivalEnabled != null)
				return false;
		} else if (!isArchivalEnabled.equals(other.isArchivalEnabled))
			return false;
		if (isAuditRequired == null) {
			if (other.isAuditRequired != null)
				return false;
		} else if (!isAuditRequired.equals(other.isAuditRequired))
			return false;
		if (isInboxRequired == null) {
			if (other.isInboxRequired != null)
				return false;
		} else if (!isInboxRequired.equals(other.isInboxRequired))
			return false;
		if (isPermissionManaged == null) {
			if (other.isPermissionManaged != null)
				return false;
		} else if (!isPermissionManaged.equals(other.isPermissionManaged))
			return false;
		if (metadata == null) {
			if (other.metadata != null)
				return false;
		} else if (!metadata.equals(other.metadata))
			return false;
		if (name == null) {
			if (other.name != null)
				return false;
		} else if (!name.equals(other.name))
			return false;
		if (organization == null) {
			if (other.organization != null)
				return false;
		} else if (!organization.equals(other.organization))
			return false;
		if (schema == null) {
			if (other.schema != null)
				return false;
		} else if (!schema.equals(other.schema))
			return false;
		if (schemajson == null) {
			if (other.schemajson != null)
				return false;
		} else if (!schemajson.equals(other.schemajson))
			return false;
		if (type == null) {
			if (other.type != null)
				return false;
		} else if (!type.equals(other.type))
			return false;
		if (views == null) {
			if (other.views != null)
				return false;
		} else if (!views.equals(other.views))
			return false;
		if (interfacetype == null) {
			if (other.interfacetype != null)
				return false;
		} else if (!interfacetype.equals(other.interfacetype))
			return false;
		if (adaptername == null) {
			if (other.adaptername != null)
				return false;
		} else if (!adaptername.equals(other.adaptername))
			return false;
		if (isadapteractive == null) {
			if (other.isadapteractive != null)
				return false;
		} else if (!isadapteractive.equals(other.isadapteractive))
			return false;
		if (indexname == null) {
			if (other.indexname != null)
				return false;
		} else if (!indexname.equals(other.indexname))
			return false;
		if (summary == null) {
			if (other.summary != null)
				return false;
		} else if (!summary.equals(other.summary))
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
		int result = super.hashCode();
		result = prime * result + ((archivalConfig == null) ? 0 : archivalConfig.hashCode());
		result = prime * result + ((attributes == null) ? 0 : attributes.hashCode());
		result = prime * result + ((backingDataset == null) ? 0 : backingDataset.hashCode());
		result = prime * result + ((context == null) ? 0 : context.hashCode());
		result = prime * result + ((dashboard == null) ? 0 : dashboard.hashCode());
		result = prime * result + ((datasource == null) ? 0 : datasource.hashCode());
		result = prime * result + ((description == null) ? 0 : description.hashCode());
		result = prime * result + ((expStatus == null) ? 0 : expStatus.hashCode());
		result = prime * result + ((id == null) ? 0 : id.hashCode());
		result = prime * result + ((isApprovalRequired == null) ? 0 : isApprovalRequired.hashCode());
		result = prime * result + ((isArchivalEnabled == null) ? 0 : isArchivalEnabled.hashCode());
		result = prime * result + ((isAuditRequired == null) ? 0 : isAuditRequired.hashCode());
		result = prime * result + ((isInboxRequired == null) ? 0 : isInboxRequired.hashCode());
		result = prime * result + ((isPermissionManaged == null) ? 0 : isPermissionManaged.hashCode());
		result = prime * result + ((metadata == null) ? 0 : metadata.hashCode());
		result = prime * result + ((name == null) ? 0 : name.hashCode());
		result = prime * result + ((organization == null) ? 0 : organization.hashCode());
		result = prime * result + ((schema == null) ? 0 : schema.hashCode());
		result = prime * result + ((schemajson == null) ? 0 : schemajson.hashCode());
		result = prime * result + ((type == null) ? 0 : type.hashCode());
		result = prime * result + ((views == null) ? 0 : views.hashCode());
		result = prime * result + ((interfacetype == null) ? 0 : interfacetype.hashCode());
		result = prime * result + ((adaptername == null) ? 0 : adaptername.hashCode());
		result = prime * result + ((isadapteractive == null) ? 0 : isadapteractive.hashCode());
		result = prime * result + ((indexname == null) ? 0 : indexname.hashCode());
		result = prime * result + ((summary == null) ? 0 : summary.hashCode());
		return result;
	}

}
