package com.lfn.icip.icipwebeditor.v1.service;

import org.springframework.data.domain.Pageable;

import com.lfn.icip.icipwebeditor.v1.dto.BaseEntity;

import reactor.core.publisher.Flux;

public interface IICIPSearchableService {

Flux<BaseEntity> getAllData(String organization,String search,Pageable page);
Flux<BaseEntity>  getDataByIdAndType(Integer id , String type,String organization);
Flux<BaseEntity> getAllDataByType(String project, String search, Pageable page, String type);

	
	
	
	
	
}
