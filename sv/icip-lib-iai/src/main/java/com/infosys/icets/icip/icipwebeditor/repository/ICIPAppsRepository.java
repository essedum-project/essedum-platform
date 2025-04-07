/**
 * @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.icip.icipwebeditor.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import com.infosys.icets.icip.icipwebeditor.model.ICIPApps;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface ICIPAppsRepository.
 *
 * @author icets
 */
@SuppressWarnings("unused")
@NoRepositoryBean
public interface ICIPAppsRepository extends JpaRepository<ICIPApps, Integer> {
	

	@Query(value="select * from mlapps where name = ?1 AND organization=?2", nativeQuery = true)
	ICIPApps getByNameAndOrganization(String name, String org);
	
	@Query(value="select * from mlapps where organization=?1", nativeQuery = true)
	List<ICIPApps> getAppsByOrganization(String org);
	

	@Query(value="DELETE FROM mlapps WHERE name=:name AND organization=:org", nativeQuery = true)
	public void deleteByNameAndOrg(@Param("name")String name,@Param("org")String org);

	@Query(value="select distinct scope from mlapps", nativeQuery = true)
	List<String> getAppsType();

	List<ICIPApps> findByOrganization(String organization, Pageable page);

	ICIPApps findByIdAndType(Integer id, String string);
	
	
	ICIPApps customSave(ICIPApps app);

	void deleteApp(ICIPApps app);
	
	Optional<ICIPApps> findByJobName(String pipelineName);
	


	

}
