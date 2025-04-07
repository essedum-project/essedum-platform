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
import com.infosys.icets.icip.icipwebeditor.model.ICIPSopsAlias;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPSopsAliasRepository;
import com.infosys.icets.icip.icipwebeditor.service.IICIPSopsAliasService;

@Service
public class ICIPSopsAliasService implements IICIPSopsAliasService{

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(ICIPSopsAliasService.class);

	@Autowired
	private ICIPSopsAliasRepository icip_sops_aliasRepository;
	/**
	 * Get all the widget_configurations.
	 *
	 * @param req the req
	 * @return the list of entities
	 */
	@Override
	public PageResponse<ICIPSopsAlias> getAll(PageRequestByExample<ICIPSopsAlias> req) {
		log.debug("Request to get all IcmSops");
		Example<ICIPSopsAlias> example = null;
		ICIPSopsAlias icm_sops = req.getExample();

		if (icm_sops != null) {
			ExampleMatcher matcher = ExampleMatcher.matching();

			example = Example.of(icm_sops, matcher);
		}

		Page<ICIPSopsAlias> page;
		if (example != null) {
			page = icip_sops_aliasRepository.findAll(example, req.toPageable());
		} else {
			page = icip_sops_aliasRepository.findAll(req.toPageable());
		}

		return new PageResponse<>(page.getTotalPages(), page.getTotalElements(), page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
	}
	
	/**
	 * To DTO.
	 *
	 * @param icm_sops_alias the icm sops alias
	 * @return the icm sops alias
	 */
	public ICIPSopsAlias toDTO(ICIPSopsAlias icm_sops_alias) {
		return toDTO(icm_sops_alias, 0);
	}
	
	/**
	 * Converts the passed icm_sops to a DTO. The depth is used to control the
	 * amount of association you want. It also prevents potential infinite
	 * serialization cycles.
	 *
	 * @param icm_sops_alias the icm sops alias
	 * @param depth          the depth of the serialization. A depth equals to 0,
	 *                       means no x-to-one association will be serialized. A
	 *                       depth equals to 1 means that xToOne associations will
	 *                       be serialized. 2 means, xToOne associations of xToOne
	 *                       associations will be serialized, etc.
	 * @return the icm sops alias
	 */
	public ICIPSopsAlias toDTO(ICIPSopsAlias icm_sops_alias, int depth) {
		if (icm_sops_alias == null) {
			return null;
		}

		ICIPSopsAlias dto = new ICIPSopsAlias();

		dto.setDescription(icm_sops_alias.getDescription());

		dto.setAlias_id(icm_sops_alias.getAlias_id());

		dto.setName(icm_sops_alias.getName());
		
		dto.setProject_id(icm_sops_alias.getProject_id());
		
		return dto;
	}
}
