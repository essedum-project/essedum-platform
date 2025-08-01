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

import java.io.Serializable;

import com.infosys.icets.ai.comm.lib.util.domain.BaseDomain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPDatasourceDTO.
 *
 * @author icets
 */

/**
 * Gets the organization.
 *
 * @return the organization
 */

/**
 * Gets the dshashcode.
 *
 * @return the dshashcode
 */

/**
 * Gets the category.
 *
 * @return the category
 */
@Getter 
 /**
  * Sets the organization.
  *
  * @param organization the new organization
  */
 
 /**
  * Sets the dshashcode.
  *
  * @param dshashcode the new dshashcode
  */
 
 /**
  * Sets the category.
  *
  * @param category the new category
  */
 @Setter 
 /**
  * Instantiates a new ICIP datasource DTO.
  */
 
 /**
  * Instantiates a new ICIP datasource DTO.
  */
 
 /**
  * Instantiates a new ICIP datasource DTO.
  */
 @NoArgsConstructor
public class ICIPDatasourceDTO extends BaseDomain implements Serializable {
	
	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	
	/** The id. */
	private Integer id;
	
	/** The name. */
	private String name;
	
	/** The description. */
	private String description;	
	
	/** The type. */
	private String type;	
	
	/** The connection details. */
	private String connectionDetails;
	
	/** The salt. */
	private String salt;
	
	/** The organization. */
	private String organization;
	
	/** The dshashcode. */
	private String dshashcode;
	
	/** The category. */
	private String category;
	
	/** The extras. */
	private String extras;

	/** The interfacetype. */
	private String interfacetype;
	
	/** The fordataset.  */
	private Boolean fordataset;
	
	/** The forruntime.  */
	private Boolean forruntime;
	
	/** The foradapter.  */
	private Boolean foradapter;
	
	/** The formodel.  */
	private Boolean formodel;
	
	/** The forpromptprovider.  */
	private Boolean forpromptprovider;
	
	/** The forendpoint.  */
	private Boolean forendpoint;
	
	private Boolean forapp;
     
}
