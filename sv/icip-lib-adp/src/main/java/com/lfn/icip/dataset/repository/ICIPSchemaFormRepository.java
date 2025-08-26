package com.lfn.icip.dataset.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPSchemaForm;

@Repository
public interface ICIPSchemaFormRepository extends JpaRepository<ICIPSchemaForm, Integer> {
	
	/**
	 * Fetch schema form by name and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIPSchemaForm object
	 */
	
	public ICIPSchemaForm getByName(String name);
	
	public List<ICIPSchemaForm> getBySchemanameAndOrganization(String name, String org);

	public ICIPSchemaForm getByNameAndSchemanameAndOrganization(String templatename, String schema, String org);

	public ICIPSchemaForm findBySchemanameAndOrganization(String schema, String org);

	public List<ICIPSchemaForm> findByOrganization(String fromProjectId);
	
	public ICIPSchemaForm getByNameAndOrganization(String name, String organization);

}
