package com.infosys.icets.icip.icipwebeditor.service;

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.icip.icipwebeditor.model.ICIPSopsAlias;

public interface IICIPSopsAliasService {

	/**
     *  Get all the icm_sopss with search.
     *
     * @param req the req
     * @return the list of entities
     */
    PageResponse<ICIPSopsAlias> getAll(PageRequestByExample<ICIPSopsAlias> req);
}
