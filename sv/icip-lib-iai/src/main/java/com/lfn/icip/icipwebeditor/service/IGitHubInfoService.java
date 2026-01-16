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

package com.lfn.icip.icipwebeditor.service;

import com.lfn.icip.icipwebeditor.model.dto.GitHubInfoDTO;

/**
 * The Interface IGitHubInfoService.
 * Service interface for managing GitHub repository information.
 */
public interface IGitHubInfoService {

    /**
     * Save GitHub info.
     * Creates a new GitHub info record.
     *
     * @param gitHubInfoDTO the GitHub info DTO
     * @return the saved GitHub info DTO
     */
    GitHubInfoDTO saveGitHubInfo(GitHubInfoDTO gitHubInfoDTO);

    /**
     * Update GitHub info by cname and org.
     * Updates an existing GitHub info record identified by cname and org.
     *
     * @param cname the repository/component name
     * @param org the organization name
     * @param gitHubInfoDTO the GitHub info DTO with updated data
     * @return the updated GitHub info DTO
     */
    GitHubInfoDTO updateGitHubInfo(String cname, String org, GitHubInfoDTO gitHubInfoDTO);

    /**
     * Get GitHub info by cname and org.
     *
     * @param cname the repository/component name
     * @param org the organization name
     * @return the GitHub info DTO
     */
    GitHubInfoDTO getGitHubInfo(String cname, String org);

    /**
     * Save or update GitHub info.
     * If a GitHub info exists with the given cname and org, updates it.
     * Otherwise, creates a new GitHub info.
     *
     * @param gitHubInfoDTO the GitHub info DTO
     * @return the saved or updated GitHub info DTO
     */
    GitHubInfoDTO saveOrUpdateGitHubInfo(GitHubInfoDTO gitHubInfoDTO);

    /**
     * Delete GitHub info by id.
     *
     * @param id the GitHub info id
     */
    void deleteGitHubInfo(Long id);
}

