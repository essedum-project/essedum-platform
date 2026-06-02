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
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for Create Pull Request Response
 * Contains information about the created pull request and any potential conflicts
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePullRequestResponse {

    /**
     * Whether the pull request was created successfully
     */
    private boolean success;

    /**
     * Response message
     */
    private String message;

    /**
     * Repository name
     */
    private String repoName;

    /**
     * Source branch (head)
     */
    private String sourceBranch;

    /**
     * Target branch (base)
     */
    private String targetBranch;

    /**
     * Pull request number
     */
    private Integer pullRequestNumber;

    /**
     * Pull request URL
     */
    private String pullRequestUrl;

    /**
     * Whether there are merge conflicts
     */
    private boolean hasMergeConflicts;

    /**
     * List of files with conflicts (if any)
     */
    private List<String> conflictingFiles;

    /**
     * Whether the PR is mergeable
     */
    private Boolean mergeable;

    /**
     * Merge status message
     */
    private String mergeableState;

    /**
     * List of reviewers that were requested
     */
    private List<String> reviewersRequested;

    /**
     * Additional details or error information
     */
    private String details;
}

