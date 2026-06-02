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

package com.lfn.iamp.usm.service.impl;

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

import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.lfn.ai.comm.lib.util.service.dto.support.PageResponse;
import com.lfn.iamp.usm.domain.Context;
import com.lfn.iamp.usm.repository.ContextRepository;
import com.lfn.iamp.usm.service.ContextService;



// TODO: Auto-generated Javadoc
/**
 * Service Implementation for managing Context.
 */
/**
* @author essedum
*/
@Service
@Transactional
public class ContextServiceImpl implements ContextService{



    /** The log. */
    private final Logger log = LoggerFactory.getLogger(ContextServiceImpl.class);

    /** The context repository. */
    private final ContextRepository contextRepository;

    /**
     * Instantiates a new context service impl.
     *
     * @param contextRepository the context repository
     */
    public ContextServiceImpl(ContextRepository contextRepository) {
        this.contextRepository = contextRepository;
    }

    /**
     * Save a context.
     *
     * @param context the entity to save
     * @return the persisted entity
     */
    @Override
    public Context save(Context context) {
        log.debug("Request to save Context : {}", context);
        return contextRepository.save(context);
    }

    /**
     *  Get all the contexts.
     *
     *  @param pageable the pagination information
     *  @return the list of entities
     */
    @Override
    @Transactional(readOnly = true)
    public Page<Context> findAll(Pageable pageable) {
        log.debug("Request to get all Contexts");
        return contextRepository.findAll(pageable);
    }

    /**
     *  Get one context by id.
     *
     *  @param id the id of the entity
     *  @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public Context getOne(Integer id) {
    	log.debug("Request to get Context : {}", id);     
    	Context content = null;
     Optional<Context> value = contextRepository.findById(id);
        if (value.isPresent()) {
               content = toDTO(value.get(), 5);
        }
        return content;

    }

    /**
     *  deleteById the  context by id.
     *
     *  @param id the id of the entity
     */
    @Override
    public void deleteById(Integer id) {
        log.debug("Request to deleteById Context : {}", id);
        contextRepository.deleteById(id);
    }

     /**
      *  Get all the widget_configurations.
      *
      * @param req the req
      * @return the list of entities
      */
    @Override
    @Transactional(readOnly = true)
    public PageResponse<Context> getAll(PageRequestByExample<Context> req) {
        log.debug("Request to get all Context");
        Example<Context> example = null;
        Context context = req.getExample();

        if (context != null) {
            ExampleMatcher matcher = ExampleMatcher.matching() // example matcher for name,type,value
                    .withMatcher("name", match -> match.ignoreCase().startsWith())
                    .withMatcher("type", match -> match.ignoreCase().startsWith())
                    .withMatcher("value", match -> match.ignoreCase().startsWith());
;

            example = Example.of(context, matcher);
        }

        Page<Context> page;
        if (example != null) {
            page =  contextRepository.findAll(example, req.toPageable());
        } else {
            page =  contextRepository.findAll(req.toPageable());
        }

        return new PageResponse<>(page.getTotalPages(), page.getTotalElements(), page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
    }

    /**
     * To DTO.
     *
     * @param context the context
     * @return the context
     */
    public Context toDTO(Context context) {
        return toDTO(context, 5);
    }

    /**
     * Converts the passed context to a DTO. The depth is used to control the
     * amount of association you want. It also prevents potential infinite serialization cycles.
     *
     * @param context the context
     * @param depth the depth of the serialization. A depth equals to 0, means no x-to-one association will be serialized.
     *              A depth equals to 1 means that xToOne associations will be serialized. 2 means, xToOne associations of
     *              xToOne associations will be serialized, etc.
     * @return the context
     */
    public Context toDTO(Context context, int depth) {
        if (context == null) {
            return null;
        }

        Context dto = new Context();

            dto.setId(context.getId());
            dto.setName(context.getName());
            dto.setType(context.getType());
            dto.setValue(context.getValue());

//         if (depth-- > 0) {
//        }
        return dto;
    }


}
