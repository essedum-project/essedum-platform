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

package com.infosys.icets.iamp.usm.service.impl;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.UsmModule;
import com.infosys.icets.iamp.usm.domain.UsmPermissions;
import com.infosys.icets.iamp.usm.repository.UsmPermissionsRepository;
import com.infosys.icets.iamp.usm.service.UserApiPermissionsService;
import com.infosys.icets.iamp.usm.service.UsmPermissionApiService;
import com.infosys.icets.iamp.usm.service.UsmPermissionsService;

// TODO: Auto-generated Javadoc
/**
 * Service Implementation for managing UsmPermissions.
 */
/**
 * @author icets
 */
@Service
@Transactional
public class UsmPermissionsServiceImpl implements UsmPermissionsService {

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(UsmPermissionsServiceImpl.class);

	/** The usm permissions repository. */
	private final UsmPermissionsRepository usm_permissionsRepository;

//    @Autowired 	
//   	private  UsmPermissionsRepo usmPermissionsRepo;
//    @Autowired
//	private UserApiPermissionsService userApiPermissionsService;
	
	@Autowired 
	private UsmPermissionApiService usmPermissionApiService;

    /**
     * Instantiates a new usm permissions service impl.
     *
     * @param usm_permissionsRepository the usm permissions repository
     */
	public UsmPermissionsServiceImpl(UsmPermissionsRepository usm_permissionsRepository,UsmPermissionApiService usmPermissionApiService) {
		this.usm_permissionsRepository = usm_permissionsRepository;
		this.usmPermissionApiService=usmPermissionApiService;
	}

    /**
     * Save a usm_permissions.
     *
     * @param usm_permissions the entity to save
     * @return the persisted entity
     */
//    @Override
//    public UsmPermissions save(UsmPermissions usm_permissions) {
//    	UsmPermissions usmPermissions= usm_permissionsRepository.save(usm_permissions);
//	     this.userApiPermissionsService.refreshConfigAPIsMap();
//	     return usmPermissions;
//    }

	/**
	 * Save a usm_permissions.
	 *
	 * @param usm_permissions the entity to save
	 * @return the persisted entity
	 */
	@Override
	public UsmPermissions save(UsmPermissions usm_permissions) {
		log.debug("Request to save UsmPermissions : {}", usm_permissions);
		 UsmPermissions usmPermissions= usm_permissionsRepository.save(usm_permissions);
	     this.usmPermissionApiService.refreshConfigAPIsMap();
	     return usmPermissions;
	}

	/**
	 * Get all the usm_permissionss.
	 *
	 * @param pageable the pagination information
	 * @return the list of entities
	 */
	@Override
	@Transactional(readOnly = true)
	public Page<UsmPermissions> findAll(Pageable pageable) {
		log.debug("Request to get all UsmPermissionss");
		return usm_permissionsRepository.findAll(pageable);
	}

	/**
	 * Get one usm_permissions by id.
	 *
	 * @param id the id of the entity
	 * @return the entity
	 */
	@Override
	@Transactional(readOnly = true)
	public UsmPermissions findOne(Integer id) {
		log.debug("Request to get UsmPermissions : {}", id);
		UsmPermissions content = null;
		Optional<UsmPermissions> value = usm_permissionsRepository.findById(id);
		if (value.isPresent()) {
			content = toDTO(value.get(), 0);
		}
		return content;

	}

    /**
     *  Delete the  usm_permissions by id.
     *
     *  @param id the id of the entity
     */
    @Override
    public void delete(Integer id) {
    	log.debug("Request to delete UsmPermissions : {}", id);
		usm_permissionsRepository.deleteById(id);
		usmPermissionApiService.deleteAll(id);
		this.usmPermissionApiService.refreshConfigAPIsMap();
    }

     /**
      *  Get all the widget_configurations.
      *
      * @param req the req
      * @return the list of entities
      * @throws SQLException the SQL exception
      */
    @Override
    @Transactional(readOnly = true)
    public PageResponse<UsmPermissions> getAll(PageRequestByExample<UsmPermissions> req) throws SQLException{
        log.debug("Request to get all UsmPermissions");
        Example<UsmPermissions> example = null;
        UsmPermissions usm_permissions = req.getExample();

        if (usm_permissions != null) {
            ExampleMatcher matcher = ExampleMatcher.matching() // example matcher for module,permission
                    .withMatcher("module", match -> match.ignoreCase().startsWith())
                    .withMatcher("permission", match -> match.ignoreCase().startsWith())
;

            example = Example.of(usm_permissions, matcher);
        }

        Page<UsmPermissions> page;
        if (example != null) {
            page =  usm_permissionsRepository.findAll(example, req.toPageable());
        } else {
            page =  usm_permissionsRepository.findAll(req.toPageable());
        }

        return new PageResponse<>(page.getTotalPages(), page.getTotalElements(), page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
    }

    /**
     * To DTO.
     *
     * @param usm_permissions the usm permissions
     * @return the usm permissions
     */
    public UsmPermissions toDTO(UsmPermissions usm_permissions) {
        return toDTO(usm_permissions, 0);
    }

    /**
     * Converts the passed usm_permissions to a DTO. The depth is used to control the
     * amount of association you want. It also prevents potential infinite serialization cycles.
     *
     * @param usm_permissions the usm permissions
     * @param depth the depth of the serialization. A depth equals to 0, means no x-to-one association will be serialized.
     *              A depth equals to 1 means that xToOne associations will be serialized. 2 means, xToOne associations of
     *              xToOne associations will be serialized, etc.
     * @return the usm permissions
     */
    public UsmPermissions toDTO(UsmPermissions usm_permissions, int depth) {
        if (usm_permissions == null) {
            return null;
        }

        UsmPermissions dto = new UsmPermissions();

            dto.setId(usm_permissions.getId());

            dto.setModule(usm_permissions.getModule());

            dto.setPermission(usm_permissions.getPermission());
        
            return dto;
    }
    
    /**
     * Gets the permission by role and module.
     *
     * @param role the role
     * @param module the module
     * @return the permission by role and module
     */
    @Override
	public List<UsmPermissions> getPermissionByRoleAndModule(Integer role, String module) {
		log.debug("Request to get all UsmRolePermissions");
		return usm_permissionsRepository.getPermissionByRoleAndModule(role,module);
	}

}