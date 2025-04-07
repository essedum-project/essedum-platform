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
package com.infosys.icets.iamp.usm.repository.mssql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.infosys.icets.iamp.usm.common.RoleMappedApiPermission;
import com.infosys.icets.iamp.usm.repository.UsmPermissionApiRepository;

@Profile("mssql")
@Repository
public interface UsmPermissionApiRepositoryMSSQL extends UsmPermissionApiRepository{

	@Query(value="SELECT DISTINCT rp.role AS roleId,pa.api AS permissionApi,pa.type AS permissionApiMethodType FROM usm_role_permissions AS rp,usm_permission_api AS pa WHERE rp.permission=pa.permission_id AND pa.is_whiteListed=0", nativeQuery = true)
	public List<RoleMappedApiPermission> getRoleMappedApiList();
	
	@Query(value="Select pa.api from  usm_permission_api pa where pa.is_whitelisted=1", nativeQuery = true)
	public List<String> getWhiteListedApi();
}
