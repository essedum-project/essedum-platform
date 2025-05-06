package com.infosys.icets.ai.comm.lib.util.service.impl;

import java.security.KeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

import javax.management.openmbean.KeyAlreadyExistsException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.infosys.icets.ai.comm.lib.util.dto.ResolvedSecret;
import com.infosys.icets.ai.comm.lib.util.dto.Secret;
import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.ai.comm.lib.util.service.ApplicationSecretManagerService;
import com.infosys.icets.iamp.usm.domain.Project;
import com.infosys.icets.iamp.usm.domain.UsmSecret;
import com.infosys.icets.iamp.usm.repository.SecretsManagerRepository;
import com.infosys.icets.iamp.usm.service.ProjectService;

@Service
public class ApplicationSecretManagerServiceImpl implements ApplicationSecretManagerService {

	@Autowired
	private SecretsManagerRepository smRepository;
	@Autowired
	private ProjectService projectService;

	@Value("${encryption.key}")
	String key;
	
    Logger logger=LoggerFactory.getLogger(ApplicationSecretManagerService.class);

	@Override
	public ResolvedSecret resolveSecret(Secret secret) throws KeyException {
		Project project = projectService.findByName(secret.getOrganization());
		Optional<UsmSecret> data = Optional.ofNullable(smRepository.findByKeyAndProjectId(secret.getKey(), project));
		if (data.isPresent()) {
			UsmSecret usmSecret = data.get();
			String salt = usmSecret.getSalt();
			String decryptedPasword = EncryptionService.decrypt(usmSecret.getValue(), key, salt);
			ResolvedSecret resolvedSecret = new ResolvedSecret();
			resolvedSecret.setResolvedSecret(decryptedPasword);
			resolvedSecret.setIsResolved(true);
			resolvedSecret.setKey(secret.getKey());
			resolvedSecret.setOrganization(project.getName());
			return resolvedSecret;
		} else {
			throw new KeyException("Key not found");
		}

	}

	@Override
	public String addSecret(Secret secret) throws KeyAlreadyExistsException, LeapException {
		if (!checkIfKeyExists(secret)) {
			try {
				Project project = projectService.findByName(secret.getOrganization());
				UsmSecret secretModel = new UsmSecret();
				String value = secret.getValue();
				if(value.contains("&amp;")) {
					value = value.replace("&amp;", "&");
					secret.setValue(value);
				}
				secretModel.setKey(secret.getKey());
				byte[] salt = generateSalt();
				secretModel.setSalt(Base64.getEncoder().encodeToString(salt));
				secretModel.setValue(secret.getValue());
				String[] enc = EncryptionService.encryptwithsalt(secret.getValue(), key, salt);
				String encryptedvalue = enc[0];
				secretModel.setValue(encryptedvalue);
				secretModel.setProjectId(project);
				smRepository.save(secretModel);
				return "Added Successfully";
			} catch (NoSuchAlgorithmException e) {
				throw new LeapException("Error while salt generation");
			}

		} else {
			throw new KeyAlreadyExistsException("Key with same name already exists");
		}

	}

	@Override
	public String updateSecret(Secret secret) throws KeyException {
		Project project = projectService.findByName(secret.getOrganization());
		Optional<UsmSecret> data = Optional.ofNullable(smRepository.findByKeyAndProjectId(secret.getKey(), project));
		if (data.isPresent()) {
			String value = secret.getValue();
			if(value.contains("&amp;")) {
				value = value.replace("&amp;", "&");
				secret.setValue(value);
			}
			UsmSecret usmSecret = data.get();
			String salt = usmSecret.getSalt();
			byte[] saltBytes = Base64.getDecoder().decode(salt);
			String[] enc = EncryptionService.encryptwithsalt(secret.getValue(), key, saltBytes);
			String encryptedValue = enc[0];
			usmSecret.setValue(encryptedValue);
			smRepository.save(usmSecret);
			return "Success";
		} else {
			throw new KeyException("Key not found");
		}
	}

	@Override
	public String deleteSecret(Secret secret) throws KeyException {

		Project project = projectService.findByName(secret.getOrganization());
		Optional<UsmSecret> data = Optional.ofNullable(smRepository.findByKeyAndProjectId(secret.getKey(), project));
		if (data.isPresent()) {
			smRepository.delete(data.get());
			return "Success";
		} else {
			throw new KeyException("Key not found");
		}

	}

	private byte[] generateSalt() throws NoSuchAlgorithmException {
		byte[] salt = new byte[64];
		SecureRandom random = SecureRandom.getInstanceStrong();
		random.nextBytes(salt);
		return salt;
	}

	private Boolean checkIfKeyExists(Secret secret) {
		Project project = projectService.findByName(secret.getOrganization());
		Optional<UsmSecret> data = Optional.ofNullable(smRepository.findByKeyAndProjectId(secret.getKey(), project));
		return data.isPresent() ? true : false;
	}

	@Override
	public List<Secret> listSecret(Secret secret) {
		Project project = projectService.findByName(secret.getOrganization());
		List<UsmSecret> usmSecretList = smRepository.findAllByProjectId( project,secret.getPageable());
		List<Secret> secretList= new ArrayList();
		usmSecretList.forEach(x->{
			Secret localSecret= new Secret();
			localSecret.setKey(x.getKey());
			localSecret.setId(x.getId());
			localSecret.setOrganization(x.getProjectId().getName());
			secretList.add(localSecret);

		});
		
		
		return secretList;
	}

	@Override
	public Long getSecreteCount(Secret secret) {
		Project project = projectService.findByName(secret.getOrganization());

		Long count = smRepository.countByProject(project.getId());

		return count;
	}
}