package com.lfn.icip.dataset.rest;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDatasetTopic;
import com.lfn.icip.dataset.model.dto.MlTopics;
import com.lfn.icip.dataset.service.ICIPDatasetTopicService;

import io.micrometer.core.annotation.Timed;

/**
 * REST controller exposing dataset-topic mapping endpoints.
 * Endpoints mirror the monolith paths under /api/aip/mldatasettopics/**.
 */
@RestController
@Timed
@RequestMapping("/${icip.pathPrefix}/mldatasettopics")
@RefreshScope
public class ICIPDatasetTopicController {

    private final Logger log = LoggerFactory.getLogger(ICIPDatasetTopicController.class);

    @Autowired
    private ICIPDatasetTopicService icipDatasetTopicService;

    /**
     * GET /api/aip/mldatasettopics/{datasetName}/{org}
     * Returns all topics linked to a given dataset for an organization.
     */
    @GetMapping("/{datasetName}/{org}")
    @Timed
    public ResponseEntity<List<ICIPDatasetTopic>> getByDatasetAndOrg(
            @PathVariable("datasetName") String datasetName,
            @PathVariable("org") String org) {
        log.debug("REST request to fetch dataset topics for dataset={} org={}", datasetName, org);
        List<ICIPDatasetTopic> result = icipDatasetTopicService.getDatasetTopicByDatasetnameandOrg(datasetName, org);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    /**
     * GET /api/aip/mldatasettopics/list/{org}
     * Returns all dataset topics for an organization.
     */
    @GetMapping("/list/{org}")
    @Timed
    public ResponseEntity<List<ICIPDatasetTopic>> getByOrg(@PathVariable("org") String org) {
        log.debug("REST request to fetch all dataset topics for org={}", org);
        List<ICIPDatasetTopic> result = icipDatasetTopicService.getDatasetTopicsByOrg(org);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    /**
     * GET /api/aip/mldatasettopics/{datasetName}/{topicName}/{org}
     */
    @GetMapping("/{datasetName}/{topicName}/{org}")
    @Timed
    public ResponseEntity<ICIPDatasetTopic> getByDatasetTopicAndOrg(
            @PathVariable("datasetName") String datasetName,
            @PathVariable("topicName") String topicName,
            @PathVariable("org") String org) {
        log.debug("REST request to fetch dataset topic dataset={} topic={} org={}", datasetName, topicName, org);
        ICIPDatasetTopic result = icipDatasetTopicService
                .getDatasetTopicByDatasetnameandTopicnamendOrg(datasetName, topicName, org);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    /**
     * POST /api/aip/mldatasettopics/addOrUpdate
     */
    @PostMapping("/addOrUpdate")
    @Timed
    public ResponseEntity<ICIPDatasetTopic> addOrUpdateTopic(@RequestBody MlTopics mlTopics) {
        log.debug("REST request to add/update dataset topic: {}", mlTopics);
        ICIPDatasetTopic result = icipDatasetTopicService.addOrUpdateTopic(mlTopics);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    /**
     * DELETE /api/aip/mldatasettopics/{id}
     */
    @DeleteMapping("/{id}")
    @Timed
    public ResponseEntity<Map<String, String>> deleteTopicById(@PathVariable("id") Integer id) {
        log.debug("REST request to delete dataset topic id={}", id);
        Map<String, String> result = icipDatasetTopicService.deleteTopicById(id);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    /**
     * POST /api/aip/mldatasettopics/datasetsByTopics/{org}
     */
    @PostMapping("/datasetsByTopics/{org}")
    @Timed
    public ResponseEntity<List<ICIPDataset>> getDatasetsByTopics(@RequestBody String[] topics,
            @PathVariable("org") String org) {
        log.debug("REST request to fetch datasets by topics for org={}", org);
        List<ICIPDataset> result = icipDatasetTopicService.getDatasetsByTopics(topics, org);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    /**
     * DELETE /api/aip/mldatasettopics/soft/{org}?topics=...
     */
    @DeleteMapping("/soft/{topics}/{org}")
    @Timed
    public ResponseEntity<String> softDeleteTopics(@PathVariable("topics") String topics,
            @PathVariable("org") String org) {
        log.debug("REST request to soft delete topics={} for org={}", topics, org);
        String result = icipDatasetTopicService.softDeleteTopics(topics, org);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}

