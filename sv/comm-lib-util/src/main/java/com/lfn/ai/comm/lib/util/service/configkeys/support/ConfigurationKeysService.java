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

package com.lfn.ai.comm.lib.util.service.configkeys.support;

import java.util.HashMap;
import java.util.Optional;

import org.springframework.stereotype.Service;

@Service
public class ConfigurationKeysService {
	// Key Map for the usm constants keys
	private static HashMap<String, String> configKeyMap;

	public String getConfigKeyValue(String key) {
		if (configKeyMap != null && !configKeyMap.isEmpty())
			return configKeyMap.get(key);
		return null;
	}

	public void setConfigKeyMap(HashMap<String, String> hmap) {
		synchronized (ConfigurationKeysService.class) {
			configKeyMap = new HashMap<>();
			configKeyMap.putAll(hmap);
		}

	}
}
