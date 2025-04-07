package com.infosys.icets.icip.icipwebeditor.service;

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.icip.icipwebeditor.model.ICIPSops;

public interface IICPSopsService {

	 /**
     *  Get all the icm_sopss with search.
     *
     * @param req the req
     * @return the list of entities
     */
    PageResponse<ICIPSops> getAll(PageRequestByExample<ICIPSops> req);

}
