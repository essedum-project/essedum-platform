package com.lfn.icip.vibecoding.repository;

import com.lfn.icip.vibecoding.model.VibeGitHubConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VibeGitHubConfigRepository extends JpaRepository<VibeGitHubConfig, Long> {

    Optional<VibeGitHubConfig> findBySessionIdAndOrg(String sessionId, String org);

    List<VibeGitHubConfig> findByOrg(String org);

    List<VibeGitHubConfig> findBySessionId(String sessionId);

    boolean existsBySessionIdAndOrg(String sessionId, String org);
}

