package com.lfn.iamp.usm.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import com.lfn.iamp.usm.domain.Project;
import com.lfn.iamp.usm.domain.UsmSecret;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


@NoRepositoryBean
public interface SecretsManagerRepository extends JpaRepository<UsmSecret, Integer> {


public UsmSecret findByKeyAndProjectId(String key, Project project);


public List<UsmSecret> findAllByProjectId(Project project,Pageable page);
	
	
public Long countByProject(Integer project);

@Query(value = "SELECT * FROM usm_secrets t1 WHERE t1.project_id = :projectId " +
        "AND LOWER(t1.key_) LIKE LOWER(CONCAT('%', :search, '%')) " +
        "ORDER BY t1.id " +
        "LIMIT :limit OFFSET :offset",
nativeQuery = true)
List<UsmSecret> findAllByProjectIdAndSearch(@Param("projectId") Integer projectId, 
                                    @Param("search") String search, 
                                    @Param("offset") Integer offset,
                                    @Param("limit") Integer limit);

@Query(value = "SELECT COUNT(*) FROM usm_secrets t1 WHERE t1.project_id = :projectId " +
        "AND LOWER(t1.key_) LIKE LOWER(CONCAT('%', :search, '%'))",
nativeQuery = true)
Long countByProjectIdAndSearch(@Param("projectId") Integer projectId, 
                       @Param("search") String search);
	
}
