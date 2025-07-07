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
package com.infosys.icets.iamp.usm.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.iamp.usm.domain.Email;
import com.infosys.icets.iamp.usm.domain.UserProcessMapping;


@Repository
public interface UserProcessMappingRepository extends JpaRepository<UserProcessMapping,Integer>{

	List<UserProcessMapping> findByOrganization(String organization);

	   @Query("SELECT DISTINCT user FROM UserProcessMapping u WHERE u.organization=:organization AND u.process_key = :processKey AND u.roleMng IN (:roleMng) ")
		List<String> findDistinctUsersByOrganizationAndProcessAndRoleMng (@Param("organization")String organization,@Param("processKey")String processKey,@Param("roleMng")List<String> roleMng);

	@Query("SELECT u FROM UserProcessMapping u WHERE u.organization= :organization"
            + " AND u.process_key = :processKey" )
	List<UserProcessMapping> findByOrganizationAndProcessKey(@Param("organization")String organization,@Param("processKey")String processKey);
	
	List<UserProcessMapping> findByOrganizationAndRoleMngAndUser( String organization,String roleMng, String user);
	List<UserProcessMapping> findByOrganizationAndRoleMng(String organization, String roleMng);

    //List<UserProcessMapping> findByProcessRoleMngAndUser(String process, String roleMng, String user);

//    @Query(value = "SELECT * FROM usm_user_process_mapping u WHERE u.usm_user= :user AND u.organization= :organization"
//            + " AND u.active = 1 AND u.from_date <= CURRENT_TIMESTAMP AND u.to_date >= CURRENT_TIMESTAMP ",nativeQuery=true)
//    List<UserProcessMapping> findByUserLogin(@Param("organization")String organization, @Param("user") String user);

 

    @Query("SELECT u FROM UserProcessMapping u WHERE u.user= :user AND u.organization= :organization"
            + " AND u.activeStatus = true AND u.fromDate <= CURRENT_TIMESTAMP AND u.toDate >= CURRENT_TIMESTAMP ")
    List<UserProcessMapping> findByUserLogin(@Param("organization")String organization, @Param("user") String user);


//    @Query(value = "SELECT * FROM usm_user_process_mapping u WHERE u.usm_user = :user"
//            + " AND u.usm_process_key = :processKey AND u.organization = :organization AND u.usm_role = :role"
//            + " AND from_date<=CURRENT_TIMESTAMP AND to_date>=CURRENT_TIMESTAMP ",nativeQuery=true)
//    UserProcessMapping findByUserLoginAndProcess(@Param("organization")String organization, @Param("user")String user,@Param("processKey") String processKey,@Param("role")String role);

    
    @Query("SELECT u FROM UserProcessMapping u WHERE u.user = :user"
            + " AND u.process_key = :processKey AND u.organization = :organization AND u.roleMng = :role"
            + " AND fromDate <= CURRENT_TIMESTAMP AND toDate >= CURRENT_TIMESTAMP ")
    UserProcessMapping findByUserLoginAndProcess(@Param("organization")String organization, @Param("user")String user,@Param("processKey") String processKey,@Param("role")String role);

//    @Query(value = "SELECT * FROM usm_user_process_mapping u WHERE  u.organization= :organization"
//            + " AND u.usm_process_key = :processKey AND u.from_date <= CURRENT_TIMESTAMP AND u.to_date >= CURRENT_TIMESTAMP ",nativeQuery=true)
//    List<UserProcessMapping> findUserByProcess(@Param("organization") String organization, @Param("processKey") String processKey);

    @Query("SELECT u FROM UserProcessMapping u WHERE  u.organization= :organization"
            + " AND u.process_key = :processKey AND u.fromDate <= CURRENT_TIMESTAMP AND u.toDate >= CURRENT_TIMESTAMP ")
    List<UserProcessMapping> findUserByProcess(@Param("organization") String organization, @Param("processKey") String processKey);

//    @Query(value = "SELECT * FROM usm_user_process_mapping u WHERE "
//            + "  u.usm_process_key = :processKey AND u.usm_role = :roleMng"
//            + " AND u.from_date<=CURRENT_TIMESTAMP AND u.to_date>=CURRENT_TIMESTAMP ",nativeQuery=true)
//    List<UserProcessMapping> findByProcessAndRoleMng(@Param("processKey") String processKey,@Param("roleMng")String role);
    
    @Query("SELECT u FROM UserProcessMapping u WHERE u.organization= :organization"
            + " AND u.process_key = :processKey AND u.roleMng = :roleMng")
	List<UserProcessMapping> findByOrganizationAndProcessAndRoleMng(@Param("organization") String organization,@Param("processKey") String processKey,@Param("roleMng")String role);
	
	
	
	@Query("SELECT u FROM UserProcessMapping u WHERE u.organization= :organization AND"
			+ "  u.process_key = :processKey AND u.roleMng = :roleMng"
			+ " AND u.user = :user")
	List<UserProcessMapping> findByOrganizationAndProcessAndRoleMngAndUser(@Param("organization") String organization,@Param("processKey") String processKey,@Param("roleMng")String role, @Param("user")String user);

 

    @Query("SELECT u FROM UserProcessMapping u WHERE "
            + "  u.process_key = :processKey AND u.roleMng = :roleMng"
            + " AND u.fromDate <= CURRENT_TIMESTAMP AND u.toDate >= CURRENT_TIMESTAMP ")
    List<UserProcessMapping> findByProcessAndRoleMng(@Param("processKey") String processKey,@Param("roleMng")String role);

 

