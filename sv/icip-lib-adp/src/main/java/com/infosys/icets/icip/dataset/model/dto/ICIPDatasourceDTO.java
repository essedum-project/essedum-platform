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
