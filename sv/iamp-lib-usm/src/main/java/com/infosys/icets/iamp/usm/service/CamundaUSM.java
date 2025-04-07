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
package com.infosys.icets.iamp.usm.service;

import java.sql.SQLException;
import java.util.List;

import com.infosys.icets.iamp.usm.dto.ProjectDTO;
import com.infosys.icets.iamp.usm.dto.UserProjectRoleDTO;
import com.infosys.icets.iamp.usm.dto.UsersDTO;
import com.infosys.icets.iamp.usm.dto.UsmPortfolioDTO;

// TODO: Auto-generated Javadoc
/**
 * Service Interface for managing Context.
 */
/**
* @author icets
*/
public interface CamundaUSM {

	public void createUser(UsersDTO users_dto);
	
	public void updateUser(UsersDTO users_dto);
	
	public void deleteUser(Integer userId);
	
	public void createGroup(ProjectDTO project_dto);
	
	public void updateGroup(ProjectDTO project_dto);
	
	public void deleteGroup(Integer id);
	
	public void createTenant(UsmPortfolioDTO usmPortfolioDto);
	
	public void updateTenant(UsmPortfolioDTO usmPortfolioDto);
	
	public void deleteTenant(Integer id);
	
	public void createUserProjectRole(List<UserProjectRoleDTO> user_project_role_dto);
	
	public void updateUserProjectRole(UserProjectRoleDTO user_project_role_dto);
	
	public void deleteUserProjectRole(Integer id) throws SQLException;



	


	
    
}