    @Query("SELECT u FROM UserProcessMapping u WHERE "
            + "  u.process_key = :processKey AND u.roleMng = :roleMng"
            + " AND u.user = :user")
    List<UserProcessMapping> findByProcessRoleMngAndUser(@Param("processKey") String processKey,@Param("roleMng")String role, @Param("user")String user);

//    @Query(value = "SELECT * FROM usm_user_process_mapping u WHERE u.usm_role=:role AND  u.organization= :organization"
//            + " AND u.usm_process_key = :processKey AND u.from_date <= CURRENT_TIMESTAMP AND u.to_date >= CURRENT_TIMESTAMP ",nativeQuery=true)
//    List<UserProcessMapping> findUserByProcessAndRole(@Param("organization") String organization, @Param("processKey") String processKey, @Param("role") String role);

    @Query("SELECT u FROM UserProcessMapping u WHERE u.roleMng=:role AND  u.organization= :organization"
            + " AND u.process_key = :processKey AND u.fromDate <= CURRENT_TIMESTAMP AND u.toDate >= CURRENT_TIMESTAMP ")
    List<UserProcessMapping> findUserByProcessAndRole(@Param("organization") String organization, @Param("processKey") String processKey, @Param("role") String role);

 
//    @Query(value = "SELECT * FROM usm_user_process_mapping u WHERE u.organization= :organization"
//            + " AND u.usm_process_key = :processKey AND u.from_date <= CURRENT_TIMESTAMP AND u.to_date >= CURRENT_TIMESTAMP ",nativeQuery=true)
//    List<UserProcessMapping> findRoleByProcessAndOrganization(@Param("organization") String organization, @Param("processKey") String processKey);

 
    @Query("SELECT u FROM UserProcessMapping u WHERE u.organization= :organization"
            + " AND u.process_key = :processKey AND u.fromDate <= CURRENT_TIMESTAMP AND u.toDate >= CURRENT_TIMESTAMP ")
    List<UserProcessMapping> findRoleByProcessAndOrganization(@Param("organization") String organization, @Param("processKey") String processKey);


    @Query(value = "SELECT * FROM usm_user_process_mapping u WHERE u.usm_process_key=:processKey AND u.organization = :organization AND u.active = true AND u.usm_user != :currentUser AND u.from_date <= :startTime AND u.to_date >= :endTime AND u.usm_user NOT IN"
            + " (SELECT last_updated_user FROM icm_delegate WHERE process_id = :processKey AND is_active = true AND (:startTime <= icm_delegate.end_time) AND (:startTime <= :endTime) AND (icm_delegate.start_time <= :endTime) AND (icm_delegate.start_time <= icm_delegate.end_time))",nativeQuery=true)
    List<UserProcessMapping> findUsersForDelegation(@Param("organization") String organization, @Param("processKey") String processKey, @Param("startTime") String startTime, @Param("endTime") String endTime, @Param("currentUser") String currentUser);

    
     @Query("SELECT DISTINCT user FROM UserProcessMapping u WHERE u.process_key = :processKey AND u.organization=:organization")
 	List<String> findUsersByProcess(@Param("processKey") String processKey, @Param("organization") String organization);
   
     @Query("SELECT u FROM UserProcessMapping u WHERE u.roleMng=:role AND  u.organization= :organization"
             + " AND u.user = :user AND u.fromDate <= CURRENT_TIMESTAMP AND u.toDate >= CURRENT_TIMESTAMP ")
     List<UserProcessMapping> findByRoleAndUserAndOrganization(@Param("organization") String organization, @Param("user") String user, @Param("role") String role);
  
     @Query("SELECT DISTINCT user FROM UserProcessMapping u WHERE u.process_key = :processKey AND u.organization=:organization")
 	List<String> findUsersByProcess1(@Param("processKey") String processKey, @Param("organization") String organization);
   
    

//	@Query(value = "SELECT * FROM usm_user_process_mapping u WHERE u.usm_role=:role AND  u.organization= :organization"
//			+ " AND u.usm_process_key = :processKey AND u.from_date <= CURRENT_DATE AND u.to_date >= CURRENT_DATE ",nativeQuery=true)
//	List<UserProcessMapping> findUserByProcessAndRole(@Param("organization") String organization, @Param("processKey") String processKey, @Param("role") String role);
//	
//	@Query(value = "SELECT * FROM usm_user_process_mapping u WHERE u.organization= :organization"
//			+ " AND u.usm_process_key = :processKey AND u.from_date <= CURRENT_DATE AND u.to_date >= CURRENT_DATE ",nativeQuery=true)
//	List<UserProcessMapping> findRoleByProcessAndOrganization(@Param("organization") String organization, @Param("processKey") String processKey);
	 
//	@Query(value = "SELECT * FROM usm_user_process_mapping u WHERE u.usm_process_key=:processKey AND u.organization = :organization AND u.active = 1 AND u.usm_user != :currentUser AND u.from_date <= :startTime AND u.to_date >= :endTime AND u.usm_user NOT IN"
//			+ " (SELECT last_updated_user FROM icm_delegate WHERE process_id = :processKey AND is_active IS TRUE AND (:startTime <= icm_delegate.end_time) AND (:startTime <= :endTime) AND (icm_delegate.start_time <= :endTime) AND (icm_delegate.start_time <= icm_delegate.end_time))",nativeQuery=true)
//	List<UserProcessMapping> findUsersForDelegation(@Param("organization") String organization, @Param("processKey") String processKey, @Param("startTime") String startTime, @Param("endTime") String endTime, @Param("currentUser") String currentUser);

	List<UserProcessMapping> findAll();
}
