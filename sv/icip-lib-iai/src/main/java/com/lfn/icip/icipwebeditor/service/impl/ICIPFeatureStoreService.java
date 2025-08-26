package com.lfn.icip.icipwebeditor.service.impl;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import javax.print.DocFlavor.STRING;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.lfn.icip.icipwebeditor.model.FedFeatureStore;
import com.lfn.icip.icipwebeditor.model.ICIPFeatureStore;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedModel;
import com.lfn.icip.icipwebeditor.repository.ICIPFeatureStoreRepository;
import com.lfn.icip.icipwebeditor.service.IICIPFeatureStoreService;
import com.lfn.icip.icipwebeditor.v1.dto.BaseEntity;
import com.lfn.icip.icipwebeditor.v1.service.IICIPSearchable;
import reactor.core.publisher.Flux;

@Service("featurestoreservice")
public class ICIPFeatureStoreService implements IICIPFeatureStoreService,IICIPSearchable{
	private final Logger log = LoggerFactory.getLogger(ICIPFeatureStoreService.class);
	@Autowired
	private ICIPFeatureStoreRepository featureStoreRepo;
	
	final String TYPE = "FEATURESTORE";
	
	@Override
	public Flux<BaseEntity> getObjectByIDTypeAndOrganization(String type, Integer id, String organization) {
		return Flux.just(featureStoreRepo.findByIdAndApporg(id, organization)).defaultIfEmpty(new ICIPFeatureStore())
				.map(s -> {
					BaseEntity entity = new BaseEntity();
					entity.setAlias(s.getName());
					entity.setData(new JSONObject(s).toString());
					entity.setDescription(s.getDescription());
					entity.setId(s.getId());
					entity.setType(TYPE);
					return entity;
				});
	}

	@Override
	public Flux<BaseEntity> getAllObjectsByOrganization(String organization, String search, Pageable page) {
//		Pageable page1 = Pageable.unpaged();
//		page1 = Pageable.ofSize(page.getPageSize()).withPage(page.getPageNumber()-1);
		try {
		List<ICIPFeatureStore> storeList = featureStoreRepo.getAllDistinctStoresByAppOrg(organization, search, page);
		return Flux.fromIterable(storeList).defaultIfEmpty(new ICIPFeatureStore()).parallel().map(s -> {
			BaseEntity entity = new BaseEntity();
			entity.setAlias(s.getName());
			entity.setData(new JSONObject(s).toString());
			entity.setDescription(s.getDescription());
			entity.setId(s.getId());
			entity.setType(TYPE);
			return entity;
		}).sequential();
	    } catch (Exception e) {
	        log.error("Error while parsing featureStore--->", e);
	        return Flux.empty();
	    }
	}

	@Override
	public String getType() {
		return TYPE;
	}

	@Override
	public List<ICIPFeatureStore> getAllStoreByAdpaterIdAndOrganisation(String adapterInstance, String project,
			Pageable paginate, List<Integer> tags, String query, String orderBy, String type) {
		List<ICIPFeatureStore> storeList = new ArrayList();
		List<String> adapterInstanceList = new ArrayList();
		if (adapterInstance != null) {
			adapterInstanceList = Arrays.asList(adapterInstance.split(","));
		}
		List<String> typeList = new ArrayList();
		if (type != null) {
			typeList = Arrays.asList(type.split(","));
		}
		if (typeList.size() < 1)
			typeList.add("notRequired");
		if (adapterInstanceList.size() < 1)
			adapterInstanceList.add("notRequired");
//
//		if (tags != null) {
//			storeList = featureStoreRepo.getAllStoreByAppOrgandAdapterIdWithTag(project, tags, paginate, query,
//					adapterInstanceList, typeList);
//		} else {
//			storeList = featureStoreRepo.getAllStoreByAppOrgandAdapterIdWithoutTag(project, paginate, query,
//					adapterInstanceList, typeList);
//		}
		//storeList = featureStoreRepo.getAllFeatureStoreList();
		storeList = featureStoreRepo.getAllStoreByAppOrgandAdapterIdWithoutTag(project, paginate, query,adapterInstanceList);
		
		return storeList;
	}

	@Override
	public Long getStoreCountByAdpateridAndOrganisation(String instance, String project, String query,
			String orderBy, String type) {
		Long modeListCount;
		List<String> instanceList = new ArrayList();
		if (instance != null) {
			instanceList = Arrays.asList(instance.split(","));
		}
		List<String> typeList = new ArrayList();
		if (type != null) {
			typeList = Arrays.asList(type.split(","));
		}
		if (typeList.size() < 1)
			typeList.add("notRequired");
		if (instanceList.size() < 1)
			instanceList.add("notRequired");
		modeListCount = featureStoreRepo.getAllStoreCountByAppOrgandAdapterIdWithoutTag(project, query, instanceList);

		return modeListCount;
	}
	
	@Override
	public void saveStore(ICIPFeatureStore store) {
		featureStoreRepo.save(store);
		
	}
	
	public void updateIsDelStore(ICIPFeatureStore store,String org) {
		FedFeatureStore id = new FedFeatureStore();
		id.setSourceName(store.getName());
		id.setAdapterId(store.getAdapter());
		id.setOrganization(org);
		ICIPFeatureStore getStore = featureStoreRepo.findById(id).get();
		getStore.setIsDeleted(true);
		featureStoreRepo.save(getStore);
	}

}
