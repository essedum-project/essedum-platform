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
package com.infosys.icets.icip.dataset.repository.jpql;

import java.util.List;

//import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.infosys.icets.icip.dataset.model.ICIPMlIntstance;
import com.infosys.icets.icip.dataset.repository.ICIPMlIntstanceRepository;

//@Profile("mysql")
@Repository
public interface ICIPMlIntstanceRepositoryJPQL extends ICIPMlIntstanceRepository {


	/* JPQL Queries */
	@Query("SELECT mli FROM ICIPMlIntstance mli where mli.name = ?1 and mli.organization =?2")
	ICIPMlIntstance findByNameAndOrganization(String name, String org);

	@Query("SELECT mli FROM ICIPMlIntstance mli where mli.alias = ?1 and mli.organization =?2")
	List<ICIPMlIntstance> findByAliasAndOrganization(String alis, String org);
}