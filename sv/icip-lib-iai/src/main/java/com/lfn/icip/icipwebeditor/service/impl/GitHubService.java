package com.lfn.icip.icipwebeditor.service.impl;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.sql.Blob;
import java.sql.SQLException;
import java.text.MessageFormat;
import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.PullCommand;
import org.eclipse.jgit.api.PullResult;
import org.eclipse.jgit.api.PushCommand;
import org.eclipse.jgit.api.errors.CanceledException;
import org.eclipse.jgit.api.errors.DetachedHeadException;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.InvalidConfigurationException;
import org.eclipse.jgit.api.errors.InvalidRemoteException;
import org.eclipse.jgit.api.errors.NoHeadException;
import org.eclipse.jgit.api.errors.RefNotFoundException;
import org.eclipse.jgit.api.errors.TransportException;
import org.eclipse.jgit.api.errors.WrongRepositoryStateException;
import org.eclipse.jgit.errors.AmbiguousObjectException;
import org.eclipse.jgit.errors.IncorrectObjectTypeException;
import org.eclipse.jgit.errors.RevisionSyntaxException;
import org.eclipse.jgit.internal.JGitText;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.lib.StoredConfig;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;
import org.eclipse.jgit.transport.URIish;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.stereotype.Service;
import com.amazonaws.ClientConfiguration;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.http.conn.ssl.SdkTLSSocketFactory;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.ai.comm.lib.util.annotation.service.ConstantsService;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.service.IICIPDatasourceService;
import com.lfn.icip.dataset.service.impl.ICIPDatasetService;

@Service
@RefreshScope
public class GitHubService {

	@Value("${github.gitPathStudio}")
	private String gitPath;

	@Value("${github.gitPathStore}")
	private String gitPathStore;

	@Value("${github.username}")
	private String username;

	@Value("${github.password}")
	private String password;

	@Value("${proxy.httpProxyConfiguration.proxyHost}")
	String proxyHost;

	@Value("${proxy.httpProxyConfiguration.proxyPort}")
	String proxyPort;
	
	/** The folder path. */
	@EssedumProperty("icip.fileuploadDir")
	private String folderPath;

	@Autowired
	private ConstantsService constantsService;
	
	/** The i ICIP dataset service. */
	@Autowired
	private ICIPDatasetService datasetService;
	
	/** The i ICIP datasource service. */
	@Autowired
	private IICIPDatasourceService datasourceService;

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(GitHubService.class);

	public Git getGitHubRepository(String org)
			throws InvalidRemoteException, TransportException, GitAPIException, IOException {

		String url = constantsService.getByKeys("icip.git.repo.studio.url", org).getValue();

		String repoName = url.split("/")[url.split("/").length - 1].split("[.]")[0];

		Git git;

		File gitFile = new File(gitPath + repoName + "/.git");
		if (!gitFile.exists()) {
			Files.createDirectories(Paths.get(gitPath + repoName));
		}

		if (!gitFile.exists()) {
			File gitRepoPath = new File(gitPath + repoName);
			git = Git.init().setDirectory(gitRepoPath).call();
			StoredConfig config = git.getRepository().getConfig();

			config.setBoolean("http", null, "sslVerify", false);
			config.save();

			URIish u = createURIish(url);
			git.remoteAdd().setName("origin").setUri(u).call();

			PullResult response = git.pull()
					.setCredentialsProvider(new UsernamePasswordCredentialsProvider(username, password))
					.setRemote("origin").setRemoteBranchName("master").call();

			git.lsRemote().setCredentialsProvider(new UsernamePasswordCredentialsProvider(username, password))
					.setHeads(true).call();
			git.checkout().setName("master").call();

		} else {

			FileRepositoryBuilder builder = new FileRepositoryBuilder();
			Repository repository = builder.setGitDir(new File(gitPath + repoName + "/.git")).readEnvironment() // scan
																												// environment
																												// GIT_*
																												// variables
					.findGitDir() // scan up the file system tree
					.build();

			log.info("Having repository: " + repository.getDirectory());

			git = new Git(repository);

		}
		StoredConfig config = git.getRepository().getConfig();
		config.setBoolean("http", null, "sslVerify", false);
		config.save();

		return git;

	}

