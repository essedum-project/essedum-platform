package com.lfn.icip.icipwebeditor.repository.postgresql;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.icip.icipwebeditor.model.ICIPClustering;
import com.lfn.icip.icipwebeditor.repository.clusteringRepository;

@Profile("postgres")
@Repository
public interface ICIPClusteringConfigRepositoryPostgres extends clusteringRepository{
	
	@Query(value="SELECT * from mlclusteringworkflow p1 WHERE "
            + " p1.organization = :project AND"
            + " p1.name = :name", nativeQuery = true)
	ICIPClustering findByNameAndOrganization(@Param("name")String name, @Param("project")String project);
	

}
