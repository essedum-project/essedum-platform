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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mapping.PropertyReferenceException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.UsmRolePermissions;
import com.infosys.icets.iamp.usm.repository.UsmRolePermissionsRepository;
import com.infosys.icets.iamp.usm.service.RoleService;
import com.infosys.icets.iamp.usm.service.UserApiPermissionsService;
import com.infosys.icets.iamp.usm.service.UsmPermissionApiService;
import com.infosys.icets.iamp.usm.service.UsmPermissionsService;
import com.infosys.icets.iamp.usm.service.UsmRolePermissionsService;
import org.springframework.data.domain.Sort;



// TODO: Auto-generated Javadoc
/**
 * Service Implementation for managing UsmRolePermissions.
 */
/**
* @author icets
*/
@Service
@Transactional
public class UsmRolePermissionsServiceImpl implements UsmRolePermissionsService{
	
	
    /** The role service. */
    @Autowired
	private RoleService roleService;     
    
    /** The permission service. */
    @Autowired
	private UsmPermissionsService usmPermissionsService;
    
    @Autowired 
    private UsmPermissionApiService usmPermissionApiService;

    /** The log. */
    private final Logger log = LoggerFactory.getLogger(UsmRolePermissionsServiceImpl.class);

    /** The usm role permissions repository. */
    private final UsmRolePermissionsRepository usm_role_permissionsRepository;
    
    
    
//    @Autowired
//   	private  UsmRolePermissionsRepo usmRolePermissionsRepo;

    /**
     * Instantiates a new usm role permissions service impl.
     *
     * @param usm_role_permissionsRepository the usm role permissions repository
     * @param roleService the role service
     * @param usmPermissionsService the usm permissions service
     */
    public UsmRolePermissionsServiceImpl(UsmRolePermissionsRepository usm_role_permissionsRepository,RoleService roleService,UsmPermissionsService usmPermissionsService) {
        this.usm_role_permissionsRepository = usm_role_permissionsRepository;
        this.roleService=roleService;
        this.usmPermissionsService=usmPermissionsService;
    }

   /**
    * Save a usm_role_permissions.
    *
    * @param usm_role_permissions the entity to save
    * @return the persisted entity
    */
   @Override
   public UsmRolePermissions save(UsmRolePermissions usm_role_permissions) {
	   UsmRolePermissions usmRolePermissions=usm_role_permissionsRepository.save(usm_role_permissions);
       this.usmPermissionApiService.refreshConfigAPIsMap();
       return usmRolePermissions;
   }

   /**
    *  Get all the usm_role_permissionss.
    *
    *  @param pageable the pagination information
    *  @return the list of entities
    */
   @Override
   @Transactional(readOnly = true)
   public Page<UsmRolePermissions> findAll(Pageable pageable) {
       log.debug("Request to get all UsmRolePermissionss");
       return usm_role_permissionsRepository.findAll(pageable);
   }

   /**
    *  Get one usm_role_permissions by id.
    *
    *  @param id the id of the entity
    *  @return the entity
    */
   @Override
   @Transactional(readOnly = true)
   public UsmRolePermissions findOne(Integer id) {
       log.debug("Request to get UsmRolePermissions : {}", id);
       UsmRolePermissions content = null;
		Optional<UsmRolePermissions> value = usm_role_permissionsRepository.findById(id);
		if (value.isPresent()) {
			content = toDTO(value.get(), 1);
		}
		return content;        
   }

   /**
    *  Delete the  usm_role_permissions by id.
    *
    *  @param id the id of the entity
    */
   @Override
   public void delete(Integer id) {
       log.debug("Request to delete UsmRolePermissions : {}", id);
       usm_role_permissionsRepository.deleteById(id);
       this.usmPermissionApiService.refreshConfigAPIsMap();
   }

