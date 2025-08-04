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
