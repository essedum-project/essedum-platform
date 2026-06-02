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

package com.lfn.iamp.usm.web.rest;

import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Base64;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lfn.ai.comm.lib.util.HeaderUtil;
import com.lfn.ai.comm.lib.util.PaginationUtil;
import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.lfn.ai.comm.lib.util.service.dto.support.PageResponse;
import com.lfn.iamp.usm.domain.UsmPortfolio;
import com.lfn.iamp.usm.dto.UsmPortfolioDTO;
import com.lfn.iamp.usm.service.CamundaUSM;
import com.lfn.iamp.usm.service.UsmPortfolioService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Parameter;

// TODO: Auto-generated Javadoc
/**
 * REST controller for managing UsmPortfolio.
 */
/**
* @author essedum
*/
@RestController
@RequestMapping("/api")
public class UsmPortfolioResource {

    /** The log. */
    private final Logger log = LoggerFactory.getLogger(UsmPortfolioResource.class);

    /** The Constant ENTITY_NAME. */
    private static final String ENTITY_NAME = "usm_portfolio";

    /** The usm portfolio service. */
    private final UsmPortfolioService usmPortfolioService;
    
    @Autowired(required = false)
	private CamundaUSM camundaUSM;

    /**
     * Instantiates a new usm portfolio resource.
     *
     * @param usmPortfolioService the usm portfolio service
     */
    public UsmPortfolioResource(UsmPortfolioService usmPortfolioService) {
        this.usmPortfolioService = usmPortfolioService;
    }
    
    /**
     * POST  /usm-portfolios/page : get all the usm_portfolios.
     *
     * @param value the value
     * @return the ResponseEntity with status 200 (OK) and the list of usm_portfolios in body as PageResponse
     * @throws UnsupportedEncodingException the unsupported encoding exception
     * @throws JsonMappingException the json mapping exception
     * @throws JsonProcessingException the json processing exception
     */
    @GetMapping("/usm-portfolios/page")
    @Timed
    public ResponseEntity<PageResponse<UsmPortfolio>> getAllUsmPortfolios(@RequestHeader("example") String value) throws UnsupportedEncodingException, JsonMappingException, JsonProcessingException{
    	log.info("getAllUsmPortfolios: Request to get list of Portfolios");
    	ObjectMapper objectMapper = new ObjectMapper();
		String body = new String(Base64.getDecoder().decode(value), "UTF-8");
		PageRequestByExample<UsmPortfolio> prbe = objectMapper.readValue(body, new TypeReference<PageRequestByExample<UsmPortfolio>>() {
		});
    	log.info("getAllUsmPortfolios:  Fetched list of Portfolios susccessfully");
        return new ResponseEntity<>(usmPortfolioService.getAll(prbe), new HttpHeaders(), HttpStatus.OK);
    }

    /**
     * POST  /usm-portfolios : Create a new usm_portfolio.
     *
     * @param usmPortfolioDto the usm_portfolio to create
     * @return the ResponseEntity with status 201 (Created) and with body the new usm_portfolio, or with status 400 (Bad Request) if the usm_portfolio has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/usm-portfolios")
    @Timed
    public ResponseEntity<UsmPortfolio> createUsmPortfolio(@RequestBody UsmPortfolioDTO usmPortfolioDto) throws URISyntaxException {
    	log.info("createUsmPortfolio:  Request to create Portfolio Name: {}",usmPortfolioDto.getPortfolioName());
        log.debug("REST request to save UsmPortfolio : {}", usmPortfolioDto);
        if (usmPortfolioDto.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "Id exists", "A new usm_portfolio cannot already have a Id")).body(null);
        }
        UsmPortfolio usmPortfolio =  new ModelMapper().map(usmPortfolioDto, UsmPortfolio.class);        
        UsmPortfolio result = usmPortfolioService.save(usmPortfolio);
        if(camundaUSM!=null) {
        	camundaUSM.createTenant(usmPortfolioDto);
        }
        log.info("createUsmPortfolio:  created Portfolio successfully with ID: {} Name: {}", result.getId(),result.getPortfolioName());
        return ResponseEntity.created(new URI(new StringBuffer("/api/usm-portfolios/").append(result.getId()).toString()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /usm-portfolios : Updates an existing usm_portfolio.
     *
     * @param usmPortfolioDTO the usm_portfolio to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated usm_portfolio,
     * or with status 400 (Bad Request) if the usm_portfolio is not valid,
     * or with status 500 (Internal Server Error) if the usm_portfolio couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/usm-portfolios")
    @Timed
    public ResponseEntity<UsmPortfolio> updateUsmPortfolio(@RequestBody UsmPortfolioDTO usmPortfolioDTO) throws URISyntaxException {
    	log.info("updateUsmPortfolio: Request to update Portfolio for ID: {} Name: {}",usmPortfolioDTO.getId(),usmPortfolioDTO.getPortfolioName());
        log.debug("REST request to update UsmPortfolio : {}", usmPortfolioDTO);
        if (usmPortfolioDTO.getId() == null) {
            return createUsmPortfolio(usmPortfolioDTO);
        }
        
        if(camundaUSM!=null) {
        	camundaUSM.updateTenant(usmPortfolioDTO);
        }
        UsmPortfolio result = usmPortfolioService.save(new ModelMapper().map(usmPortfolioDTO,UsmPortfolio.class));
        log.info("updateUsmPortfolio: updated Portfolio sucessfully for ID:{} Name: {}",result.getId(),result.getPortfolioName());
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, usmPortfolioDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /usm-portfolios : get all the usm_portfolios.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of usm_portfolios in body
     */
    @GetMapping("/usm-portfolios")
    @Timed
    public ResponseEntity<List<UsmPortfolio>> getAllUsmPortfolios(@Parameter Pageable pageable) {
    	log.info("getAllUsmPortfolios: Request to get list of Portfolios");
        Page<UsmPortfolio> page = usmPortfolioService.findAll(pageable);
        log.info("getAllUsmPortfolios: Fetched list of Portfolios successfully");
        return new ResponseEntity<>(page.getContent(),  PaginationUtil.generatePaginationHttpHeaders(page, "/api/usm-portfolios"), HttpStatus.OK);
    }

