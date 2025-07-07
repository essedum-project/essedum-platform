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
package com.infosys.icets.icip.icipwebeditor.repository.postgresql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.icip.icipwebeditor.model.ICIPPrompts;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPPrompRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPStreamingServicesRepositoryMYSQL.
 */
@Profile("postgresql")
@Repository
public interface ICIPPrompRepositoryPOSTGRESQL extends ICIPPrompRepository {

	@Query(value="SELECT * from mlprompts p1 WHERE "
            + " p1.organization = :project AND"
            + "  (:query1 IS NULL OR p1.alias iLike CONCAT('%', :query1, '%') OR p1.name iLike CONCAT('%', :query1, '%')) "
            + " ORDER BY p1.createdon DESC",nativeQuery = true)
	List<ICIPPrompts> getAllPromptsByOrg(@Param("project")String project, Pageable paginate,@Param("query1") String query);
	
	@Query(value="SELECT count(*) from mlprompts p1 WHERE "
            + " p1.organization = :project AND"
            + "  (:query1 IS NULL OR p1.alias iLike CONCAT('%', :query1, '%') OR p1.name iLike CONCAT('%', :query1, '%')) "
            + " ORDER BY p1.createdon DESC",nativeQuery = true)
	Long getPromptsCountByOrg(@Param("project")String project, @Param("query1") String query); 

	@Query(value="SELECT * from mlprompts p1 WHERE "
            + " p1.organization = :project",nativeQuery = true)
	List<ICIPPrompts> findAllByOrganization(@Param("project")String project); 

	@Query(value="SELECT * from mlprompts p1 WHERE "
            + " p1.organization = :project AND p1.alias = :alias",nativeQuery = true)
	ICIPPrompts findByAliasAndOrganization(@Param("alias")String alias,@Param("project")String project);

}