package com.lfn.icip.icipwebeditor.repository.mssql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.icip.icipwebeditor.model.ICIPMLAIWorker;
import com.lfn.icip.icipwebeditor.model.ICIPMLAIWorkerConfig;
import com.lfn.icip.icipwebeditor.repository.ICIPMLAIWorkerRepository;


// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPMLAIWorkerRepositoryMSSQL.
 */
@Profile("mssql")
@Repository
public interface ICIPMLAIWorkerRepositoryMSSQL extends ICIPMLAIWorkerRepository{
	
	@Query(value="SELECT * from mlaiworker p1 WHERE "
            + " p1.organization = :project AND"
            + "  (:query1 IS NULL OR LOWER(p1.alias) like LOWER(CONCAT('%', :query1, '%'))) "
            + " ORDER BY p1.lastmodifiedon DESC",nativeQuery = true)
	List<ICIPMLAIWorker> getAllAIWorkerByOrg(@Param("project")String project, Pageable paginate,@Param("query1") String query);
	
	@Query(value="SELECT count(*) from mlaiworker p1 WHERE "
            + " p1.organization = :project AND"
            + "  (:query1 IS NULL OR LOWER(p1.alias) like LOWER(CONCAT('%', :query1, '%')))", nativeQuery = true)
	Long getAiWorkerCountByOrg(@Param("project")String project, @Param("query1") String query); 
	
	@Query(value="SELECT * from mlaiworker p1 WHERE "
            + " p1.organization = :project AND"
            + " p1.name = :name", nativeQuery = true)
	ICIPMLAIWorker findByNameAndOrganization(@Param("name")String name, @Param("project")String project);
	
	@Transactional
	@Modifying
	@Query(value="UPDATE mlaiworker SET isdefault = 0 WHERE "
            + " organization = :org AND"
            + " name = :name AND"
            + " task = :task", nativeQuery = true)
	void setDefaultVersionOfTask(@Param("name")String name,@Param("org")String org,@Param("task")String task);

}
