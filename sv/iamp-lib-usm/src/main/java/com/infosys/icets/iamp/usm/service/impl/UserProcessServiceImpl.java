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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.UserProcessMapping;
import com.infosys.icets.iamp.usm.dto.UserProcessMappingDTO;
import com.infosys.icets.iamp.usm.repository.UserProcessMappingRepository;
import com.infosys.icets.iamp.usm.service.UserProcessMappingService;




@Service
@Transactional
public class UserProcessServiceImpl implements UserProcessMappingService, ApplicationContextAware  {

	@Autowired
	private UserProcessMappingRepository userProcessRepository;
	
	private UserProcessMapping userProcessMapping;
	
	private static ApplicationContext applicationContext;
	
	@Override
	public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
		this.applicationContext = applicationContext;

	}

	@Override
	public UserProcessMapping updateStatus(Integer id, Boolean activeStatus) {
		userProcessMapping = userProcessRepository.findById(id).orElseThrow(NoSuchElementException::new);
		userProcessMapping.setActiveStatus(activeStatus);
		userProcessMapping = userProcessRepository.save(userProcessMapping);
		return userProcessMapping;
	
	}

	@Override
	public void deleteMapping(Integer id) {
		userProcessRepository.deleteById(id);
	}


	public UserProcessMapping createEntity(UserProcessMappingDTO userProcessMappingDTO) {
		
		UserProcessMapping user = new UserProcessMapping();
		user.setActiveStatus(userProcessMappingDTO.getActiveStatus());
		user.setComments(userProcessMappingDTO.getComments());
		user.setFromDate(userProcessMappingDTO.getFromDate());
		user.setToDate(userProcessMappingDTO.getToDate());
		user.setOrganization(userProcessMappingDTO.getOrganization());
		user.setProcess(userProcessMappingDTO.getProcess());
		user.setProcess_key(userProcessMappingDTO.getProcess_key());
		user.setRoleMng(userProcessMappingDTO.getRoleMng());
		user.setUser(userProcessMappingDTO.getUser());
		
		return user ;
	}
	
	public UserProcessMappingDTO createDTO(UserProcessMapping userProcessMapping)
	{
		UserProcessMappingDTO dto = new UserProcessMappingDTO();
		dto.setActiveStatus(userProcessMapping.getActiveStatus());
		dto.setComments(userProcessMapping.getComments());
		dto.setFromDate(userProcessMapping.getFromDate());
		dto.setToDate(userProcessMapping.getToDate());
		dto.setOrganization(userProcessMapping.getOrganization());
		dto.setProcess(userProcessMapping.getProcess());
		dto.setProcess_key(userProcessMapping.getProcess_key());
		dto.setRoleMng(userProcessMapping.getRoleMng());
		dto.setUser(userProcessMapping.getUser());
		return dto;
		
	}
	

	@Override
	@Transactional(rollbackFor = LeapException.class)
	public UserProcessMapping create(UserProcessMappingDTO userProcessMappingDTO) throws LeapException {
		
		UserProcessMapping userProcess = createEntity( userProcessMappingDTO);
				return  userProcessRepository.save(userProcess);
	}

	
	@SuppressWarnings("unchecked")
	@Override
	public PageResponse<UserProcessMapping> getAllMappings(String organization,Optional<String> process,
			Optional<String> roleMng, 
			Optional<String> user) {
		List<UserProcessMapping> list = new ArrayList();
		
		String user1 = user.get().trim();
		organization=organization.trim();
		String process1=process.get().trim();		
		String roleMng1=roleMng.get().trim();
	if(process1.length()>1 && roleMng1.length()==0 && user1.length()==0 )
	{
			list = userProcessRepository.findByOrganizationAndProcessKey(organization, process1);
	
      }
	else if (process1.length()>1 && roleMng1.length()>1 && user1.length()==0)
	{
		list = userProcessRepository.findByOrganizationAndProcessAndRoleMng(organization,process1, roleMng1);
	}

	else if(process1.length()>1 && roleMng1.length()>1 && user1.length()>1 )
	{
		list = userProcessRepository.findByOrganizationAndProcessAndRoleMngAndUser(organization,process1, roleMng1, user1);
		}
	else if(process1.length()==0 && roleMng1.length()>1 && user1.length()>1 )
	{
		list = userProcessRepository.findByOrganizationAndRoleMngAndUser(organization, roleMng1, user1);
	}
	else if(process1.length()==0 && roleMng1.length()>1 && user1.length()==0)
	{
		list = userProcessRepository.findByOrganizationAndRoleMng(organization, roleMng1);
	}
else
	{	
		list = userProcessRepository.findByOrganization(organization);
	}
		return new PageResponse<>(10, list.size(), list);	
	}
	
	@Override
	public List<HashMap<String,String>> findByUser(String organization,String user) {
		List<UserProcessMapping> list = userProcessRepository.findByUserLogin(organization,user);
		
			
		List<HashMap<String,String>> processList =new ArrayList<HashMap<String,String>>();
		
		for(UserProcessMapping element:list)
		{
			HashMap<String,String> mapp1 = new HashMap<String,String>();
			mapp1.put("name", element.getProcess());
			mapp1.put("key", element.getProcess_key());
			processList.add(mapp1);	
		}

		List<HashMap<String,String>> processList2= processList.stream().distinct()
				.collect(Collectors.toList());
	
		
		return processList2;
	}
	
	@Override
	public UserProcessMappingDTO findByUserLoginAndProcess(String organization, String user,String processKey,String role) {
		
		UserProcessMappingDTO userDTO=new UserProcessMappingDTO();
		UserProcessMapping userobj = userProcessRepository.findByUserLoginAndProcess(organization,user,processKey,role);

		
		if(userobj!=null) {
			userDTO.setActiveStatus(userobj.getActiveStatus());
			userDTO.setProcess(userobj.getProcess());
			userDTO.setComments(userobj.getComments());
			userDTO.setFromDate(userobj.getFromDate());
			userDTO.setProcess_key(userobj.getProcess_key());
			userDTO.setId(userobj.getId());
			userDTO.setOrganization(userobj.getOrganization());
			userDTO.setUser(userobj.getUser());
			userDTO.setProcess(userobj.getProcess());
			userDTO.setRoleMng(userobj.getRoleMng());
			userDTO.setToDate(userobj.getToDate());
			return userDTO;
		}
		
		return null;
		
	}
	
	@Override
	public List<UserProcessMappingDTO>findAllUserByProcess(String organization,String processKey) {
		
		List<UserProcessMappingDTO> userDTOList=new ArrayList<UserProcessMappingDTO>();
		List<UserProcessMapping> userList = userProcessRepository.findUserByProcess(organization, processKey);
		if(userList!=null) {
			userList.forEach(userobj->{
				
				UserProcessMappingDTO userDTO=new UserProcessMappingDTO();
				
				userDTO.setActiveStatus(userobj.getActiveStatus());
				userDTO.setProcess(userobj.getProcess());
				userDTO.setComments(userobj.getComments());
				userDTO.setFromDate(userobj.getFromDate());
				userDTO.setProcess_key(userobj.getProcess_key());
				userDTO.setId(userobj.getId());
				userDTO.setOrganization(userobj.getOrganization());
				userDTO.setUser(userobj.getUser());
				userDTO.setProcess(userobj.getProcess());
				userDTO.setRoleMng(userobj.getRoleMng());
				userDTO.setToDate(userobj.getToDate());
				userDTOList.add(userDTO);
					
			});
			return userDTOList;
		}
		else return null;	
	}
	
	@Override
	public JsonObject findAllUserToDelegate(String organization,String processKey,String startTime, String endTime, String currentUser) {
		
		List<UserProcessMapping> userList = userProcessRepository.findUsersForDelegation(organization,processKey,startTime,endTime,currentUser);
		JsonObject usersToDelegate = new JsonObject();
		if(userList!=null) {
			userList.forEach(userobj->{
				if( userobj.getUser()!=null && !userobj.getUser().isBlank() && userobj.getUser()!=null &&  !userobj.getUser().isBlank())
				{   	JsonArray userTemp = null;
					if(usersToDelegate.has(userobj.getRoleMng())) {
						 userTemp = usersToDelegate.get(userobj.getRoleMng()).getAsJsonArray();
					}
					else {
						 userTemp = new JsonArray();
					}
					userTemp.add(userobj.getUser());
					usersToDelegate.add(userobj.getRoleMng(),userTemp);
				}
			});
		}
		return usersToDelegate;
		
	}
	
	
	@Override
	public List<UserProcessMappingDTO> findAllUserByProcessAndRole(String organization, String processKey,
			String role) {
		
		List<UserProcessMappingDTO> userDTOList=new ArrayList<UserProcessMappingDTO>();
		List<UserProcessMapping> userList = userProcessRepository.findUserByProcessAndRole(organization, processKey,role);
		if(userList!=null) {
			userList.forEach(userobj->{
				
				UserProcessMappingDTO userDTO=new UserProcessMappingDTO();
				
				userDTO.setActiveStatus(userobj.getActiveStatus());
				userDTO.setProcess(userobj.getProcess());
				userDTO.setComments(userobj.getComments());
				userDTO.setFromDate(userobj.getFromDate());
				userDTO.setProcess_key(userobj.getProcess_key());
				userDTO.setId(userobj.getId());
				userDTO.setOrganization(userobj.getOrganization());
				userDTO.setUser(userobj.getUser());
				userDTO.setProcess(userobj.getProcess());
				userDTO.setRoleMng(userobj.getRoleMng());
				userDTO.setToDate(userobj.getToDate());
				userDTOList.add(userDTO);
					
			});
			return userDTOList;
		}
		else return null;	
	}
	
}