	public Git getGitStoreRepo(String org)
			throws InvalidRemoteException, TransportException, GitAPIException, IOException {

		String url = constantsService.getByKeys("icip.git.repo.store.url", org).getValue();

		String repoName = url.split("/")[url.split("/").length - 1].split("[.]")[0];

		Git git;

		File gitFile = new File(gitPathStore + repoName + "/.git");
		if (!gitFile.exists()) {
			Files.createDirectories(Paths.get(gitPathStore + repoName));
		}

		if (!gitFile.exists()) {
			File gitRepoPath = new File(gitPathStore + repoName);
			git = Git.init().setDirectory(gitRepoPath).call();
			StoredConfig config = git.getRepository().getConfig();

			config.setBoolean("http", null, "sslVerify", false);
			config.save();

			URIish u = createURIish(url);
			git.remoteAdd().setName("origin").setUri(u).call();

			PullResult response = git.pull()
					.setCredentialsProvider(new UsernamePasswordCredentialsProvider(username, password))
					.setRemote("origin").setRemoteBranchName("master").call();

			git.lsRemote().setCredentialsProvider(new UsernamePasswordCredentialsProvider(username, password))
					.setHeads(true).call();
			git.checkout().setName("master").call();

		} else {

			FileRepositoryBuilder builder = new FileRepositoryBuilder();
			Repository repository = builder.setGitDir(new File(gitPathStore + repoName + "/.git")).readEnvironment() // scan
					// environment
					// GIT_*
					// variables
					.findGitDir() // scan up the file system tree
					.build();

			log.info("Having repository: " + repository.getDirectory());

			git = new Git(repository);

		}
		StoredConfig config = git.getRepository().getConfig();
		config.setBoolean("http", null, "sslVerify", false);
		config.save();

		return git;

	}

	public Boolean pull(Git git)
			throws WrongRepositoryStateException, InvalidConfigurationException, DetachedHeadException,
			InvalidRemoteException, CanceledException, RefNotFoundException, NoHeadException, GitAPIException,
			RevisionSyntaxException, AmbiguousObjectException, IncorrectObjectTypeException, IOException {

		Repository repo = git.getRepository();
		if (repo.resolve("HEAD") == null) {

			return true;
		}
		StoredConfig config = git.getRepository().getConfig();
		config.setBoolean("http", null, "sslVerify", false);
		config.save();

		PullCommand pullCommand = git.pull();
		pullCommand.setRemote("origin");

		pullCommand.setCredentialsProvider(new UsernamePasswordCredentialsProvider(username, password));
		PullResult result = null;
		try {

			result = pullCommand.call();
			log.info("Repository pulled successfullly from GitHub");
		} catch (TransportException e) {
			log.error("Error pulling from repository on GitHub" + e.getMessage());
		}
		if (result != null)
			return true;
		else
			return false;
	}

	public void updateFileInLocalRepo(Blob blob, String pipelineName, String org, String filename)
			throws IOException, SQLException {

		String url = constantsService.getByKeys("icip.git.repo.studio.url", org).getValue();

		String repoName = url.split("/")[url.split("/").length - 1].split("[.]")[0];

		File pythonFile = new File(gitPath + repoName + "/" + pipelineName + "/" + filename);

		if (!pythonFile.exists()) {
			Files.createDirectories(Paths.get(gitPath + repoName + "/" + pipelineName));
		}

		if (!pythonFile.exists())
			pythonFile.createNewFile();

		try (OutputStream os = new FileOutputStream(pythonFile)) {

			os.write(blob.getBytes(1, (int) blob.length()));

		}

	}

