package com.infosys.icets.icip.icipwebeditor.rest;

import java.io.UnsupportedEncodingException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.google.gson.Gson;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.LazyLoadEvent;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.icip.icipwebeditor.model.ICIPSops;
import com.infosys.icets.icip.icipwebeditor.model.ICIPSopsAlias;
import com.infosys.icets.icip.icipwebeditor.service.IICIPSopsAliasService;
import com.infosys.icets.icip.icipwebeditor.service.IICPSopsService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Hidden;

/**
 * The Class ICIPPipelineController.
 *
 * @author icets
 */
@RestController
@Timed
@Hidden
@RequestMapping("/${icip.pathPrefix}/icip_sops")
public class ICIPsopsController {

	/** The log. */
    private final Logger log = LoggerFactory.getLogger(ICIPsopsController.class);

    /** The icm sops alias service. */
    @Autowired
    private IICIPSopsAliasService icip_sops_aliasService;
    
    /** The icm sops service. */
    @Autowired
	private IICPSopsService icipSopsService;
    
    //COMMENTED AS PART OF CODE CLEANUP
    
	/**
     * POST  /icm_sops_alias/page : get all the icm_sops_alias.
     *
     * @param example the example
     * @return the ResponseEntity with status 200 (OK) and the list of icm_sopss in body as PageResponse
     * @throws UnsupportedEncodingException the unsupported encoding exception
     * @throws JsonMappingException the json mapping exception
     * @throws JsonProcessingException the json processing exception
//     */
//    @GetMapping("/alias/page")
//    @Timed
//    public ResponseEntity<PageResponse<ICIPSopsAlias>> getAllIcmSopsAlias(@RequestHeader(value="example") String example) 
//			throws UnsupportedEncodingException, JsonMappingException, JsonProcessingException{
//        log.debug("REST request to get a page of icm-sops alias");
//        PageRequestByExample<ICIPSopsAlias> prbe= null;
//		LazyLoadEvent ldz = new LazyLoadEvent(0, 1000, null, 1);
//		Gson gson = new Gson();
//		ICIPSopsAlias is = new ICIPSopsAlias();
//		is = gson.fromJson(example, ICIPSopsAlias.class);
//		prbe = new PageRequestByExample<>();
//		prbe.setExample(is);
//		prbe.setLazyLoadEvent(ldz);
//   
//        return new ResponseEntity<>(icip_sops_aliasService.getAll(prbe), new HttpHeaders(), HttpStatus.OK);
//    }
//    /**
//	 * POST /icm-sopss/page : get all the icm_sopss.
//	 *
//	 * @param example the example
//	 * @return the ResponseEntity with status 200 (OK) and the list of icm_sopss in
//	 *         body as PageResponse
//	 */
//	@GetMapping("/page")
//	@Timed
//	public ResponseEntity<PageResponse<ICIPSops>> getAllIcmSopss(@RequestHeader(value = "example") String example) {
//		log.debug("REST request to get a page of icm-sopss");
//		PageRequestByExample<ICIPSops> prbe = null;
//		LazyLoadEvent ldz = new LazyLoadEvent(0, 1000, null, 1);
//		Gson gson = new Gson();
//		ICIPSops is = gson.fromJson(example, ICIPSops.class);
//		prbe = new PageRequestByExample<>();
//		prbe.setExample(is);
//		prbe.setLazyLoadEvent(ldz);
//		
//		return new ResponseEntity<>(icipSopsService.getAll(prbe), new HttpHeaders(), HttpStatus.OK);
//	}
}
