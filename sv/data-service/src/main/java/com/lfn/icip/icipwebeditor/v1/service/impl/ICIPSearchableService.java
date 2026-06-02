package com.lfn.icip.icipwebeditor.v1.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.lfn.icip.icipwebeditor.v1.dto.BaseEntity;
import com.lfn.icip.icipwebeditor.v1.factory.IICIPSearchableFactory;
import com.lfn.icip.icipwebeditor.v1.service.IICIPSearchable;
import com.lfn.icip.icipwebeditor.v1.service.IICIPSearchableService;

import reactor.core.publisher.Flux;
@Service
public class ICIPSearchableService implements IICIPSearchableService {

	@Autowired
	IICIPSearchableFactory searchFactory;

	@Autowired
	private List<IICIPSearchable> searchableList;

	@Override
	public Flux<BaseEntity> getAllData(String organization, String search, Pageable page) {
		return Flux.fromIterable(searchableList).parallel()
				.flatMap((s) -> s.getAllObjectsByOrganization(organization, search, page)).sequential();

	}

	@Override
	public Flux<BaseEntity> getDataByIdAndType(Integer id, String type, String organization) {
		return searchFactory.getSearchableServiceUtil(type.toLowerCase() + "service").getObjectByIDTypeAndOrganization(type, id,
				organization);
	}

	@Override
	public Flux<BaseEntity> getAllDataByType(String project, String search, Pageable page, String type) {
		return searchFactory.getSearchableServiceUtil(type.toLowerCase() + "service").getAllObjectsByOrganization(project, search, page);	}

}
