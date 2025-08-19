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
