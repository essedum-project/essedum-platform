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

package com.lfn.iamp.usm.repository.mysql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.lfn.iamp.usm.common.RoleMappedApiPermission;
import com.lfn.iamp.usm.repository.UsmPermissionApiRepository;

@Profile("mysql")
@Repository
public interface UsmPermissionApiRepositoryMYSQL extends UsmPermissionApiRepository{

	@Query(value="SELECT DISTINCT rp.role.id as roleId,pa.api as permissionApi,pa.type as permissionApiMethodType FROM UsmRolePermissions rp,UsmPermissionApi pa WHERE rp.permission.id=pa.permissionId AND pa.isWhiteListed=false")
	public List<RoleMappedApiPermission> getRoleMappedApiList();
	
	@Query(value="Select  pa.api from  UsmPermissionApi pa where pa.isWhiteListed=true ")
	public List<String> getWhiteListedApi();
}
