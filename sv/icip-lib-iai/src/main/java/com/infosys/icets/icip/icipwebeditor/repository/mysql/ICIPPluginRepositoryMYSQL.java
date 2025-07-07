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
package com.infosys.icets.icip.icipwebeditor.repository.mysql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.icip.icipwebeditor.model.ICIPPlugin;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPPluginRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPPluginRepositoryMYSQL.
 */
@Profile("mysql")
@Repository
public interface ICIPPluginRepositoryMYSQL extends ICIPPluginRepository {
	
	/**
	 * Fetchiai.
	 *
	 * @return the string
	 */
	@Query(value = "SELECT plugin FROM ICIPPlugin where name = 'iai'", nativeQuery = true)
	public String fetchiai();
	
	@Query(value="SELECT * FROM mlplugin WHERE id IN (SELECT MAX(id) FROM mlplugin GROUP BY NAME) "+ "AND TYPE = :type",nativeQuery = true)
	public List<ICIPPlugin> getByTypeDistinct(@Param("type") String type);
}
