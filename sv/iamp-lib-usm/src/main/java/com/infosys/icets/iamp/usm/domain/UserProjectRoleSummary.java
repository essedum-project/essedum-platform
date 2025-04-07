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
package com.infosys.icets.iamp.usm.domain;

import java.io.Serializable;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

// TODO: Auto-generated Javadoc
/**
 * A UserProjectRole.
 */
/**
* @author icets
*/

/**
 * Gets the porfolios.
 *
 * @return the porfolios
 */

/**
 * Gets the porfolios.
 *
 * @return the porfolios
 */
@Getter 
 /**
  * Sets the porfolios.
  *
  * @param porfolios the new porfolios
  */
 
 /**
  * Sets the porfolios.
  *
  * @param porfolios the new porfolios
  */
 @Setter
public class UserProjectRoleSummary implements Serializable {
	
	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;
	
	/** The user id. */
	private Users userId;
	
	/** The porfolios. */
	private List<Porfolio> porfolios;
	
	/**
	 * The Class Porfolio.
	 *
	 * @author icets
	 */
	
	/**
	 * Gets the project with roles.
	 *
	 * @return the project with roles
	 */	
	
	/**
	 * Gets the project with roles.
	 *
	 * @return the project with roles
	 */
	@Getter 
 
	 /**
	  * Sets the project with roles.
	  *
	  * @param projectWithRoles the new project with roles
	  */
	 
 	/**
 	 * Sets the project with roles.
 	 *
 	 * @param projectWithRoles the new project with roles
 	 */
 	@Setter
	public class Porfolio{
		
		/** The Porfolio id. */
		private UsmPortfolio PorfolioId;
		
		/** The project with roles. */
		private List<ProjectWithRoles> projectWithRoles;
		
	}
	
	
	/**
	 * The Class ProjectWithRoles.
	 *
	 * @author icets
	 */
	/**
	 * Gets the role id.
	 *
	 * @return the role id
	 */
	
	/**
	 * Gets the role id.
	 *
	 * @return the role id
	 */
	@Getter 
 
 /**
  * Sets the role id.
  *
  * @param roleId the new role id
  */
 
 /**
  * Sets the role id.
  *
  * @param roleId the new role id
  */
 @Setter
	public class ProjectWithRoles{
		
		/** The project id. */
		private Project projectId;
		
		/** The role id. */
		private List<Role> roleId;
		
	}
}
