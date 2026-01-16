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

package com.lfn.icip.icipwebeditor.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * The Class AgentSearchQueryDTO.
 * Represents a single search query with type, key, and value.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AgentSearchQueryDTO {

    /**
     * The type of the query (SKILL, LOCATOR, DOMAIN, MODULE).
     */
    @JsonProperty("type")
    private String type;

    /**
     * The key field interpretation varies by type:
     * - SKILL: Not used (searches on "name" by default)
     * - MODULE: Not used (searches on "name" by default)
     * - DOMAIN: The domain name to match (e.g., "domain", "research")
     * - LOCATOR: The locator type to match (e.g., "source-code", "docker-image")
     *
     * This field is excluded from JSON response when null.
     */
    @JsonProperty("key")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String key;

    /**
     * The value field interpretation varies by type:
     * - SKILL: The skill name to match (hierarchical prefix matching)
     * - MODULE: The module name to match (hierarchical prefix matching)
     * - DOMAIN: The domain description to match (hierarchical prefix matching)
     * - LOCATOR: The locator URL to match (exact matching)
     */
    @JsonProperty("value")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String value;
}

