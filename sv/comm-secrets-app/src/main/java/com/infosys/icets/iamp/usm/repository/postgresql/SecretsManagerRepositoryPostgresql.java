package com.infosys.icets.iamp.usm.repository.postgresql;

import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.iamp.usm.domain.Project;
import com.infosys.icets.iamp.usm.domain.UsmSecret;
import com.infosys.icets.iamp.usm.repository.SecretsManagerRepository;
@Profile("postgresql")
@Repository
public interface SecretsManagerRepositoryPostgresql extends SecretsManagerRepository{
	public UsmSecret findByKeyAndProjectId(String key, Project project);

		
	@Query(value="SELECT count(*) from usm_secrets t1 WHERE t1.project_id=:project",nativeQuery=true)
	 Long countByProject(@Param("project") Integer project);
}
