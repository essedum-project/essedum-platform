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

import java.sql.SQLException;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.CountryTimeZone;
import com.infosys.icets.iamp.usm.repository.CountryTimeZoneRepository;
import com.infosys.icets.iamp.usm.service.CountryTimeZoneService;
import com.infosys.icets.iamp.usm.service.ProjectService;

@Service
@Transactional
public class CountryTimeZoneServiceImpl implements CountryTimeZoneService {
	
	private final Logger log = LoggerFactory.getLogger(CountryTimeZoneServiceImpl.class);
	
	@Autowired
	private CountryTimeZoneRepository countryTimeZoneRepository;
	
	@Autowired
	private ProjectService projectService;

	@Override
	public CountryTimeZone save(CountryTimeZone countryTimeZone) throws SQLException {
		log.debug("Request to save CountryTimeZone : {}", countryTimeZone);
		return countryTimeZoneRepository.save(countryTimeZone);
	}

	@Override
	@Transactional(readOnly = true)
	public Page<CountryTimeZone> findAll(Pageable pageable) throws SQLException {
		log.debug("Request to get all CountryTimeZones");
		return countryTimeZoneRepository.findAll(pageable);
	}

	@Override
	public CountryTimeZone findOne(Integer id) throws SQLException {
		log.debug("Request to get CountryTimeZone : {}", id);
		CountryTimeZone content = null;
		Optional<CountryTimeZone> value = countryTimeZoneRepository.findById(id);
	    if (value.isPresent()) {
	    	content = toDTO(value.get(), 1);
	    }
	    return content;
	}

	@Override
	public void delete(Integer id) throws SQLException {
		log.debug("Request to delete CountryTimeZone : {}", id);
		countryTimeZoneRepository.deleteById(id);
	}

	@Override
	public PageResponse<CountryTimeZone> getAll(PageRequestByExample<CountryTimeZone> req) throws SQLException {
		log.debug("Request to get all CountryTimeZone");
        Example<CountryTimeZone> example = null;
        CountryTimeZone countryTimeZone = req.getExample();

        if (countryTimeZone != null) {
            ExampleMatcher matcher = ExampleMatcher.matching() // example matcher for name,description,filename
                    .withMatcher("AlternateUser", match -> match.ignoreCase().startsWith())
                    .withMatcher("LoginId", match -> match.ignoreCase().startsWith())
                    .withMatcher("Comments", match -> match.ignoreCase().startsWith());

            example = Example.of(countryTimeZone, matcher);
        }

        Page<CountryTimeZone> page;
        if (example != null) {
            page =  countryTimeZoneRepository.findAll(example, req.toPageable());
        } else {
            page =  countryTimeZoneRepository.findAll(req.toPageable());
        }
         return new PageResponse<>(page.getTotalPages(), page.getTotalElements(), page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
	}

	public CountryTimeZone toDTO(CountryTimeZone countryTimeZone) {
        return toDTO(countryTimeZone, 1);
    }
	
	@Override
	public CountryTimeZone toDTO(CountryTimeZone countryTimeZone, int depth) {
		if (countryTimeZone == null) {
            return null;
        }

		CountryTimeZone dto = new CountryTimeZone();
		dto.setId(countryTimeZone.getId());
		dto.setCountry(countryTimeZone.getCountry());
		dto.setTz_name(countryTimeZone.getTz_name());
		dto.setCountry_code(countryTimeZone.getCountry_code());
		dto.setRegional_settings(countryTimeZone.getRegional_settings());
		dto.setIs_active(countryTimeZone.getIs_active());
		dto.setProject_id(projectService.toDTO(countryTimeZone.getProject_id(), depth));
		
		return dto;
	}

	
}
