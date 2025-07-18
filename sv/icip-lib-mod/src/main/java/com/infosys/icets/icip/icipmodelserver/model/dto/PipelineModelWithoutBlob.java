/**
 * @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.icip.icipmodelserver.model.dto;

import com.infosys.icets.icip.icipmodelserver.model.ICIPPipelineModel;

import lombok.Data;

// TODO: Auto-generated Javadoc
/**
 * Instantiates a new pipeline model without blob.
 */

/**
 * Instantiates a new pipeline model without blob.
 */
@Data
public class PipelineModelWithoutBlob {
	
	/** The id. */
	private Integer id;
	
	/** The modelname. */
	private String modelname;
	
	/** The modelpath. */
	private String modelpath;
	
	/** The explanation. */
	private String explanation;
	
	/** The organization. */
	private String organization;
	
	/** The apispec. */
	private String apispec;
	
	/** The fileid. */
	private String fileid;
	
	/** The status. */
	private Integer status;
	
	/** The modelserver. */
	private Integer modelserver;
	
	/** The localupload. */
	private Integer localupload;
	
	/** The serverupload. */
	private Integer serverupload;
	
	/** The error. */
	private Integer error;
	
	/** The metadata. */
	private String metadata;

	/**
	 * Convert.
	 *
	 * @param model the model
	 * @return the pipeline model without blob
	 */
	public static PipelineModelWithoutBlob convert(ICIPPipelineModel model) {
		PipelineModelWithoutBlob pipelineModel = new PipelineModelWithoutBlob();
		pipelineModel.setId(model.getId());
		pipelineModel.setModelname(model.getModelname());
		pipelineModel.setModelpath(model.getModelpath());
		pipelineModel.setExplanation(model.getDescription());
		pipelineModel.setApispec(model.getApispec());
		pipelineModel.setFileid(model.getFileid());
		pipelineModel.setStatus(model.getStatus());
		pipelineModel.setModelserver(model.getModelserver());
		pipelineModel.setLocalupload(model.getLocalupload());
		pipelineModel.setServerupload(model.getServerupload());
		pipelineModel.setError(model.getError());
		pipelineModel.setOrganization(model.getOrganization());
		pipelineModel.setMetadata(model.getMetadata());
		return pipelineModel;
	}

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
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		PipelineModelWithoutBlob other = (PipelineModelWithoutBlob) obj;
		if (apispec == null) {
			if (other.apispec != null)
				return false;
		} else if (!apispec.equals(other.apispec))
			return false;
		if (error == null) {
			if (other.error != null)
				return false;
		} else if (!error.equals(other.error))
			return false;
		if (explanation == null) {
			if (other.explanation != null)
				return false;
		} else if (!explanation.equals(other.explanation))
			return false;
		if (fileid == null) {
			if (other.fileid != null)
				return false;
		} else if (!fileid.equals(other.fileid))
			return false;
		if (id == null) {
			if (other.id != null)
				return false;
		} else if (!id.equals(other.id))
			return false;
		if (localupload == null) {
			if (other.localupload != null)
				return false;
		} else if (!localupload.equals(other.localupload))
			return false;
		if (metadata == null) {
			if (other.metadata != null)
				return false;
		} else if (!metadata.equals(other.metadata))
			return false;
		if (modelname == null) {
			if (other.modelname != null)
				return false;
		} else if (!modelname.equals(other.modelname))
			return false;
		if (modelpath == null) {
			if (other.modelpath != null)
				return false;
		} else if (!modelpath.equals(other.modelpath))
			return false;
		if (modelserver == null) {
			if (other.modelserver != null)
				return false;
		} else if (!modelserver.equals(other.modelserver))
			return false;
		if (organization == null) {
			if (other.organization != null)
				return false;
		} else if (!organization.equals(other.organization))
			return false;
		if (serverupload == null) {
			if (other.serverupload != null)
				return false;
		} else if (!serverupload.equals(other.serverupload))
			return false;
		if (status == null) {
			if (other.status != null)
				return false;
		} else if (!status.equals(other.status))
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
		result = prime * result + ((apispec == null) ? 0 : apispec.hashCode());
		result = prime * result + ((error == null) ? 0 : error.hashCode());
		result = prime * result + ((explanation == null) ? 0 : explanation.hashCode());
		result = prime * result + ((fileid == null) ? 0 : fileid.hashCode());
		result = prime * result + ((id == null) ? 0 : id.hashCode());
		result = prime * result + ((localupload == null) ? 0 : localupload.hashCode());
		result = prime * result + ((metadata == null) ? 0 : metadata.hashCode());
		result = prime * result + ((modelname == null) ? 0 : modelname.hashCode());
		result = prime * result + ((modelpath == null) ? 0 : modelpath.hashCode());
		result = prime * result + ((modelserver == null) ? 0 : modelserver.hashCode());
		result = prime * result + ((organization == null) ? 0 : organization.hashCode());
		result = prime * result + ((serverupload == null) ? 0 : serverupload.hashCode());
		result = prime * result + ((status == null) ? 0 : status.hashCode());
		return result;
	}
}
