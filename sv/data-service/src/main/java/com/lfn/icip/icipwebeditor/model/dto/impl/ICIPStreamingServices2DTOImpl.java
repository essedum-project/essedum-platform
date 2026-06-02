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

package com.lfn.icip.icipwebeditor.model.dto.impl;

import com.lfn.icip.icipwebeditor.model.dto.ICIPStreamingServices2DTO;

import java.sql.Timestamp;
import java.util.Map;

/**
 * Implementation of ICIPStreamingServices2DTO for deserializing JSON data.
 * This class wraps a Map containing the parsed JSON data and implements
 * the ICIPStreamingServices2DTO interface methods.
 *
 * @author essedum
 */
public class ICIPStreamingServices2DTOImpl implements ICIPStreamingServices2DTO {

    /** The data map containing parsed JSON fields. */
    private final Map<String, Object> data;

    /**
     * Instantiates a new ICIP streaming services 2 DTO impl.
     *
     * @param data the data map containing JSON fields
     */
    public ICIPStreamingServices2DTOImpl(Map<String, Object> data) {
        this.data = data;
    }

    @Override
    public Integer getCid() {
        Object cid = data.get("cid");
        if (cid instanceof Number) {
            return ((Number) cid).intValue();
        }
        return null;
    }

    @Override
    public String getName() {
        return (String) data.get("name");
    }

    @Override
    public String getAlias() {
        return (String) data.get("alias");
    }

    @Override
    public String getDescription() {
        Object desc = data.get("description");
        return desc != null ? desc.toString() : null;
    }

    @Override
    public boolean getDeleted() {
        Object deleted = data.get("deleted");
        if (deleted instanceof Boolean) {
            return (Boolean) deleted;
        }
        return false;
    }

    @Override
    public String getType() {
        return (String) data.get("type");
    }

    @Override
    public String getInterfacetype() {
        return (String) data.get("interfacetype");
    }

    @Override
    public String getOrganization() {
        return (String) data.get("organization");
    }

    @Override
    public Timestamp getCreatedDate() {
        Object createdDate = data.get("createdDate");
        if (createdDate instanceof Long) {
            return new Timestamp((Long) createdDate);
        } else if (createdDate instanceof String) {
            try {
                // Try parsing as timestamp string
                return Timestamp.valueOf((String) createdDate);
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }
}

