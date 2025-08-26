package com.lfn.icip.icipwebeditor.repository.mssql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.icip.icipwebeditor.model.ICIPMLTools;
import com.lfn.icip.icipwebeditor.repository.ICIPMLToolsRepository;


// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPMLToolsRepositoryMSSQL.
 */
@Profile("mssql")
@Repository
public interface ICIPMLToolsRepositoryMSSQL extends ICIPMLToolsRepository{
	
	@Query(value="SELECT * from mltools p1 WHERE "
            + " p1.organization = :project AND"
            + "  (:query1 IS NULL OR LOWER(p1.alias) like LOWER(CONCAT('%', :query1, '%'))) "
            + " ORDER BY p1.createdOn DESC",nativeQuery = true)
	List<ICIPMLTools> getAllMltoolsByOrg(@Param("project")String project, Pageable paginate,@Param("query1") String query);
	
	@Query(value="SELECT count(*) from mltools p1 WHERE "
            + " p1.organization = :project AND"
            + "  (:query1 IS NULL OR LOWER(p1.alias) like LOWER(CONCAT('%', :query1, '%')))", nativeQuery = true)
	Long getMltoolCountByOrg(@Param("project")String project, @Param("query1") String query); 
	
	@Query(value="SELECT * from mltools p1 WHERE "
            + " p1.organization = :project AND"
            + " p1.name = :name", nativeQuery = true)
	ICIPMLTools findMltoolByNameAndOrganization(@Param("name")String name, @Param("project")String project);
	
	@Query(value="SELECT * from mltools p1 WHERE "
            + " p1.organization = :project AND"
            + " p1.name = :name", nativeQuery = true)
	List<ICIPMLTools> findMltoolsByNameAndOrganization(@Param("name")String name, @Param("project")String project);
	
	@Query(value = "SELECT * FROM mltools WHERE ORGANIZATION= :organization AND alias = :alias",nativeQuery = true)
	List<ICIPMLTools> checkAlias(@Param("alias") String alias,@Param("organization") String organization);
	
}
