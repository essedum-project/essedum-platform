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

package com.lfn.icip.icipwebeditor.repository.mysql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.icip.icipwebeditor.model.ICIPPlugin;
import com.lfn.icip.icipwebeditor.repository.ICIPPluginRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPPluginRepositoryMYSQL.
 */
@Profile("mysql")
@Repository
public interface ICIPPluginRepositoryMYSQL extends ICIPPluginRepository {
	
	/**
	 * Fetchiai.
	 *
	 * @return the string
	 */
	@Query(value = "SELECT plugin FROM ICIPPlugin where name = 'iai'", nativeQuery = true)
	public String fetchiai();
	
	@Query(value="SELECT * FROM mlplugin WHERE id IN (SELECT MAX(id) FROM mlplugin GROUP BY NAME) "+ "AND TYPE = :type",nativeQuery = true)
	public List<ICIPPlugin> getByTypeDistinct(@Param("type") String type);
}
