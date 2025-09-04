package com.lfn.icip.icipwebeditor.v1.service;

import org.springframework.data.domain.Pageable;

import com.lfn.icip.icipwebeditor.v1.dto.BaseEntity;

import reactor.core.publisher.Flux;

public interface IICIPSearchable {	
Flux<BaseEntity> getObjectByIDTypeAndOrganization(String type,Integer id,String organization);
Flux<BaseEntity> getAllObjectsByOrganization(String organization,String search,Pageable page);
String getType();

}