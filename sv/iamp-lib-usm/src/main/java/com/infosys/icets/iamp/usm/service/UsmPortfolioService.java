/**
 * @ 2023 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.iamp.usm.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.UsmPortfolio;

// TODO: Auto-generated Javadoc
/**
 * Service Interface for managing UsmPortfolio.
 */
/**
* @author icets
*/
public interface UsmPortfolioService {

    /**
     * Save a usm_portfolio.
     *
     * @param usm_portfolio the entity to save
     * @return the persisted entity
     */
    UsmPortfolio save(UsmPortfolio usm_portfolio);

    /**
     *  Get all the usm_portfolios.
     *
     *  @param pageable the pagination information
     *  @return the list of entities
     */
    Page<UsmPortfolio> findAll(Pageable pageable);

    /**
     *  Get the "id" usm_portfolio.
     *
     *  @param id the id of the entity
     *  @return the entity
     */
    UsmPortfolio findOne(Integer id);

    /**
     *  Delete the "id" usm_portfolio.
     *
     *  @param id the id of the entity
     */
    void delete(Integer id);


    /**
     *  Get all the usm_portfolios with search.
     *
     * @param req the req
     * @return the list of entities
     */
    PageResponse<UsmPortfolio> getAll(PageRequestByExample<UsmPortfolio> req);

    /**
     * To DTO.
     *
     * @param usm_portfolio the usm portfolio
     * @param depth the depth
     * @return the usm portfolio
     */
    public UsmPortfolio toDTO(UsmPortfolio usm_portfolio, int depth);

	/**
	 * Gets the paginated usm portfolios list.
	 *
	 * @param pageable the pageable
	 * @return the paginated usm portfolios list
	 */
	PageResponse<UsmPortfolio> getPaginatedUsmPortfoliosList(Pageable pageable);

	/**
	 * Search.
	 *
	 * @param pageable the pageable
	 * @param prbe the prbe
	 * @return the page response
	 */
	PageResponse<UsmPortfolio> search(Pageable pageable, PageRequestByExample<UsmPortfolio> prbe);
    
	public List<UsmPortfolio> findAllUsmPortfolioByName(String portfolioName);
	
	public UsmPortfolio findUsmPortfolioByName(String portfolioName);
}
