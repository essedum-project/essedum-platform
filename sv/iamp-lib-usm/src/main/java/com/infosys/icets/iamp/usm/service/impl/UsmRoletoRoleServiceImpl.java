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
import java.util.ArrayList;
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
import com.infosys.icets.iamp.usm.domain.Role;
import com.infosys.icets.iamp.usm.domain.RoletoRole;
import com.infosys.icets.iamp.usm.repository.UsmRoletoRoleRepository;
import com.infosys.icets.iamp.usm.service.RoleService;
import com.infosys.icets.iamp.usm.service.UsmRoletoRoleService;




// TODO: Auto-generated Javadoc
/**
 * Service Implementation for managing UsmRolePermissions.
 */
/**
* @author icets
*/
@Service
@Transactional
public class UsmRoletoRoleServiceImpl implements UsmRoletoRoleService{
	

    /** The log. */
    private final Logger log = LoggerFactory.getLogger(UsmRoletoRoleServiceImpl.class);

    /** The usm role permissions repository. */
    private final UsmRoletoRoleRepository usm_role_to_roleRepository;
    
    @Autowired
   	private RoleService roleService;
    


    /**
     * Instantiates a new usm role permissions service impl.
     *
     * @param UsmRoletoRoleRepository the usm role to role repository
     */
    public UsmRoletoRoleServiceImpl(UsmRoletoRoleRepository usm_role_to_roleRepository,RoleService roleService) {
        this.usm_role_to_roleRepository = usm_role_to_roleRepository;
        this.roleService = roleService;
    }

   /**
    * Save a usm_role_to_role.
    *
    * @param usm_role_to_role the entity to save
    * @return the persisted entity
    */
   @Override
   public RoletoRole save(RoletoRole usm_role_to_role) {
       log.debug("Request to save usm_role_to_role : {}", usm_role_to_role);
       return usm_role_to_roleRepository.save(usm_role_to_role);
   }

   /**
    *  Get all the usm_role_permissionss.
    *
    *  @param pageable the pagination information
    *  @return the list of entities
    */
   @Override
   @Transactional(readOnly = true)
   public Page<RoletoRole> findAll(Pageable pageable) {
       log.debug("Request to get all UsmRolePermissionss");
       return usm_role_to_roleRepository.findAll(pageable);
   }

   /**
    *  Get one RoletoRole by id.
    *
    *  @param id the id of the entity
    *  @return the entity
    */
   @Override
   @Transactional(readOnly = true)
   public RoletoRole findOne(Integer id) {
       log.debug("Request to get RoletoRole : {}", id);
       RoletoRole content = null;
		Optional<RoletoRole> value = usm_role_to_roleRepository.findById(id);
		if (value.isPresent()) {
			content = toDTO(value.get(), 1);
		}
		return content;        
   }

   /**
    *  Delete the  RoletoRole by id.
    *
    *  @param id the id of the entity
    */
   @Override
   public void delete(Integer id) {
       log.debug("Request to delete RoletoRole : {}", id);
       usm_role_to_roleRepository.deleteById(id);
   }

    /**
     *  Get all the widget_configurations.
     *
     * @param req the req
     * @return the list of entities
     */
   @Override
   @Transactional(readOnly = true)
   public PageResponse<RoletoRole> getAll(PageRequestByExample<RoletoRole> req) {
       log.debug("Request to get all RoletoRole");
       Example<RoletoRole> example = null;
       RoletoRole usm_role_to_role = req.getExample();

       if (usm_role_to_role != null) {
           ExampleMatcher matcher = ExampleMatcher.matching();

           example = Example.of(usm_role_to_role, matcher);
       }

       Page<RoletoRole> page;
       if (example != null) {
           page =  usm_role_to_roleRepository.findAll(example, req.toPageable());
       } else {
           page =  usm_role_to_roleRepository.findAll(req.toPageable());
       }

       return new PageResponse<>(page.getTotalPages(), page.getTotalElements(), page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
   }

   /**
    * To DTO.
    *
    * @param RoletoRole the usm role RoletoRole
    * @return the usm role RoletoRole
    */
   public RoletoRole toDTO(RoletoRole usm_role_to_role) {
       return toDTO(usm_role_to_role, 1);
   }

   /**
    * Converts the passed usm_role_permissions to a DTO. The depth is used to control the
    * amount of association you want. It also prevents potential infinite serialization cycles.
    *
    * @param usm_role_permissions the usm role permissions
    * @param depth the depth of the serialization. A depth equals to 0, means no x-to-one association will be serialized.
    *              A depth equals to 1 means that xToOne associations will be serialized. 2 means, xToOne associations of
    *              xToOne associations will be serialized, etc.
    * @return the usm role RoletoRole
    */
   public RoletoRole toDTO(RoletoRole usm_role_to_role, int depth) {
       if (usm_role_to_role == null) {
           return null;
       }

       RoletoRole dto = new RoletoRole();

           dto.setId(usm_role_to_role.getId());
           
           
//        if (depth-- > 0) {
      	 dto.setParentRoleId(roleService.toDTO(usm_role_to_role.getParentRoleId(), depth));
      	 dto.setChildRoleId(roleService.toDTO(usm_role_to_role.getChildRoleId(), depth));
//       }
       return dto;
   }



	/**
	 * Save list.
	 *
	 * @param RoletoRole the RoletoRole
	 * @return the list
	 * @throws SQLException the SQL exception
	 */
	@Override
	public List<RoletoRole> saveList(List<RoletoRole> role_to_role) throws SQLException {
		log.debug("Request to save RoletoRole : {}", role_to_role);
		List<RoletoRole> usmRoletoRoleMappingList = new ArrayList<RoletoRole>();	
		usmRoletoRoleMappingList = usm_role_to_roleRepository.saveAll(role_to_role);
		log.debug("content size : {}", usmRoletoRoleMappingList.size());
		
		return usmRoletoRoleMappingList;
	}
	
	@Override
	public List<RoletoRole> getChildRoles(Role role) throws SQLException{
		return usm_role_to_roleRepository.getChildRoles(role);
	}

    
}