	public void push(Git git, String message) throws InvalidRemoteException, GitAPIException, IOException {

		StoredConfig config = git.getRepository().getConfig();
		config.setBoolean("http", null, "sslVerify", false);
		config.save();

		git.add().addFilepattern(".").call();
		git.commit().setMessage(message).call();

		PushCommand pushCommand = git.push();
		pushCommand.setRemote("origin");

		pushCommand.setCredentialsProvider(new UsernamePasswordCredentialsProvider(username, password));
		pushCommand.setForce(true);
		try {
			pushCommand.setPushAll();
			pushCommand.call();
			log.info("Repository created successfullly on GitHub");
		} catch (TransportException e) {
			log.error("Error creating repository on GitHub" + e.getMessage());
		}
	}

	public String fetchFileFromLocalRepo(String pipelineName, String org)
			throws IOException, SQLException, InvalidRemoteException, TransportException, GitAPIException {
		getGitHubRepository(org);

		String url = constantsService.getByKeys("icip.git.repo.studio.url", org).getValue();

		String repoName = url.split("/")[url.split("/").length - 1].split("[.]")[0];

		String pythonFile = null;
		File scriptPath = new File(gitPath + "/" + repoName + "/" + pipelineName);
		if (!scriptPath.exists())
			return null;
		File[] files = scriptPath.listFiles();
		pythonFile = null;
		for (File file : files) {
			if (FilenameUtils.getExtension(file.getName()).equals("py")) {
				pythonFile = file.getAbsolutePath().toString();
			}
		}

		return pythonFile;

	}

	public void deleteFileFromLocalRepo(Git git, String pipelineName,String org) throws IOException, SQLException {

		StoredConfig config = git.getRepository().getConfig();
		config.setBoolean("http", null, "sslVerify", false);
		config.save();
		String url = constantsService.getByKeys("icip.git.repo.store.url", org).getValue();

		String repoName = url.split("/")[url.split("/").length - 1].split("[.]")[0];



		try {
			File scriptPath = new File(gitPath + "/" + repoName + "/" + pipelineName);
             if(scriptPath.exists()) {
			File[] files = scriptPath.listFiles();
			for (File file : files) {

				git.rm().addFilepattern(pipelineName + "/" + file.getName()).call();
			}

			scriptPath.delete();}
			log.info("Deleting pipeline script from local repo : {}", pipelineName);
		} catch (GitAPIException e) {
			log.error("Error in deleting pipeline script from local repo : {}", e.getMessage());
		}

	}

	private URIish createURIish(String url) throws InvalidRemoteException {
		URIish u = null;
		try {
			u = new URIish(url);
		} catch (URISyntaxException e) {
			throw new InvalidRemoteException(MessageFormat.format(JGitText.get().invalidURL, url), e);
		}
		return u;
	}

	public String publishPipeline(String pipelineName, String org, String type)
			throws IOException, InvalidRemoteException, TransportException, GitAPIException {
		Git git = getGitStoreRepo(org);
		Boolean result = pull(git);
		String scriptPath = constantsService.getByKeys("icip.pipelineScript.directory", "Core").getValue();
		scriptPath = scriptPath + org + "/" + pipelineName + "/";
		File folder = new File(scriptPath);
		String url = constantsService.getByKeys("icip.git.repo.store.url", org).getValue();
		String repoName = url.split("/")[url.split("/").length - 1].split("[.]")[0];
		if (folder.exists() && folder.isDirectory()) {
			Path source = Paths.get(scriptPath);
			Path destination = Paths.get(gitPathStore + repoName + "/" + pipelineName + "/");
			File destinationFolder = new File(destination.toString());

			if (!destinationFolder.exists()) {
				Files.createDirectories(Paths.get(destinationFolder.getAbsolutePath()));
			}
			if (Files.list(destination).findAny().isPresent()) {
				FileUtils.cleanDirectory(destination.toFile());
			}
			FileUtils.copyDirectory(source.toFile(), destination.toFile());
//			Files.copy(source, destination, StandardCopyOption.REPLACE_EXISTING);
		}
		push(git, pipelineName);

		return "Successfully published";

	}

