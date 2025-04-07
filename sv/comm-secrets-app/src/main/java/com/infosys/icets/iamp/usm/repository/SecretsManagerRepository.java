package com.infosys.icets.iamp.usm.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import com.infosys.icets.iamp.usm.domain.Project;
import com.infosys.icets.iamp.usm.domain.UsmSecret;


@NoRepositoryBean
public interface SecretsManagerRepository extends JpaRepository<UsmSecret, Integer> {


public UsmSecret findByKeyAndProjectId(String key, Project project);


public List<UsmSecret> findAllByProjectId(Project project,Pageable page);
	
	
public Long countByProject(Integer project);
	
}
