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

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoleProcessDTO {
	
	private Integer id;

	private IcmsProcessDTO process_id;
	
	private RoleDTO role_id;
	
	private Integer role_hierarchy;
	
	private LocalDateTime last_updated_date;
	
	private String last_updated_user;
	
	private Boolean is_role_based_search_access;
	
	private Boolean is_role_based_reassign_access;
	
	private Boolean is_role_based_assign_access;
	
	private Boolean is_role_based_transfer_access;
	
	private Boolean is_role_based_bulkPage_access;
	
	private Boolean is_role_based_manualPage_access; 
	
	private ProjectDTO project_id;
}
