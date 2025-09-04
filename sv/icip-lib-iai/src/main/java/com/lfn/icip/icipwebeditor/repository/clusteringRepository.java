package com.lfn.icip.icipwebeditor.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lfn.icip.icipwebeditor.model.ICIPClustering;

public interface clusteringRepository extends JpaRepository<ICIPClustering, Integer>  {

	ICIPClustering findByNameAndOrganization(String name, String org);

}
