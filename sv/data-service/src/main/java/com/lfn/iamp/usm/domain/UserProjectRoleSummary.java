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

package com.lfn.iamp.usm.domain;

import java.io.Serializable;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

// TODO: Auto-generated Javadoc
/**
 * A UserProjectRole.
 */
/**
* @author essedum
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
	 * @author essedum
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
	 * @author essedum
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