	public String cloneGitRepoAndPushToS3(String datasetId, String org)
			throws InvalidRemoteException, TransportException, GitAPIException, IOException {
		try {
			ICIPDataset iCIPDataset = datasetService.getDataset(datasetId, org);
			JSONObject connectionDetails = new JSONObject(iCIPDataset.getDatasource().getConnectionDetails());
			JSONObject authDetailsObj = new JSONObject(connectionDetails.optString("AuthDetails"));
			String personalAcessToken = authDetailsObj.optString("authPrefix");
			JSONObject attributes = new JSONObject(iCIPDataset.getAttributes());
			String repoUrl = attributes.optString("url");
			String repoBranch = attributes.optString("branch");
			String repoName = extractRepoName(repoUrl);
			String localPath = folderPath + "/git/clonetos3/" + datasetId + "/" + repoName;
			Git git = this.cloneRepoForDataset(repoUrl, personalAcessToken, localPath, repoBranch);
			if (git != null) {
				this.uploadToS3(localPath, repoName, iCIPDataset);
			} else {
				return null;
			}
			JSONObject response = new JSONObject();
			response.put("path", localPath);
			return response.toString();
		} catch (Exception e) {
			log.error("Error: {} ", e.getMessage());

			return null;
		}
	}

	private void uploadToS3(String localPath, String repoName, ICIPDataset iCIPDataset) {
		try {
			JSONObject connectionDetails = new JSONObject(iCIPDataset.getDatasource().getConnectionDetails());
			String s3ConnectionId = connectionDetails.optString("datasource");
			String bucketName = connectionDetails.optString("bucketname");
			String s3FolderPath = connectionDetails.optString("bucketPath");
			if (s3FolderPath != null && !s3FolderPath.isEmpty()) {
				s3FolderPath = s3FolderPath + "/" + repoName;
			} else {
				s3FolderPath = repoName;
			}
			if (!s3FolderPath.endsWith("/")) {
				s3FolderPath += "/";
			}
			ICIPDatasource s3datasource = datasourceService.getDatasourceByNameAndOrganization(s3ConnectionId,
					iCIPDataset.getOrganization());
			JSONObject s3ConnectionDetails = new JSONObject(s3datasource.getConnectionDetails());

			String accessKey = s3ConnectionDetails.optString("accessKey");
			String secretKey = s3ConnectionDetails.optString("secretKey");
			String region = s3ConnectionDetails.optString("Region");
			URL endpointUrl = null;
			try {
				endpointUrl = new URL(s3ConnectionDetails.optString("url"));
			} catch (MalformedURLException e1) {
				log.error("URL not correct: {}", e1.getMessage());
			}
			TrustManager[] trustAllCerts = getTrustAllCerts();
			SSLContext sslContext = getSslContext(trustAllCerts);
			HostnameVerifier myVerifier = (hostname, session) -> true;
			ClientConfiguration clientConfiguration = new ClientConfiguration();
			ConnectionSocketFactory factory = new SdkTLSSocketFactory(sslContext, myVerifier);
			clientConfiguration.getApacheHttpClientConfig().setSslSocketFactory(factory);

			BasicAWSCredentials awsCreds = new BasicAWSCredentials(accessKey, secretKey);
			AmazonS3 s3Client = AmazonS3ClientBuilder.standard().withClientConfiguration(clientConfiguration)
					.withEndpointConfiguration(
							new AwsClientBuilder.EndpointConfiguration(endpointUrl.toString(), region))
					.withCredentials(new AWSStaticCredentialsProvider(awsCreds)).build();

			uploadFolder(s3Client, bucketName, localPath, s3FolderPath);
		} catch (Exception e) {
			log.error("Error due to : {}", e.getMessage());
		}
	}

	private SSLContext getSslContext(TrustManager[] trustAllCerts) {
		SSLContext sslContext = null;
		try {
			sslContext = SSLContext.getInstance("TLSv1.2");

			sslContext.init(null, trustAllCerts, new java.security.SecureRandom());
		} catch (KeyManagementException | NoSuchAlgorithmException e) {
			log.error("Error due to : {}", e.getMessage());
		}
		return sslContext;
	}