    /**
     * GET  /usm-portfolios/:id : get the "id" usm_portfolio.
     *
     * @param id the id of the usm_portfolio to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the usm_portfolio, or with status 404 (Not Found)
     */
    @GetMapping("/usm-portfolios/{id}")
    @Timed
    public ResponseEntity<UsmPortfolio> getUsmPortfolio(@PathVariable("id") Integer id) {
    	log.info("getUsmPortfolio : Request to get Portfolio by ID: {}",id);
        UsmPortfolio usmPortfolio = usmPortfolioService.findOne(id);
        log.info("getUsmPortfolio : Fetched Portfolio successfully by ID: {} ",usmPortfolio.getId());
        return new ResponseEntity<>(usmPortfolio, new HttpHeaders(), HttpStatus.OK);
    }

    /**
     * DELETE  /usm-portfolios/:id : delete the "id" usm_portfolio.
     *
     * @param id the id of the usm_portfolio to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/usm-portfolios/{id}")
    @Timed
    public ResponseEntity<Void> deleteUsmPortfolio(@PathVariable("id") Integer id) {
    	log.info("deleteUsmPortfolio: Request to delete  Portfolio by ID: {}",id);
        if(camundaUSM!=null) {
        	camundaUSM.deleteTenant(id);
        }
        usmPortfolioService.delete(id);
        log.info("deleteUsmPortfolio: Deleted  Portfolio Successfully by ID: {}",id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
    
    /**
     * Gets the paginated usm portfolio list.
     *
     * @param pageable the pageable
     * @return the paginated usm portfolio list
     */
    @GetMapping("/usm-portfolioss/page")
	@Timed
	public ResponseEntity<PageResponse<UsmPortfolio>> getPaginatedUsmPortfolioList( @Parameter Pageable pageable) {
		log.info("Request to get a page of Portfolios  {} ", pageable);
		log.info("Request to get a page of Portfolios {}: end", pageable);
		return new ResponseEntity<>(usmPortfolioService.getPaginatedUsmPortfoliosList(pageable), new HttpHeaders(), HttpStatus.OK);
	}
    
    /**
     * Search usm portfolios.
     *
     * @param pageable the pageable
     * @param prbe the prbe
     * @return the response entity
     * @throws URISyntaxException the URI syntax exception
     */
    @PostMapping("/search/usm-portfolios/page")
	@Timed
	public ResponseEntity<?> searchUsmPortfolios(@Parameter Pageable pageable,@RequestBody PageRequestByExample<UsmPortfolio> prbe) throws  URISyntaxException  {
		log.info("searchUsmPortfolios : Request to get list of UsmPortfolios");
		log.info("searchUsmPortfolios : Fetched  list of UsmPortfolios successftully");
		return new ResponseEntity<>(usmPortfolioService.search(pageable, prbe), new HttpHeaders(), HttpStatus.OK);
		
		}
    @GetMapping("/getUsmPortfolio/{portfolioName}")
	public List<UsmPortfolio> getUsmPortfolioByName(@PathVariable String portfolioName){
    	
    	if(portfolioName == null) {
			return null;
		}
    	List<UsmPortfolio> portfolios = usmPortfolioService.findAllUsmPortfolioByName(portfolioName);
    	if(portfolios!=null && portfolios.size()>0) {
    		return portfolios;
    	}
    	return null;
	}
    
}
