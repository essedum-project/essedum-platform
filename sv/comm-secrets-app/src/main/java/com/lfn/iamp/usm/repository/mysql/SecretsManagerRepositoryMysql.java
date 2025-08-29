package com.lfn.iamp.usm.repository.mysql;

import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.iamp.usm.domain.Project;
import com.lfn.iamp.usm.domain.UsmSecret;
import com.lfn.iamp.usm.repository.SecretsManagerRepository;

@Profile("mysql")
@Repository
public interface SecretsManagerRepositoryMysql extends SecretsManagerRepository {
	public UsmSecret findByKeyAndProjectId(String key, Project project);

	@Query(value="SELECT count(*) from usm_secrets t1 WHERE t1.project_id=:project",nativeQuery=true)
	 Long countByProject(@Param("project") Integer project);

}
