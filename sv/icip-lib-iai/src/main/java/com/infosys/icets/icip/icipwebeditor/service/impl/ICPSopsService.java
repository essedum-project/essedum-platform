package com.infosys.icets.icip.icipwebeditor.service.impl;

import java.util.stream.Collectors;

import jakarta.transaction.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.icip.icipwebeditor.model.ICIPSops;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPSopsRepository;
import com.infosys.icets.icip.icipwebeditor.service.IICPSopsService;

@Service
public class ICPSopsService implements IICPSopsService {

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(ICPSopsService.class);

	@Autowired
	private ICIPSopsRepository icip_sopsRepository;
	/**
	 * Get all the widget_configurations.
	 *
	 * @param req the req
	 * @return the list of entities
	 */
	@Override
	public PageResponse<ICIPSops> getAll(PageRequestByExample<ICIPSops> req) {
		log.debug("Request to get all IcmSops");
		Example<ICIPSops> example = null;
		ICIPSops icm_sops = req.getExample();

		if (icm_sops != null) {
			ExampleMatcher matcher = ExampleMatcher.matching();

			example = Example.of(icm_sops, matcher);
		}

		Page<ICIPSops> page;
		if (example != null) {
			page = icip_sopsRepository.findAll(example, req.toPageable());
		} else {
			page = icip_sopsRepository.findAll(req.toPageable());
		}

		return new PageResponse<>(page.getTotalPages(), page.getTotalElements(), page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
	}
	
	/**
	 * To DTO.
	 *
	 * @param icm_sops the icm sops
	 * @return the icm sops
	 */
	public ICIPSops toDTO(ICIPSops icm_sops) {
		return toDTO(icm_sops, 0);
	}

	/**
	 * Converts the passed icm_sops to a DTO. The depth is used to control the
	 * amount of association you want. It also prevents potential infinite
	 * serialization cycles.
	 *
	 * @param icm_sops the icm sops
	 * @param depth    the depth of the serialization. A depth equals to 0, means no
	 *                 x-to-one association will be serialized. A depth equals to 1
	 *                 means that xToOne associations will be serialized. 2 means,
	 *                 xToOne associations of xToOne associations will be
	 *                 serialized, etc.
	 * @return the icm sops
	 */
	public ICIPSops toDTO(ICIPSops icm_sops, int depth) {
		if (icm_sops == null) {
			return null;
		}

		ICIPSops dto = new ICIPSops();

		dto.setCreatedByDate(icm_sops.getCreatedByDate());

		dto.setDescription(icm_sops.getDescription());

		dto.setId(icm_sops.getId());

		dto.setCreatedBy(icm_sops.getCreatedBy());

		dto.setSopDocName(icm_sops.getSopDocName());

		dto.setName(icm_sops.getName());

		dto.setSopDocContentType(icm_sops.getSopDocContentType());
		dto.setAliasId(icm_sops.getAliasId());
		dto.setAliasType(icm_sops.getAliasType());
		dto.setSopDoc(icm_sops.getSopDoc());
		dto.setProjectId(icm_sops.getProjectId());
		dto.setDetails(icm_sops.getDetails());
		dto.setWorkflowName(icm_sops.getWorkflowName());
		dto.setFlowchartJson(icm_sops.getFlowchartJson());

		return dto;
	}
}
