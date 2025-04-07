/**
 * @ 2023 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.iamp.usm.dto;

import java.io.Serializable;

import com.infosys.icets.iamp.usm.common.ProjectDTO;

import lombok.Getter;
import lombok.Setter;

// TODO: Auto-generated Javadoc
/**
 * The Class RoleDTO.
 *
 * @author icets
 */

/**
 * Gets the roleadmin.
 *
 * @return the roleadmin
 */

/**
 * Gets the projectadmin.
 *
 * @return the projectadmin
 */
@Getter

/**
 * Sets the roleadmin.
 *
 * @param roleadmin the new roleadmin
 */

/**
 * Sets the projectadmin.
 *
 * @param projectadmin the new projectadmin
 */
@Setter
public class RoleDTO extends ProjectDTO implements Serializable {
	
    /** The id. */
    private Integer id;


    /** The name. */
    private String name;


    /** The description. */
    private String description;

	/** The permission. */
	private Boolean permission;
    
	/** The roleadmin. */
	private Boolean roleadmin;
	
	/** The projectadmin. */
	private Boolean projectadmin;
	
	private Integer portfolioId;
	
	private Integer projectAdminId;

   
}
