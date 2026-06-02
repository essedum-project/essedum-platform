package com.lfn.icip.dataset.repository;

import java.util.List;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.icip.dataset.model.ICIPDatasetFormMapping;
import com.lfn.icip.dataset.model.ICIPSchemaForm;

@Repository
public interface ICIPDatasetFormMappingRepository extends JpaRepository<ICIPDatasetFormMapping, Integer> {
	
	public List<ICIPDatasetFormMapping> getByDatasetAndOrganization(String name, String org);
	
	@Query(value = "SELECT * FROM mldatasetformmapping t1 WHERE t1.dataset = :name AND t1.organization = :org", nativeQuery = true)
	public ICIPDatasetFormMapping findByDatasetAndOrganization(@Param("name")String name,@Param("org") String org);
	@Modifying
	@Transactional
	@Query(value = "DELETE FROM mldatasetformmapping ss WHERE ss.formtemplate = :formtemplate AND ss.dataset = :dataset", nativeQuery = true)
	void deleteByFormtemplateAndDataset(@Param("formtemplate") String formtemplate, @Param("dataset") String dataset);

	public List<ICIPDatasetFormMapping> findByOrganization(String fromProjectId);

	public ICIPDatasetFormMapping findByDatasetAndFormtemplateAndOrganization(String dataset, ICIPSchemaForm name,
			String org);

}
