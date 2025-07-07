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

import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
/**
 * Gets the load.
 *
 * @return the load
 */

/**
 * Gets the load.
 *
 * @return the load
 */
@Getter

/**
 * Sets the load.
 *
 * @param load the new load
 */

/**
 * Sets the load.
 *
 * @param load the new load
 */
@Setter

/**
 * Instantiates a new ICIP pipeline model DTO.
 */

/**
 * Instantiates a new ICIP pipeline model DTO.
 */
@NoArgsConstructor

/**
 * Instantiates a new ICIP pipeline model DTO.
 *
 * @param modelname the modelname
 * @param explanation the explanation
 * @param apispec the apispec
 * @param fileid the fileid
 * @param executionscript the executionscript
 * @param loadscript the loadscript
 * @param pipelinemodel the pipelinemodel
 * @param modelpath the modelpath
 * @param org the org
 * @param id the id
 * @param metadata the metadata
 * @param load the load
 */

/**
 * Instantiates a new ICIP pipeline model DTO.
 *
 * @param modelname the modelname
 * @param explanation the explanation
 * @param apispec the apispec
 * @param fileid the fileid
 * @param executionscript the executionscript
 * @param loadscript the loadscript
 * @param pipelinemodel the pipelinemodel
 * @param modelpath the modelpath
 * @param org the org
 * @param id the id
 * @param metadata the metadata
 * @param load the load
 */
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ICIPPipelineModelDTO {
	
	/** The modelname. */
	String modelname;
	
	Integer modelId;
	/** The explanation. */
	String description;
	
	/** The apispec. */
	String apispec;
	
	/** The fileid. */
	String fileid;
	
	/** The executionscript. */
	String[] executionscript;
	
	/** The loadscript. */
	String[] loadscript;
	
	/** The pipelinemodel. */
	boolean pipelinemodel;
	
	/** The modelpath. */
	String modelpath;
	
	/** The org. */
	String org;
	
	/** The id. */
	Integer id;
	
	/** The metadata. */
	String metadata;
	
	/** The load. */
	Integer load;
	
	String type;
	String version;
	String organization;
	
	String modeltype;

	String framework;
	
	boolean pushtocodestore;
	boolean topublic;
	boolean overwrite;
	String summary;
	String taginfo;
	Integer frameworkVersion;
	String modelClassName;
	String inferenceClassName;
	String filePath;
	String inputType;
}
