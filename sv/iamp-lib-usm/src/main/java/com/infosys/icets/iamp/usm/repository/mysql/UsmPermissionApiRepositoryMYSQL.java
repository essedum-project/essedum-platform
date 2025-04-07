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
package com.infosys.icets.iamp.usm.repository.mysql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.infosys.icets.iamp.usm.common.RoleMappedApiPermission;
import com.infosys.icets.iamp.usm.repository.UsmPermissionApiRepository;

@Profile("mysql")
@Repository
public interface UsmPermissionApiRepositoryMYSQL extends UsmPermissionApiRepository{

	@Query(value="SELECT DISTINCT rp.role.id as roleId,pa.api as permissionApi,pa.type as permissionApiMethodType FROM UsmRolePermissions rp,UsmPermissionApi pa WHERE rp.permission.id=pa.permissionId AND pa.isWhiteListed=false")
	public List<RoleMappedApiPermission> getRoleMappedApiList();
	
	@Query(value="Select  pa.api from  UsmPermissionApi pa where pa.isWhiteListed=true ")
	public List<String> getWhiteListedApi();
}
