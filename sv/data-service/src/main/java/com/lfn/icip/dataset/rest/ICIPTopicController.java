package com.lfn.icip.dataset.rest;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lfn.icip.dataset.model.ICIPTopic;
import com.lfn.icip.dataset.repository.ICIPTopicRepository;

import io.micrometer.core.annotation.Timed;

/**
 * REST controller exposing ICIPTopic (ML topics) endpoints.
 * Endpoints mirror the monolith paths under /api/aip/mltopics/**.
 */
@RestController
@Timed
@RequestMapping("/${icip.pathPrefix}/mltopics")
@RefreshScope
public class ICIPTopicController {

    private final Logger log = LoggerFactory.getLogger(ICIPTopicController.class);

    @Autowired
    private ICIPTopicRepository iCIPTopicRepository;

    /**
     * GET /api/aip/mltopics/list/activeMltopicsByOrg/{org}
     * Returns active ML topics for a given organization.
     */
    @GetMapping("/list/activeMltopicsByOrg/{org}")
    @Timed
    public ResponseEntity<List<ICIPTopic>> activeMltopicsByOrg(@PathVariable("org") String org) {
        log.debug("REST request to fetch active ML topics for org : {}", org);
        List<ICIPTopic> result = iCIPTopicRepository.activeMltopicsByOrg(org);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    /**
     * GET /api/aip/mltopics/list/{org}
     * Returns all ML topics for a given organization.
     */
    @GetMapping("/list/{org}")
    @Timed
    public ResponseEntity<List<ICIPTopic>> findByOrganization(@PathVariable("org") String org) {
        log.debug("REST request to fetch ML topics for org : {}", org);
        List<ICIPTopic> result = iCIPTopicRepository.findByOrganization(org);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}

