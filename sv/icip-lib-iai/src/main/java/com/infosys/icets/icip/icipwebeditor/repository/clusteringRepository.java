package com.infosys.icets.icip.icipwebeditor.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infosys.icets.icip.icipwebeditor.model.ICIPClustering;

public interface clusteringRepository extends JpaRepository<ICIPClustering, Integer>  {

	ICIPClustering findByNameAndOrganization(String name, String org);

}
