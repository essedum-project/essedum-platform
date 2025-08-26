package com.lfn.icip.icipwebeditor.repository.mssql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.icip.icipwebeditor.model.ICIPMLAIWorkerConfig;
import com.lfn.icip.icipwebeditor.repository.ICIPMLAIWorkerConfigRepository;


// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPMLAgentsRepositoryMSSQL.
 */
@Profile("mssql")
@Repository
public interface ICIPMLAIWorkerConfigRepositoryMSSQL extends ICIPMLAIWorkerConfigRepository{
	
	@Query(value="SELECT * from mlaiworkerconfig p1 WHERE "
            + " p1.organization = :project AND"
            + "  (:query1 IS NULL OR LOWER(p1.alias) like LOWER(CONCAT('%', :query1, '%'))) "
            + " ORDER BY p1.lastmodifiedon DESC",nativeQuery = true)
	List<ICIPMLAIWorkerConfig> getAllAIWorkerConfigByOrg(@Param("project")String project, Pageable paginate,@Param("query1") String query);
	
	@Query(value="SELECT count(*) from mlaiworkerconfig p1 WHERE "
            + " p1.organization = :project AND"
            + "  (:query1 IS NULL OR LOWER(p1.alias) like LOWER(CONCAT('%', :query1, '%')))", nativeQuery = true)
	Long getAiWorkerConfigCountByOrg(@Param("project")String project, @Param("query1") String query); 
	
	@Query(value="SELECT * from mlaiworkerconfig p1 WHERE "
            + " p1.organization = :project AND"
            + " p1.name = :name", nativeQuery = true)
	ICIPMLAIWorkerConfig findByNameAndOrganization(@Param("name")String name, @Param("project")String project);
	
	@Query(value="SELECT * from mlaiworkerconfig p1 WHERE "
            + " p1.organization = :project AND"
            + " p1.alias = :alias", nativeQuery = true)
	ICIPMLAIWorkerConfig findByAliasAndOrganization(@Param("alias")String alias, @Param("project")String project);

	@Query(value="SELECT DISTINCT jt.name FROM mlaiworkerconfig t, "
			+ "JSON_TABLE(task_group, '$[*].bots[*]' "
			+ "COLUMNS (NAME VARCHAR(255) PATH '$.name')) jt "
			+ "WHERE t.name IN (:name) AND t.organization = :org", nativeQuery = true)
	List<String> getDistinctToolByWorkerAndOrg(@Param("name")List<String> name, @Param("org") String org);

}