    /**
     *  Get all the widget_configurations.
     *
     * @param req the req
     * @return the list of entities
     */
   @Override
   @Transactional(readOnly = true)
   public PageResponse<UsmRolePermissions> getAll(PageRequestByExample<UsmRolePermissions> req) {
       log.debug("Request to get all UsmRolePermissions");
       Example<UsmRolePermissions> example = null;
       UsmRolePermissions usm_role_permissions = req.getExample();

       if (usm_role_permissions != null) {
           ExampleMatcher matcher = ExampleMatcher.matching();

           example = Example.of(usm_role_permissions, matcher);
       }

       Page<UsmRolePermissions> page;
       if (example != null) {
           page =  usm_role_permissionsRepository.findAll(example, req.toPageable());
       } else {
           page =  usm_role_permissionsRepository.findAll(req.toPageable());
       }

       return new PageResponse<>(page.getTotalPages(), page.getTotalElements(), page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
   }

   /**
    * To DTO.
    *
    * @param usm_role_permissions the usm role permissions
    * @return the usm role permissions
    */
   public UsmRolePermissions toDTO(UsmRolePermissions usm_role_permissions) {
       return toDTO(usm_role_permissions, 1);
   }

   /**
    * Converts the passed usm_role_permissions to a DTO. The depth is used to control the
    * amount of association you want. It also prevents potential infinite serialization cycles.
    *
    * @param usm_role_permissions the usm role permissions
    * @param depth the depth of the serialization. A depth equals to 0, means no x-to-one association will be serialized.
    *              A depth equals to 1 means that xToOne associations will be serialized. 2 means, xToOne associations of
    *              xToOne associations will be serialized, etc.
    * @return the usm role permissions
    */
   public UsmRolePermissions toDTO(UsmRolePermissions usm_role_permissions, int depth) {
       if (usm_role_permissions == null) {
           return null;
       }

       UsmRolePermissions dto = new UsmRolePermissions();

           dto.setId(usm_role_permissions.getId());
           
           
//        if (depth-- > 0) {
      	 dto.setRole(roleService.toDTO(usm_role_permissions.getRole(), depth));
      	 dto.setPermission(usmPermissionsService.toDTO(usm_role_permissions.getPermission(),depth));
//       }
       return dto;
   }

	/**
	 * Gets the permission by role and module.
	 *
	 * @param role the role
	 * @param module the module
	 * @return the permission by role and module
	 */
	/* (non-Javadoc)
 * @see com.infosys.icets.iamp.usm.service.UsmRolePermissionsService#getPermissionByRoleAndModule(java.lang.Integer, java.lang.String)
 */
@Override
	public List<UsmRolePermissions> getPermissionByRoleAndModule(Integer role, String module) {
		log.debug("Request to get all UsmRolePermissions");
		return usm_role_permissionsRepository.getPermissionByRoleAndModule(role,module);
	}

	/**
	 * Save list.
	 *
	 * @param role_permissions the role permissions
	 * @return the list
	 * @throws SQLException the SQL exception
	 */
	@Override
	public List<UsmRolePermissions> saveList(List<UsmRolePermissions> role_permissions) throws SQLException {
		log.debug("Request to save UsmRolePermissions : {}", role_permissions);
		List<UsmRolePermissions> usmRolePermissionsList = new ArrayList<UsmRolePermissions>();	
		usmRolePermissionsList = usm_role_permissionsRepository.saveAll(role_permissions);
		log.debug("content size : {}", usmRolePermissionsList.size());
		this.usmPermissionApiService.refreshConfigAPIsMap();
		return usmRolePermissionsList;
	}
	
	
	/**
	 * GET UsmRolePermissions PageResponse
	 * @param pageNumber
	 * @param pageSize
	 * @param SortBy 
	 * @param OrderBy
	 * @return PageResponse Of UsmRolePermissions
	 * @throws PropertyReferenceException SQLException the SQL exception
	 */
   @Override
   @Transactional(readOnly = true)
   public PageResponse<UsmRolePermissions> getAll(int page, int size, String sortBy, String orderBy) throws PropertyReferenceException{
       log.debug("Request to get all UsmRolePermissions");
       Page<UsmRolePermissions> pageRes;
       if(orderBy.equalsIgnoreCase("desc")) {
    	   pageRes=usm_role_permissionsRepository.findAll(PageRequest.of(page, size,Sort.by(sortBy).descending()));
       }
       else {
    	   pageRes=usm_role_permissionsRepository.findAll(PageRequest.of(page, size,Sort.by(sortBy).ascending()));
       }
       return new PageResponse<>(pageRes.getTotalPages(), pageRes.getTotalElements(), pageRes.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
   }

   
	/**
	 * GET UsmRolePermissions Searched PageResponse
	 * @param ModuleName 
	 * @param permissionName
	 * @param pageNumber
	 * @param pageSize
	 * @param SortBy 
	 * @param OrderBy
	 * @return Searched PageResponse Of UsmRolePermissions
	 * @throws PropertyReferenceException
	 */ 
  @Override
  @Transactional(readOnly = true)
  public PageResponse<UsmRolePermissions> findAllUsmRolePermissionsByModuleAndPermission(String module,String permission,int page, int size, String sortBy, String orderBy) throws PropertyReferenceException{
      log.debug("Request to get all UsmRolePermissions");
      Page<UsmRolePermissions> pageRes;
      if(orderBy.equalsIgnoreCase("desc")) {
   	    pageRes= usm_role_permissionsRepository.findAllUsmRolePermissionsByModuleAndPermission(module,permission,PageRequest.of(page, size,Sort.by(sortBy).descending()));
      }
      else {
   	    pageRes= usm_role_permissionsRepository.findAllUsmRolePermissionsByModuleAndPermission(module,permission,PageRequest.of(page, size,Sort.by(sortBy).ascending()));
      }
      
      return new PageResponse<>(pageRes.getTotalPages(), pageRes.getTotalElements(), pageRes.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
  }
  
     /**
      * GET UsmRolePermissions Searched PageResponse
      *
      * @param ModuleName 
      * @param permissionName
      * @param roleName
      * @param pageNumber
      * @param pageSize
      * @param SortBy 
      * @param OrderBy
      * @return Searched PageResponse Of UsmRolePermissions
      * @throws PropertyReferenceException 
      */
    
    @Override
    @Transactional(readOnly = true)
    public PageResponse<UsmRolePermissions> findAllUsmRolePermissionsByModuleAndPermissionAndRole(String module,String permission,String role,int page, int size, String sortBy, String orderBy) throws PropertyReferenceException{
        log.debug("Request to get all UsmRolePermissions");
        Page<UsmRolePermissions> pageRes;
        if(orderBy.equalsIgnoreCase("desc")) {
             pageRes= usm_role_permissionsRepository.findAllUsmRolePermissionsByModuleAndPermissionAndRole(module,permission,role,PageRequest.of(page, size,Sort.by(sortBy).descending()));
        }
        else {
             pageRes= usm_role_permissionsRepository.findAllUsmRolePermissionsByModuleAndPermissionAndRole(module,permission,role,PageRequest.of(page, size,Sort.by(sortBy).ascending()));
        }
        
        return new PageResponse<>(pageRes.getTotalPages(), pageRes.getTotalElements(), pageRes.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
    }
    
    
     /**
      * GET UsmRolePermissions Searched PageResponse
      *
      * @param ModuleName 
      * @param pageNumber
      * @param pageSize
      * @param SortBy 
      * @param OrderBy
      * @return Searched PageResponse Of UsmRolePermissions
      * @throws PropertyReferenceException 
      */
   
   @Override
   @Transactional(readOnly = true)
   public PageResponse<UsmRolePermissions> findAllUsmRolePermissionsByModule(String module,int page, int size, String sortBy, String orderBy) throws PropertyReferenceException{
       log.debug("Request to get all UsmRolePermissions");
       Page<UsmRolePermissions> pageRes;
       if(orderBy.equalsIgnoreCase("desc")) {
            pageRes= usm_role_permissionsRepository.findAllUsmRolePermissionsByModule(module,PageRequest.of(page, size,Sort.by(sortBy).descending()));
       }
       else {
            pageRes= usm_role_permissionsRepository.findAllUsmRolePermissionsByModule(module,PageRequest.of(page, size,Sort.by(sortBy).ascending()));
       }
       
       return new PageResponse<>(pageRes.getTotalPages(), pageRes.getTotalElements(), pageRes.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
   }
   
   
   
     /**
      * GET UsmRolePermissions Searched PageResponse
      *
      * @param permissionName
      * @param pageNumber
      * @param pageSize
      * @param SortBy 
      * @param OrderBy
      * @return Searched PageResponse Of UsmRolePermissions
      * @throws PropertyReferenceException 
      */
  
  @Override
  @Transactional(readOnly = true)
  public PageResponse<UsmRolePermissions> findAllUsmRolePermissionsByPermission(String permission,int page, int size, String sortBy, String orderBy) throws PropertyReferenceException{
      log.debug("Request to get all UsmRolePermissions");
      Page<UsmRolePermissions> pageRes;
      if(orderBy.equalsIgnoreCase("desc")) {
           pageRes= usm_role_permissionsRepository.findAllUsmRolePermissionsByPermission(permission,PageRequest.of(page, size,Sort.by(sortBy).descending()));
      }
      else {
           pageRes= usm_role_permissionsRepository.findAllUsmRolePermissionsByPermission(permission,PageRequest.of(page, size,Sort.by(sortBy).ascending()));
      }
      
      return new PageResponse<>(pageRes.getTotalPages(), pageRes.getTotalElements(), pageRes.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
  }
    
}