package com.lfn.icip.dataset.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import com.lfn.icip.dataset.model.ICIPRelationship;
import com.lfn.icip.dataset.model.ICIPSchemaForm;
import com.lfn.icip.dataset.model.ICIPSchemaRegistry;

/**
 * The Interface ICIPRelationshipRepository.
 */
@NoRepositoryBean
public interface ICIPRelationshipRepository extends JpaRepository<ICIPRelationship, Integer>{

	/**
	 * Find by organization.
	 *
	 * @param organization the from organization
	 * @return the list
	 */
	public List<ICIPRelationship> findByOrganization(String organization);

	public ICIPRelationship findByAliasAndOrganization(String alias, String organization);
	
	public ICIPRelationship findByNameAndOrganization(String name, String organization);
}
