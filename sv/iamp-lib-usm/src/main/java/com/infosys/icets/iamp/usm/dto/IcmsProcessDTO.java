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
public class IcmsProcessDTO {

	private Integer process_id;
	
	private String process_name;
	
	private String process_display_name;
	
	private String process_description;
	
	private String workflow_id;
	
	private Boolean is_active;
	
	private LocalDateTime created_date;
	
	private LocalDateTime last_updated_date;
	
	private String last_updated_user;
	
	private ProjectDTO project_id;
}
