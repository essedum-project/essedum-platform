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
package com.infosys.icets.icip.dataset.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import com.infosys.icets.icip.dataset.model.ICIPMlIntstance;

/**
 * Spring Data JPA repository for the ICIPMlIntstance entity.
 */
/**
 * @author icets
 */
@NoRepositoryBean
public interface ICIPMlIntstanceRepository extends JpaRepository<ICIPMlIntstance, Integer> {


	public ICIPMlIntstance findByNameAndOrganization(String name, String org);

	/**
	 * Find by type and organization.
	 *
	 * @param type the type
	 * @param org  the org
	 * @return the list
	 */
	public int countByName(String name);

	public List<ICIPMlIntstance> findByAliasAndOrganization(String alias,String org);
	
	public List<ICIPMlIntstance> findByOrganization(String org);
}