	public static void uploadFolder(AmazonS3 s3Client, String bucketName, String folderPath, String s3FolderPath) {
		File folder = new File(folderPath);
		uploadDirectory(s3Client, bucketName, folder, s3FolderPath);

	}

	private static void uploadDirectory(AmazonS3 s3Client, String bucketName, File folder, String s3FolderPath) {
		for (File file : folder.listFiles()) {
			if (file.isDirectory() && (file.getName().equals(".git") || file.getName().equals(".m2"))) {
				continue;
			}
			if (file.isFile()) {
				String keyName = s3FolderPath
						+ file.getPath().replace("\\", "/").substring(folder.getPath().length() + 1);
				s3Client.putObject(new PutObjectRequest(bucketName, keyName, file));
			} else if (file.isDirectory()) {
				uploadDirectory(s3Client, bucketName, file, s3FolderPath + file.getName() + "/");
			}
		}
	}

	private TrustManager[] getTrustAllCerts() {
		TrustManager[] trustAllCerts = new TrustManager[] { new X509TrustManager() {
			@Override
			public void checkClientTrusted(java.security.cert.X509Certificate[] chain, String authType) {
			}

			@Override
			public void checkServerTrusted(java.security.cert.X509Certificate[] chain, String authType) {
			}

			@Override
			public java.security.cert.X509Certificate[] getAcceptedIssuers() {
				return new java.security.cert.X509Certificate[] {};
			}
		} };
		return trustAllCerts;
	}

	public static String extractRepoName(String repoUrl) {
		// Split the URL by "/"
		String[] parts = repoUrl.split("/");
		// Get the last segment
		String lastSegment = parts[parts.length - 1];
		// Remove the ".git" extension
		if (lastSegment.endsWith(".git")) {
			lastSegment = lastSegment.substring(0, lastSegment.length() - 4);
		}
		return lastSegment;
	}

	public Git cloneRepoForDataset(String repoUrl, String personalAccessToken, String cloneDirectoryPath,
			String repoBranch) throws IllegalStateException, GitAPIException, IOException {
		try {
			if (repoBranch == null || repoBranch.isEmpty()) {
				repoBranch = "master";
			}
			File gitRepoPath = new File(cloneDirectoryPath);
			if (!gitRepoPath.exists()) {
				Files.createDirectories(Paths.get(cloneDirectoryPath));
			}
			Git git;
			git = Git.init().setDirectory(gitRepoPath).call();
			StoredConfig config = git.getRepository().getConfig();

			config.setBoolean("http", null, "sslVerify", false);
			config.save();

			URIish u = createURIish(repoUrl);
			git.remoteAdd().setName("origin").setUri(u).call();

			PullResult response = git.pull()
					.setCredentialsProvider(new UsernamePasswordCredentialsProvider(personalAccessToken, ""))
					.setRemote("origin").setRemoteBranchName(repoBranch).call();

			git.lsRemote().setCredentialsProvider(new UsernamePasswordCredentialsProvider(personalAccessToken, ""))
					.setHeads(true).call();
			//git.checkout().setCreateBranch(true).setName(repoBranch).setStartPoint("origin/" + repoBranch).call();
	        // Check if the branch exists locally
	        boolean branchExists = git.getRepository().getRefDatabase().findRef(repoBranch) != null;

	        if (!branchExists) {
	            // Create and checkout the branch if it doesn't exist
	            git.checkout()
	                    .setCreateBranch(true)
	                    .setName(repoBranch)
	                    .setStartPoint("origin/" + repoBranch)
	                    .call();
	        } else {
	            // Checkout the existing branch
	            git.checkout()
	                    .setName(repoBranch)
	                    .call();
	        }
	        response = git.pull()
					.setCredentialsProvider(new UsernamePasswordCredentialsProvider(personalAccessToken, ""))
					.setRemote("origin").setRemoteBranchName(repoBranch).call();
			return git;
		} catch (Exception e) {
			log.error("Error due to : {}", e.getMessage());
			e.printStackTrace();
			return null;
		}
	}

}
