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
