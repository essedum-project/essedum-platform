//package com.lfn.common.app.web.rest;
//
//import java.util.ArrayList;
//import java.util.HashSet;
//import java.util.LinkedHashMap;
//import java.util.List;
//import java.util.Set;
//import java.util.stream.Collectors;
//
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.cloud.context.config.annotation.RefreshScope;
//import org.springframework.http.HttpHeaders;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
//import com.lfn.iamp.usm.config.Constants;
//import com.lfn.iamp.usm.config.Messages;
//import com.lfn.iamp.usm.domain.Role;
//import com.lfn.iamp.usm.domain.UserProjectRole;
//import com.lfn.iamp.usm.domain.UsmPermissions;
//import com.lfn.iamp.usm.repository.UserProjectRoleRepository;
//import com.lfn.iamp.usm.service.UsersService;
//import com.lfn.iamp.usm.service.UsmPermissionsService;
//
//import io.micrometer.core.annotation.Timed;
//import lombok.Setter;
//
//@RestController
//@RequestMapping("/api")
//@Setter
//@RefreshScope
//public class ModulePermissionResource {
//	/** The logger. */
//	private final Logger logger = LoggerFactory.getLogger(ModulePermissionResource.class);
//
//	@Autowired
//	private UserProjectRoleRepository userProjectRoleRepo;
//
//	@Autowired
//	private UsmPermissionsService usm_permissionsService;
//
//	@Autowired
//	private UsersService userService;
//
//	@GetMapping("/get-permissions/{email}/{module}")
//	@Timed
//	public ResponseEntity<?> getModulePermissions(@PathVariable String module, @PathVariable String email) {
//		logger.info("Get permissions for module");
//		List<UserProjectRole> userProjectRoleList;
//		try {
//			userProjectRoleList = userProjectRoleRepo.findByUserId(userService.findEmail(email));
//
//			List<Role> roles = new ArrayList<>();
//			List<UsmPermissions> permissions = new ArrayList<>();
//			userProjectRoleList.stream().forEach(upr -> {
//				roles.add(upr.getRole_id());
//			});
//			List<LinkedHashMap<String, LinkedHashMap<String, Set<LinkedHashMap<String, Set<String>>>>>> finalList = new ArrayList<>();
//			LinkedHashMap<String, LinkedHashMap<String, Set<LinkedHashMap<String, Set<String>>>>> roleMap = new LinkedHashMap<>();
//			roles.stream().forEach(role -> {
//				permissions.addAll(usm_permissionsService.getPermissionByRoleAndModule(role.getId(), module));
//				LinkedHashMap<String, Set<LinkedHashMap<String, Set<String>>>> modulePermission = new LinkedHashMap<>();
//				modulePermission.put(module, new HashSet<>());
//				Set<LinkedHashMap<String, Set<String>>> resourcePermissionList = new HashSet<>();
//				permissions.stream().forEach(permi -> {
//					LinkedHashMap<String, Set<String>> resourcePermission = new LinkedHashMap<>();
//
//					List<LinkedHashMap<String, Set<String>>> isexist = modulePermission.get(module).stream()
//							.filter(p -> p.containsKey(permi.getResources())).collect(Collectors.toList());
//
//					if (isexist.size() > 0) {
//						Set<String> permissionTypes = isexist.get(0).get(permi.getResources());
//						permissionTypes.add(permi.getPermission());
//						resourcePermission.put(permi.getResources(), permissionTypes);
//					} else {
//						Set<String> permissionTypes = new HashSet<>();
//						permissionTypes.add(permi.getPermission());
//						resourcePermission.put(permi.getResources(), permissionTypes);
//					}
//					if (resourcePermissionList.stream().filter(rpl -> rpl.containsKey(permi.getResources()))
//							.collect(Collectors.toList()).size() <= 0)
//						resourcePermissionList.add(resourcePermission);
//					modulePermission.put(module, resourcePermissionList);
//				});
//				roleMap.put(role.getName(), modulePermission);
//				permissions.clear();
//			});
//			finalList.add(roleMap);
//			return new ResponseEntity<List<LinkedHashMap<String, LinkedHashMap<String, Set<LinkedHashMap<String, Set<String>>>>>>>(
//					finalList, new HttpHeaders(), HttpStatus.OK);
//		} catch (EssedumException e) {
//			// TODO Auto-generated catch block
//			return new ResponseEntity<String>(Messages.getMsg(Constants.EXCEPTION_USERSERVICEIMPL_FINDEMAIL),
//					new HttpHeaders(), HttpStatus.BAD_REQUEST);
//		}
//	}
//}


