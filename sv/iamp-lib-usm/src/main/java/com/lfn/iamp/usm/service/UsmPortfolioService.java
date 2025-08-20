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

package com.lfn.iamp.usm.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.lfn.ai.comm.lib.util.service.dto.support.PageResponse;
import com.lfn.iamp.usm.domain.UsmPortfolio;

// TODO: Auto-generated Javadoc
/**
 * Service Interface for managing UsmPortfolio.
 */
/**
* @author essedum
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
