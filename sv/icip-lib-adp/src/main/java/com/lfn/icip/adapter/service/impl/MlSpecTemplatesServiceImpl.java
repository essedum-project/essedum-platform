/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package com.lfn.icip.adapter.service.impl;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.json.JSONObject;
import org.json.JSONArray;

//import org.json.simple.JSONValue;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.icip.adapter.service.MlSpecTemplatesService;
import com.lfn.icip.dataset.constants.ICIPPluginConstants;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.model.MlAdapters;
import com.lfn.icip.dataset.model.MlInstance;
import com.lfn.icip.dataset.model.MlSpecTemplates;
import com.lfn.icip.dataset.model.MlSpecTemplates2;
import com.lfn.icip.dataset.repository.MlAdaptersRepository;
import com.lfn.icip.dataset.repository.MlSpecTemplatesRepository;

import net.minidev.json.JSONValue;



/**
 * The Class MlSpecTemplatesServiceImpl.
 *
 * @author essedum
 */
@Service
@RefreshScope
public class MlSpecTemplatesServiceImpl implements MlSpecTemplatesService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(MlSpecTemplatesServiceImpl.class);

	/** The Constant joblogger. */
	private static final Logger joblogger = LoggerFactory.getLogger(JobLogger.class);
	
	/** The mlSpecTemplatesRepository repository. */
	private MlSpecTemplatesRepository mlSpecTemplatesRepository;
	
	@Autowired
	private MlAdaptersRepository mlAdaptersRepository;
	
	@Value("${security.claim:#{null}}")
	private String claim;

	public MlSpecTemplatesServiceImpl(MlSpecTemplatesRepository mlSpecTemplatesRepository) {
		super();
		this.mlSpecTemplatesRepository = mlSpecTemplatesRepository;
	}

	@Override
	public MlSpecTemplates save(MlSpecTemplates mlSpecTemplates) {
		return mlSpecTemplatesRepository.save(mlSpecTemplates);
	}
	
    
	@Override
	public MlSpecTemplates getMlSpecTemplateByDomainNameAndOrganization(String domainName,String organization) {
		return mlSpecTemplatesRepository.getMlSpecTemplateByDomainnameAndOrganization(domainName,organization).stream().findFirst().orElse(null);

	}

	@Override
	public Map<String, String> delete(String domainName, String organization) {
		MlSpecTemplates mlSpecTemplates = mlSpecTemplatesRepository
				.getMlSpecTemplateByDomainnameAndOrganization(domainName, organization).stream().findFirst()
				.orElse(null);
		Map<String, String> response = new HashMap<>();
		if (mlSpecTemplates != null) {
			List<MlAdapters> mlAdapters = mlAdaptersRepository.getMlAdaptersBySpecTemplateDomainNameAndOrg(domainName,
					organization);
			if (mlAdapters == null || mlAdapters.isEmpty()) {
				mlSpecTemplatesRepository.delete(mlSpecTemplates);
				response.put(ICIPPluginConstants.MESSAGE, ICIPPluginConstants.MESSAGE_SUCCESS);
			} else {
				response.put(ICIPPluginConstants.MESSAGE, ICIPPluginConstants.MESSAGE_FAILED);
			}
		}
		return response;
	}

	@Override
	public List<MlSpecTemplates2> getAllMlSpecTemplates(String org) {
		return mlSpecTemplatesRepository.getAllMlSpecTemplates(org);
	}
	
	@Override
	public MlSpecTemplates updateMlSpecTemplate(MlSpecTemplates mlSpecTemplate) {
		MlSpecTemplates mlSpecTemplateFromDB = this.getMlSpecTemplateByDomainNameAndOrganization(mlSpecTemplate.getDomainname(),mlSpecTemplate.getOrganization());
		if (mlSpecTemplateFromDB != null) {
			mlSpecTemplateFromDB.setLastmodifiedon(Timestamp.from(Instant.now()));
			mlSpecTemplateFromDB.setLastmodifiedby(ICIPUtils.getUser(claim));
			mlSpecTemplateFromDB.setDescription(mlSpecTemplate.getDescription());
			mlSpecTemplateFromDB.setApispectemplate(mlSpecTemplate.getApispectemplate());
			mlSpecTemplateFromDB.setCapability(mlSpecTemplate.getCapability());
			return mlSpecTemplatesRepository.save(mlSpecTemplateFromDB);
		}
		return mlSpecTemplateFromDB;
	}

	@Override
	public Map<String, Object> getFiltersByOrganization(String org) {
		List<MlSpecTemplates> mlSpecTemplates = mlSpecTemplatesRepository.getMlSpecTemplateByOrganization(org);
		List<String> capabilityFilters = new ArrayList<>();
		Map<String, Object> filters = new HashMap<>();
		mlSpecTemplates.forEach((spec -> {
			if (spec.getCapability() != null) {
				Object capability = JSONValue.parse(spec.getCapability());
				if (capability instanceof List<?>) {
				    List<?> rawList = (List<?>) capability;
				    for (Object item : rawList) {
				        if (item instanceof String) {
				            String cap = (String) item;
				            if (!capabilityFilters.contains(cap)) {
				                capabilityFilters.add(cap);
				            }
				        }
				    }
				} else if (capability instanceof String) {
				    String cap = (String) capability;
				    if (!capabilityFilters.contains(cap)) {
				        capabilityFilters.add(cap);
				    }
				}

			}
		}));
		filters.put("capability", capabilityFilters);
		return filters;
	}

	@Override
	public List<String> getSpecTemplatesNamesByOrganization(String org) {
		return mlSpecTemplatesRepository.getSpecTemplatesNamesByOrganization(org);
	}
	
	public boolean copy(String fromProjectName, String toProjectId) {
		List<MlSpecTemplates> specTemplateList = mlSpecTemplatesRepository.getMlSpecTemplateByOrganization(fromProjectName);
		specTemplateList.stream().forEach(specTemplate -> {
			MlSpecTemplates spec = mlSpecTemplatesRepository.getMlSpecTemplateByDomainnameAndOrganization(specTemplate.getDomainname(),fromProjectName).get(0);
			try {
			spec.setId(null);
			spec.setOrganization(toProjectId);
			String updatedSpecTemp = spec.getApispectemplate().replace(fromProjectName, "{org}");
			spec.setApispectemplate(updatedSpecTemp);
			mlSpecTemplatesRepository.save(spec);
			}
			catch (Exception e) {
				joblogger.error("Error in MLSpec Template Copy Blueprint {}", e.getMessage());
			}
		});
		return true;
	}
	
	public JsonObject export(Marker marker, String source, JSONArray modNames) {
		JsonObject jsnObj = new JsonObject();
		try {
			joblogger.info(marker, "Exporting specTemplates started");
			Gson gson = new GsonBuilder().disableHtmlEscaping().create();
//			List<MlSpecTemplates> specTemplates = mlSpecTemplatesRepository.getMlSpecTemplateByOrganization(source);
			List<MlSpecTemplates> specTemplates = new ArrayList<>();
			modNames.forEach(domainname -> {
				MlSpecTemplates mlSpecTemplates = mlSpecTemplatesRepository
						.getMlSpecTemplateByDomainnameAndOrganization(domainname.toString(), source).get(0);
				String updatedSpecTemp = mlSpecTemplates.getApispectemplate().replace(source, "{org}");
				mlSpecTemplates.setApispectemplate(updatedSpecTemp);
				specTemplates.add(mlSpecTemplates);
			});
			jsnObj.add("mlspectemplates", gson.toJsonTree(specTemplates));
			joblogger.info(marker, "Exported specTemplates successfully");
		}
		catch(Exception ex) {
			joblogger.error(marker,"Error in exporting specTemplates");
			joblogger.error(marker, ex.getMessage());
		}
		return jsnObj;
	}

	public void importData(Marker marker, String target, JSONObject jsonObject) {
		Gson g = new Gson();
		try {
			joblogger.info(marker, "Importing specTemplates Started");
			JsonArray specTemplates = g.fromJson(jsonObject.get("mlspectemplates").toString(), JsonArray.class);
			specTemplates.forEach(x -> {
				MlSpecTemplates spec = g.fromJson(x, MlSpecTemplates.class);
				MlSpecTemplates specPresent = mlSpecTemplatesRepository.getMlSpecTemplateByDomainnameAndOrganization(spec.getDomainname(),target).stream().findFirst().orElse(null);
				spec.setOrganization(target);
				spec.setLastmodifiedby(ICIPUtils.getUser(claim));
				spec.setLastmodifiedon(new Timestamp(System.currentTimeMillis()));
				spec.setCreatedby(ICIPUtils.getUser(claim));
				spec.setCreatedon(new Timestamp(System.currentTimeMillis()));
				spec.setId(null);
				try {
					if(specPresent == null)
					mlSpecTemplatesRepository.save(spec);
				}
				catch(Exception de) {
					joblogger.error(marker, "Error in importing duplicate specTemplate {}",spec.getDomainname());
				}
			});
			joblogger.info(marker, "Imported specTemplates Successfully");
		}
		catch(Exception ex) {
			joblogger.error(marker, "Error in importing specTemplates");
			joblogger.error(marker, ex.getMessage());
		}
	}
	
	@Override
	public List<MlSpecTemplates2> getMlSpecTemplatesPageWise(String org, String filters, String page, String size,
			String query) {
		try {
			List<MlSpecTemplates2> result;

			if (filters == null) {
				if (query == null) {
					if (page == null || size == null) {
						result = mlSpecTemplatesRepository.getAllMlSpecTemplates(org);
					} else {
						try {
							Pageable paginate = PageRequest.of(Integer.parseInt(page) - 1, Integer.parseInt(size));
							result = mlSpecTemplatesRepository.getAllMlSpecTemplatesByOrganization(org, paginate);
						} catch (NumberFormatException e) {
							logger.error(e.getMessage());
							return Collections.emptyList();
						}
					}
				} else {
					if (page == null || size == null) {
						result = mlSpecTemplatesRepository.getAllMlSpecTemplatesByOrganizationAndDomainname(org, query,
								null);
					} else {
						try {
							Pageable paginate = PageRequest.of(Integer.parseInt(page) - 1, Integer.parseInt(size));
							result = mlSpecTemplatesRepository.getAllMlSpecTemplatesByOrganizationAndDomainname(org,
									query, paginate);
						} catch (NumberFormatException e) {
							logger.error(e.getMessage());
							return Collections.emptyList();
						}
					}
				}
			} else {
				List<String> filterList = Arrays.asList(filters.split(","));
				List<MlSpecTemplates2> specTemplates = new ArrayList<>();
				List<MlSpecTemplates2> specs = new ArrayList<>();

				Map<Integer, MlSpecTemplates2> uniqueTemplates = new LinkedHashMap<>();
				for (String filter : filterList) {
					List<MlSpecTemplates2> templates = mlSpecTemplatesRepository
							.getMlSpecTemplatesByOrganizationAndCapability(org, filter);
					for (MlSpecTemplates2 template : templates) {
						uniqueTemplates.put(template.getId(), template); // Only one per id
					}
				}
				specTemplates.clear();
				specTemplates.addAll(uniqueTemplates.values());

				if (query == null) {
					if (page == null || size == null) {
						result = specTemplates;
					} else {
						try {
							Pageable paginate = PageRequest.of(Integer.valueOf(page) - 1, Integer.valueOf(size));
							int start = (int) paginate.getOffset();
							int end = Math.min((start + paginate.getPageSize()), specTemplates.size());
							if (start > end)
								return Collections.emptyList();
							result = specTemplates.subList(start, end);
						} catch (NumberFormatException | IndexOutOfBoundsException e) {
							logger.error(e.getMessage());
							return Collections.emptyList();
						}
					}
				} else {
					for (MlSpecTemplates2 spec : specTemplates) {
						if (spec.getDomainname().toLowerCase().contains(query.toLowerCase())) {
							specs.add(spec);
						}
					}

					if (page == null || size == null) {
						result = specs;
					} else {
						try {
							Pageable paginate = PageRequest.of(Integer.valueOf(page) - 1, Integer.valueOf(size));
							int start = (int) paginate.getOffset();
							int end = Math.min((start + paginate.getPageSize()), specs.size());
							if (start > end)
								return Collections.emptyList();
							result = specs.subList(start, end);
						} catch (NumberFormatException | IndexOutOfBoundsException e) {
							logger.error(e.getMessage());
							return Collections.emptyList();
						}
					}
				}
			}

			return result;
		} catch (Exception e) {
			logger.error(e.getMessage());
			return Collections.emptyList();
		}
	}

	@Override
	public Long getMlSpecTemplatesCount(String org, String filters, String query) {
		try {
			if (filters == null) {
				if (query == null) {
					return mlSpecTemplatesRepository.countByOrganization(org);
				} else {
					return mlSpecTemplatesRepository.countByOrganizationAndDomainnameContainingIgnoreCase(org, query);
				}
			} else {
				List<String> filterList = Arrays.asList(filters.split(","));
				long totalCount = 0;
				List<MlSpecTemplates2> specTemplates = new ArrayList<>();
				Map<Integer, MlSpecTemplates2> uniqueTemplates = new LinkedHashMap<>();
				for (String filter : filterList) {
					List<MlSpecTemplates2> templates = mlSpecTemplatesRepository
							.getMlSpecTemplatesByOrganizationAndCapability(org, filter);
					for (MlSpecTemplates2 template : templates) {
						uniqueTemplates.put(template.getId(), template); // Only one per id
					}
				}
				specTemplates.clear();
				specTemplates.addAll(uniqueTemplates.values());
				if (query != null) {
					long filteredCount = 0;
					for (MlSpecTemplates2 spec : specTemplates) {
						if (spec.getDomainname().toLowerCase().contains(query.toLowerCase())) {
							filteredCount++;
						}
					}
					return filteredCount;
				} else {
					totalCount = specTemplates.size();
					return totalCount;
				}
			}
		} catch (Exception e) {
			logger.error("Error fetching template count: " + e.getMessage());
			return 0L;
		}
	}
	
}