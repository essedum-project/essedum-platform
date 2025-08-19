package com.lfn.icip.dataset.repository;

import java.util.List;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.icip.dataset.model.ICIPDatasetFormMapping;
import com.lfn.icip.dataset.model.ICIPDatasetFormMapping2;

@Repository
public interface ICIPDatasetFormMappingRepository2 extends JpaRepository<ICIPDatasetFormMapping2, Integer> {


}
