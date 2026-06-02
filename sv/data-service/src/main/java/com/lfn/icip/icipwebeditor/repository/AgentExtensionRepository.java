/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package com.lfn.icip.icipwebeditor.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lfn.icip.icipwebeditor.model.AgentExtension;

/**
 * The Interface AgentExtensionRepository.
 */
@Repository
public interface AgentExtensionRepository extends JpaRepository<AgentExtension, Long> {

    /**
     * Find by agent cid.
     *
     * @param agentCid the agent cid
     * @return the list
     */
    List<AgentExtension> findByAgentCid(Long agentCid);

    /**
     * Find by ext key.
     *
     * @param extKey the ext key
     * @return the list
     */
    List<AgentExtension> findByExtKey(String extKey);

    /**
     * Find by agent cid and ext key.
     *
     * @param agentCid the agent cid
     * @param extKey the ext key
     * @return the optional
     */
    Optional<AgentExtension> findByAgentCidAndExtKey(Long agentCid, String extKey);
}

