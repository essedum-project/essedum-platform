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

package com.infosys.icets.iamp.usm.service.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.UsmPortfolio;
import com.infosys.icets.iamp.usm.repository.UsmPortfolioRepository;
import com.infosys.icets.iamp.usm.service.UsmPortfolioService;



// TODO: Auto-generated Javadoc
/**
 * Service Implementation for managing UsmPortfolio.
 */
/**
* @author icets
*/
@Service
@Transactional
public class UsmPortfolioServiceImpl implements UsmPortfolioService{

    

    /** The log. */
    private final Logger log = LoggerFactory.getLogger(UsmPortfolioServiceImpl.class);

    /** The usm portfolio repository. */
    private final UsmPortfolioRepository usm_portfolioRepository;

    /**
     * Instantiates a new usm portfolio service impl.
     *
     * @param usm_portfolioRepository the usm portfolio repository
     */
    public UsmPortfolioServiceImpl(UsmPortfolioRepository usm_portfolioRepository) {
        this.usm_portfolioRepository = usm_portfolioRepository;
    }

    /**
     * Save a usm_portfolio.
     *
     * @param usm_portfolio the entity to save
     * @return the persisted entity
     */
    @Override
    public UsmPortfolio save(UsmPortfolio usm_portfolio) {
        log.debug("Request to save UsmPortfolio : {}", usm_portfolio);
        return usm_portfolioRepository.save(usm_portfolio);
    }

    /**
     *  Get all the usm_portfolios.
     *
     *  @param pageable the pagination information
     *  @return the list of entities
     */
    @Override
    @Transactional(readOnly = true)
    public Page<UsmPortfolio> findAll(Pageable pageable) {
        log.debug("Request to get all UsmPortfolios");
        return usm_portfolioRepository.findAll(pageable);
    }

    /**
     *  Get one usm_portfolio by id.
     *
     *  @param id the id of the entity
     *  @return the entity
     */
	@Override
	@Transactional(readOnly = true)
	public UsmPortfolio findOne(Integer id) {
		log.debug("Request to get Project : {}", id);
		UsmPortfolio content = null;
		Optional<UsmPortfolio> value = usm_portfolioRepository.findById(id);
		if (value.isPresent()) {
			content = toDTO(value.get(), 0);
		}
		return content;

	}

    /**
     *  Delete the  usm_portfolio by id.
     *
     *  @param id the id of the entity
     */
    @Override
    public void delete(Integer id) {
        log.debug("Request to delete UsmPortfolio : {}", id);
        usm_portfolioRepository.deleteById(id);
    }

     /**
      *  Get all the widget_configurations.
      *
      * @param req the req
      * @return the list of entities
      */
    @Override
    @Transactional(readOnly = true)
    public PageResponse<UsmPortfolio> getAll(PageRequestByExample<UsmPortfolio> req) {
        log.debug("Request to get all UsmPortfolio");
        Example<UsmPortfolio> example = null;
        UsmPortfolio usm_portfolio = req.getExample();

        if (usm_portfolio != null) {
            ExampleMatcher matcher = ExampleMatcher.matching() // example matcher for portfolioName,description
                    .withMatcher("portfolioName", match -> match.ignoreCase().startsWith())
                    .withMatcher("description", match -> match.ignoreCase().startsWith())
;

            example = Example.of(usm_portfolio, matcher);
        }

        Page<UsmPortfolio> page;
        if (example != null) {
            page =  usm_portfolioRepository.findAll(example, req.toPageable());
        } else {
            page =  usm_portfolioRepository.findAll(req.toPageable());
        }

        return new PageResponse<>(page.getTotalPages(), page.getTotalElements(), page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
    }

    /**
     * To DTO.
     *
     * @param usm_portfolio the usm portfolio
     * @return the usm portfolio
     */
    public UsmPortfolio toDTO(UsmPortfolio usm_portfolio) {
        return toDTO(usm_portfolio, 0);
    }

    /**
     * Converts the passed usm_portfolio to a DTO. The depth is used to control the
     * amount of association you want. It also prevents potential infinite serialization cycles.
     *
     * @param usm_portfolio the usm portfolio
     * @param depth the depth of the serialization. A depth equals to 0, means no x-to-one association will be serialized.
     *              A depth equals to 1 means that xToOne associations will be serialized. 2 means, xToOne associations of
     *              xToOne associations will be serialized, etc.
     * @return the usm portfolio
     */
	public UsmPortfolio toDTO(UsmPortfolio usm_portfolio, int depth) {
		if (usm_portfolio == null) {
			return null;
		}

		UsmPortfolio dto = new UsmPortfolio();
		dto.setId(usm_portfolio.getId());
		dto.setPortfolioName(usm_portfolio.getPortfolioName());
		dto.setDescription(usm_portfolio.getDescription());
		dto.setLastUpdated(usm_portfolio.getLastUpdated());
		return dto;
	}

	/**
	 * Gets the paginated usm portfolios list.
	 *
	 * @param pageable the pageable
	 * @return the paginated usm portfolios list
	 */
	@Override
	public PageResponse<UsmPortfolio> getPaginatedUsmPortfoliosList(Pageable pageable) {
		log.info("Request to get a page of Portfolios from DB  {} : start",  pageable);
		Page<UsmPortfolio> page = usm_portfolioRepository.findAll(pageable);
		log.info("Request to get a page of Portfolios from DB for  {} : end",  pageable);
		return new PageResponse<>(page.getTotalPages(), page.getTotalElements(), page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
	}

	/**
	 * Search.
	 *
	 * @param pageable the pageable
	 * @param prbe the prbe
	 * @return the page response
	 */
	@Override
	public PageResponse<UsmPortfolio> search(Pageable pageable, PageRequestByExample<UsmPortfolio> prbe) {
		log.debug("Request to get all Users");
		Example<UsmPortfolio> example = null;
		UsmPortfolio usmPortfolio = prbe.getExample();
		if (usmPortfolio != null) {
			ExampleMatcher matcher = ExampleMatcher.matching() // example matcher for portfolioName,description
					.withMatcher("portfolioName", match -> match.ignoreCase().contains())
					.withMatcher("description", match -> match.ignoreCase().contains());
			example = Example.of(usmPortfolio, matcher);
		}
		Page<UsmPortfolio> page;
		if (example != null) {
			page = usm_portfolioRepository.findAll(example, pageable);
		}
		else {
			page = usm_portfolioRepository.findAll(pageable);
		}
		return new PageResponse<>(page.getTotalPages(), page.getTotalElements(), page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
	}
	
	@Override
	public List<UsmPortfolio> findAllUsmPortfolioByName(String portfolioName){
		UsmPortfolio usmPortfolio=new UsmPortfolio();
		usmPortfolio.setPortfolioName(portfolioName);
		return usm_portfolioRepository.findAll(Example.of(usmPortfolio));
	}
	
	@Override
	public UsmPortfolio findUsmPortfolioByName(String portfolioName){
		UsmPortfolio usmPortfolio=new UsmPortfolio();
		usmPortfolio.setPortfolioName(portfolioName);
		return usm_portfolioRepository.findOne(Example.of(usmPortfolio)).orElse(null);
	}
	
    
}