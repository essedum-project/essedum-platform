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

import com.infosys.icets.iamp.usm.domain.OrgUnit;
import com.infosys.icets.iamp.usm.domain.UserUnit;

// TODO: Auto-generated Javadoc
/**
 * Spring Data JPA repository for the UserUnit entity.
 */
/**
* @author icets
*/
@Repository("usmUserUnitRepository")
public interface UserUnitRepository extends JpaRepository<UserUnit, Integer> {

	/**
	 * Find by unit.
	 *
	 * @param unit the unit
	 * @return the list
	 */
	List<UserUnit> findByUnit(OrgUnit unit);

	/**
	 * Find by user and org.
	 *
	 * @param rptUserId the rpt user id
	 * @param orgName the org name
	 * @return the user unit
	 */
	@Query("SELECT u FROM UserUnit AS u WHERE u.user.id = :rptUserId AND u.unit.organisation.name = :orgName AND u.unit.onboarded = true")
	public UserUnit findByUserAndOrg(@Param("rptUserId") Integer rptUserId, @Param("orgName") String orgName);

}
