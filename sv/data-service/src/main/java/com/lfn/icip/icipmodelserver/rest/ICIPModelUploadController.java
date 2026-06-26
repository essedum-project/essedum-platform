/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 */

package com.lfn.icip.icipmodelserver.rest;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.service.IICIPDatasourceService;
import com.lfn.icip.dataset.service.impl.ICIPDatasetPluginsService;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedModel;

import io.micrometer.core.annotation.Timed;

/**
 * Handles model file upload / test-connection for S3/MinIO datasources.
 * Runs in data-service so it has access to the temp file written by
 * /fileserver/uploadTemp (which also runs in data-service).
 */
@RestController
@Timed
@RefreshScope
@RequestMapping("/${icip.pathPrefix}/service/v1")
public class ICIPModelUploadController {

    private static final Logger logger = LoggerFactory.getLogger(ICIPModelUploadController.class);

    @Autowired
    private IICIPDatasourceService datasourceService;

    @Autowired
    private ICIPDatasetPluginsService pluginService;

    @PostMapping(path = "models/upload")
    public ResponseEntity<?> uploadModel(@RequestBody ICIPMLFederatedModel requestBody,
            @RequestParam(required = false, name = "fileUploaded") String fileUploaded) {
        try {
            ICIPDataset datasetForModel = new ICIPDataset();
            ICIPDatasource datasource = datasourceService.getDatasource(
                    requestBody.getDatasource(), requestBody.getOrganisation());
            datasetForModel.setDatasource(datasource);
            datasetForModel.setOrganization(requestBody.getOrganisation());
            datasetForModel.setAttributes(requestBody.getAttributes());

            Boolean fileAttached = false;
            List<Object> data = new ArrayList<>();
            if (fileUploaded != null && !fileUploaded.isBlank()) {
                try {
                    data = pluginService.getS3FileData(datasetForModel, fileUploaded);
                    fileAttached = true;
                } catch (Exception exc) {
                    logger.info("File not yet in storage, will attempt upload via testConnection: {}", fileUploaded);
                }
            }

            if (!fileAttached || data.get(0) == null) {
                Boolean testSuccess = false;
                try {
                    testSuccess = pluginService.getDataSetService(datasetForModel).testConnection(datasetForModel);
                } catch (Exception e) {
                    logger.error("testConnection failed: {}", e.getMessage());
                    return new ResponseEntity<>("FAILED", HttpStatus.INTERNAL_SERVER_ERROR);
                }
                if (testSuccess)
                    return new ResponseEntity<>("SUCCESS", new HttpHeaders(), HttpStatus.OK);
                else
                    return new ResponseEntity<>("FAILED", HttpStatus.INTERNAL_SERVER_ERROR);
            } else {
                return new ResponseEntity<>(
                        "Model already present in the specified path, Please upload a different file",
                        HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("EXCEPTION in uploadModel:", e);
            return new ResponseEntity<>("Request failed", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
