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

package com.lfn.common.app.web.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for Create Pull Request
 * Used to create a pull request to merge code from source branch to target branch
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePullRequestRequest {

    /**
     * Repository name in format "owner/repo"
     */
    private String repoName;

    /**
     * Title of the pull request
     */
    private String title;

    /**
     * Description/body of the pull request
     */
    private String body;

    /**
     * Source branch (head) - the branch with changes
     */
    private String sourceBranch;

    /**
     * Target branch (base) - the branch to merge into
     */
    private String targetBranch;

    /**
     * Optional: List of reviewer usernames
     */
    private List<String> reviewers;

    /**
     * Optional: Whether to create draft pull request
     * Default: false
     */
    private boolean draft = false;

    /**
     * Optional: Whether to check for merge conflicts before creating PR
     * Default: true
     */
    private boolean checkMergeConflicts = true;
}

