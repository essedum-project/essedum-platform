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

package com.lfn.common.app.service;

import com.lfn.common.app.web.rest.dto.FileContent;
import java.util.List;

/**
 * Interface for Git storage operations
 */
public interface GitStorageProvider {

    /**
     * Push local folder to remote Git repository
     *
     * @param localPath Local path of the folder to push
     * @param remoteUrl Remote Git repository URL
     * @param branch Branch name to push to
     * @param commitMessage Commit message
     * @param username GitHub username
     * @param token Personal Access Token
     * @param verifySsl Whether to verify SSL certificates
     * @throws Exception if push operation fails
     */
    void push(String localPath, String remoteUrl, String branch,
              String commitMessage, String username, String token, boolean verifySsl) throws Exception;

    /**
     * Push file contents directly to remote Git repository
     *
     * @param files List of files with their contents
     * @param remoteUrl Remote Git repository URL
     * @param branch Branch name to push to
     * @param commitMessage Commit message
     * @param username GitHub username
     * @param token Personal Access Token
     * @param verifySsl Whether to verify SSL certificates
     * @throws Exception if push operation fails
     */
    void pushFileContents(List<FileContent> files, String remoteUrl, String branch,
                         String commitMessage, String username, String token, boolean verifySsl) throws Exception;
}

