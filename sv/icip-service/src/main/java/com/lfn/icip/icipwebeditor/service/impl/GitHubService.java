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
import com.lfn.ai.comm.lib.util.SecureTrustManagerUtil;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.ai.comm.lib.util.annotation.service.ConstantsService;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.service.IICIPDatasourceService;
import com.lfn.icip.dataset.service.impl.ICIPDatasetService;

@Service
@RefreshScope
public class GitHubService {

	/**
	 * Pattern of characters that are NOT allowed in a single path segment supplied
	 * by an external caller (pipeline name, file name, organisation name, branch
	 * name, etc.). Allows only ASCII letters, digits, and a small set of safe
	 * punctuation. Path separators ({@code / \}), parent traversal ({@code ..}),
	 * null bytes, control characters, and shell meta-characters are all rejected.
	 */
	private static final java.util.regex.Pattern UNSAFE_SEGMENT =
			java.util.regex.Pattern.compile("[^A-Za-z0-9._\\-]");

	/**
	 * Validates a single user-supplied path segment (e.g. pipelineName, filename,
	 * org, branchName) so that it cannot escape its intended directory or inject
	 * dangerous characters into a path expression.
	 *
	 * @param value the untrusted segment
	 * @param name  human-readable name of the parameter, used in error messages
	 * @return the same value once validated
	 * @throws IllegalArgumentException if the segment is null, empty, contains
	 *         path separators, traversal sequences, or any other disallowed character
	 */
	private static String safeSegment(String value, String name) {
		if (value == null || value.isEmpty()) {
			throw new IllegalArgumentException(name + " must not be null or empty");
		}
		if (value.contains("..") || value.contains("/") || value.contains("\\")
				|| value.contains("\0") || value.startsWith(".")) {
			throw new IllegalArgumentException(
					name + " contains disallowed path characters: " + value);
		}
		if (UNSAFE_SEGMENT.matcher(value).find()) {
			throw new IllegalArgumentException(
					name + " contains disallowed characters: " + value);
		}
		return value;
	}

	/**
	 * Variant of {@link #safeSegment(String, String)} that accepts {@code /} as
	 * a separator between safe segments. Used for relative file paths read from
	 * a zip / map of files where sub-directories are legitimate, but parent
	 * traversal is not.
	 */
	private static String safeRelativePath(String value, String name) {
		if (value == null || value.isEmpty()) {
			throw new IllegalArgumentException(name + " must not be null or empty");
		}
		if (value.contains("\0") || value.contains("..") || value.contains("\\")
				|| value.startsWith("/")) {
			throw new IllegalArgumentException(
					name + " contains disallowed path characters: " + value);
		}
		for (String part : value.split("/")) {
			if (!part.isEmpty()) {
				safeSegment(part, name + " segment");
			}
		}
		return value;
	}



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

	/** Fallback GitHub repo URL from application properties */
	@Value("${github.repoUrl:}")
	private String fallbackRepoUrl;

	/** Default branch name (main or master) */
	@Value("${github.defaultBranch:main}")
	private String defaultBranch;

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

	/**
	 * Resolves the GitHub repo URL for a given org.
	 * Tries constantsService first, falls back to github.repoUrl property.
	 */
	public String resolveRepoUrl(String org) {
		try {
			var constant = constantsService.getByKeys("icip.git.repo.studio.url", org);
			if (constant != null && constant.getValue() != null && !constant.getValue().isEmpty()) {
				return constant.getValue();
			}
		} catch (Exception ex) {
			log.warn("Could not resolve repo URL from constantsService for org: {}. Error: {}", org, ex.getMessage());
		}
		if (fallbackRepoUrl != null && !fallbackRepoUrl.isEmpty()) {
			log.info("Using fallback GitHub repo URL from application properties: {}", fallbackRepoUrl);
			return fallbackRepoUrl;
		}
		return null;
	}

	/**
	 * Extracts repo name from a full repo URL.
	 */
	private String extractRepoNameFromUrl(String url) {
		return url.split("/")[url.split("/").length - 1].split("[.]")[0];
	}

	/**
	 * Checks if GitHub is configured and available for the given org.
	 */
	public boolean isGitHubAvailable(String org) {
		String url = resolveRepoUrl(org);
		return url != null && !url.isEmpty();
	}

	public Git getGitHubRepository(String org)
			throws InvalidRemoteException, TransportException, GitAPIException, IOException {

		String url = resolveRepoUrl(org);
		if (url == null || url.isEmpty()) {
			throw new IOException("GitHub repo URL is not configured for org: " + org + ". Please set 'icip.git.repo.studio.url' in constants or 'github.repoUrl' in application properties.");
		}

		String repoName = extractRepoNameFromUrl(url);

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

			// Detect which default branch exists on remote
			String remoteBranch = detectRemoteDefaultBranch(git);
			log.info("Detected remote default branch: {}", remoteBranch);

			try {
				PullResult response = git.pull()
						.setCredentialsProvider(new UsernamePasswordCredentialsProvider(username, password))
						.setRemote("origin").setRemoteBranchName(remoteBranch).call();

				git.lsRemote().setCredentialsProvider(new UsernamePasswordCredentialsProvider(username, password))
						.setHeads(true).call();
				git.checkout().setName(remoteBranch).call();
			} catch (Exception e) {
				log.warn("Could not pull/checkout remote branch '{}'. Remote repo may be empty. Will create initial commit later. Error: {}", remoteBranch, e.getMessage());
			}

		} else {

			FileRepositoryBuilder builder = new FileRepositoryBuilder();
			Repository repository = builder.setGitDir(new File(gitPath + repoName + "/.git")).readEnvironment()
					.findGitDir()
					.build();

			log.info("Having repository: " + repository.getDirectory());

			git = new Git(repository);

			// If the repo exists but has no HEAD (stale from previous failed init), re-pull
			if (repository.resolve("HEAD") == null) {
				log.info("Existing repo has no HEAD. Attempting to pull from remote default branch.");
				String remoteBranch = detectRemoteDefaultBranch(git);
				try {
					git.pull()
						.setCredentialsProvider(new UsernamePasswordCredentialsProvider(username, password))
						.setRemote("origin").setRemoteBranchName(remoteBranch).call();
					git.checkout().setName(remoteBranch).call();
					log.info("Successfully pulled and checked out branch: {}", remoteBranch);
				} catch (Exception e) {
					log.warn("Could not pull default branch on stale repo: {}", e.getMessage());
				}
			}

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
					.setRemote("origin").setRemoteBranchName(defaultBranch).call();

			git.lsRemote().setCredentialsProvider(new UsernamePasswordCredentialsProvider(username, password))
					.setHeads(true).call();
			git.checkout().setName(defaultBranch).call();

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

		safeSegment(pipelineName, "pipelineName");
		safeSegment(org, "org");
		safeSegment(filename, "filename");

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
		safeSegment(pipelineName, "pipelineName");
		safeSegment(org, "org");
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

	/**
	 * Detects the default branch on the remote (main vs master).
	 */
	private String detectRemoteDefaultBranch(Git git) {
		try {
			var refs = git.lsRemote()
					.setCredentialsProvider(new UsernamePasswordCredentialsProvider(username, password))
					.setHeads(true).call();
			boolean hasMain = refs.stream().anyMatch(ref -> ref.getName().equals("refs/heads/main"));
			boolean hasMaster = refs.stream().anyMatch(ref -> ref.getName().equals("refs/heads/master"));
			if (hasMain) return "main";
			if (hasMaster) return "master";
		} catch (Exception e) {
			log.warn("Could not detect remote default branch: {}", e.getMessage());
		}
		return defaultBranch;
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
		safeSegment(pipelineName, "pipelineName");
		safeSegment(org, "org");
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
		return SecureTrustManagerUtil.getValidatingTrustManagers();
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

	/**
	 * Get or create a Git repository and checkout a pipeline-specific branch.
	 * Creates the branch from master if it doesn't exist yet.
	 */
	public Git getGitHubRepositoryForBranch(String org, String branchName)
			throws InvalidRemoteException, TransportException, GitAPIException, IOException {
		Git git = getGitHubRepository(org);

		// If HEAD cannot be resolved (empty repo with no commits), create an initial commit
		if (git.getRepository().resolve("HEAD") == null) {
			log.info("Repository has no commits (HEAD is null). Creating initial commit before branching.");
			// Create a placeholder file so we have something to commit
			String url = resolveRepoUrl(org);
			String repoName = extractRepoNameFromUrl(url);
			File readmeFile = new File(gitPath + repoName + "/README.md");
			if (!readmeFile.exists()) {
				try (OutputStream os = new FileOutputStream(readmeFile)) {
					os.write("# Vibe Studio Pipeline Scripts\n".getBytes());
				}
			}
			git.add().addFilepattern("README.md").call();
			git.commit().setMessage("Initial commit").call();
			// Push initial commit to origin default branch
			try {
				git.push()
					.setCredentialsProvider(new UsernamePasswordCredentialsProvider(username, password))
					.setRemote("origin")
					.setForce(true)
					.call();
				log.info("Pushed initial commit to origin/{} successfully.", defaultBranch);
			} catch (Exception e) {
				log.warn("Could not push initial commit: {}", e.getMessage());
			}
		}

		pull(git);

		boolean branchExists = git.getRepository().getRefDatabase().findRef(branchName) != null;
		boolean remoteBranchExists = git.lsRemote()
				.setCredentialsProvider(new UsernamePasswordCredentialsProvider(username, password))
				.setHeads(true).call().stream()
				.anyMatch(ref -> ref.getName().equals("refs/heads/" + branchName));

		if (remoteBranchExists && !branchExists) {
			git.checkout().setCreateBranch(true).setName(branchName)
					.setStartPoint("origin/" + branchName).call();
		} else if (!branchExists) {
			git.checkout().setCreateBranch(true).setName(branchName).call();
		} else {
			git.checkout().setName(branchName).call();
		}

		// Pull latest for this branch
		try {
			git.pull().setCredentialsProvider(new UsernamePasswordCredentialsProvider(username, password))
					.setRemote("origin").setRemoteBranchName(branchName).call();
		} catch (Exception e) {
			log.warn("Could not pull branch {}: {}", branchName, e.getMessage());
		}

		return git;
	}

	/**
	 * Save file content to GitHub on a pipeline-specific branch.
	 * Uses an isolated temp directory so only the pipeline's files are pushed.
	 */
	public void saveFileToGitHubBranch(byte[] content, String pipelineName, String org,
			String filename, String branchName)
			throws IOException, GitAPIException {
		saveFilesToGitHubBranch(
				java.util.Map.of(filename, content),
				pipelineName, org, branchName);
	}

	/**
	 * Save multiple files to GitHub on a specific branch in a single commit+push.
	 * Uses a fresh temp clone directory so only the given files end up on the branch.
	 */
	public void saveFilesToGitHubBranch(java.util.Map<String, byte[]> files, String pipelineName, String org,
			String branchName) throws IOException, GitAPIException {

		safeSegment(pipelineName, "pipelineName");
		safeSegment(org, "org");
		// Validate every map key (zip-derived relative path) before any path is built from it
		if (files != null) {
			for (String key : files.keySet()) {
				safeRelativePath(key, "fileName");
			}
		}

		String url = resolveRepoUrl(org);
		if (url == null || url.isEmpty()) {
			throw new IOException("GitHub repo URL is not configured for org: " + org);
		}
		String repoName = extractRepoNameFromUrl(url);
		UsernamePasswordCredentialsProvider creds =
				new UsernamePasswordCredentialsProvider(username, password);

		// Use a unique temp directory per pipeline/branch to avoid cross-contamination
		Path tempDir = Paths.get(gitPath, "tmp-" + pipelineName + "-" + System.currentTimeMillis());
		File tempDirFile = tempDir.toFile();

		log.info("[GitHubService] Batch push {} files to GitHub using isolated temp dir => Repo: {}, Branch: {}, Pipeline: {}, TempDir: {}",
				files.size(), repoName, branchName, pipelineName, tempDir);

		Git git = null;
		try {
			// 1. Clone the repo into temp directory (shallow, default branch only)
			boolean freshRepo = false;
			try {
				git = Git.cloneRepository()
						.setURI(url)
						.setDirectory(tempDirFile)
						.setCredentialsProvider(creds)
						.setCloneAllBranches(false)
						.call();
				// Disable SSL verification
				StoredConfig cfg = git.getRepository().getConfig();
				cfg.setBoolean("http", null, "sslVerify", false);
				cfg.save();
			} catch (Exception cloneEx) {
				log.warn("Clone failed (repo may be empty), initialising fresh: {}", cloneEx.getMessage());
				if (tempDirFile.exists()) {
					deleteDirectoryRecursive(tempDir);
				}
				Files.createDirectories(tempDir);
				git = Git.init().setDirectory(tempDirFile).call();
				StoredConfig cfg = git.getRepository().getConfig();
				cfg.setBoolean("http", null, "sslVerify", false);
				cfg.save();
				try {
					git.remoteAdd().setName("origin").setUri(new org.eclipse.jgit.transport.URIish(url)).call();
				} catch (java.net.URISyntaxException e) {
					throw new IOException("Invalid repo URL: " + url, e);
				}
				freshRepo = true;
			}

			// 2. Detect the remote default branch (main or master)
			String remoteDefaultBranch = detectRemoteDefaultBranch(git);
			log.info("Detected remote default branch: '{}' for repo: {}", remoteDefaultBranch, repoName);

			// 3. Check if remote branch already exists
			boolean remoteBranchExists = false;
			try {
				remoteBranchExists = git.lsRemote()
						.setCredentialsProvider(creds)
						.setHeads(true).call().stream()
						.anyMatch(ref -> ref.getName().equals("refs/heads/" + branchName));
			} catch (Exception e) {
				log.warn("Could not list remote branches: {}", e.getMessage());
			}

			if (remoteBranchExists) {
				// Checkout existing remote branch
				git.fetch().setCredentialsProvider(creds).setRemote("origin").call();
				git.checkout().setCreateBranch(true).setName(branchName)
						.setStartPoint("origin/" + branchName).call();
				log.info("Checked out existing remote branch '{}'", branchName);
			} else if (freshRepo) {
				// Empty repo — need an initial commit before we can branch
				File readmeFile = new File(tempDirFile, "README.md");
				Files.writeString(readmeFile.toPath(), "# Pipeline Scripts\n");
				git.add().addFilepattern("README.md").call();
				git.commit().setMessage("Initial commit").call();
				// Push initial commit to default branch
				try {
					git.push().setCredentialsProvider(creds).setRemote("origin").setForce(true).call();
				} catch (Exception e) {
					log.warn("Could not push initial commit: {}", e.getMessage());
				}
				git.checkout().setCreateBranch(true).setName(branchName).call();
				log.info("Fresh repo: created branch '{}' after initial commit", branchName);
			} else {
				// Create new branch explicitly from the remote default branch (main/master)
				git.checkout()
						.setCreateBranch(true)
						.setName(branchName)
						.setStartPoint("origin/" + remoteDefaultBranch)
						.call();
				log.info("Created new branch '{}' from 'origin/{}'", branchName, remoteDefaultBranch);

				// Remove all existing content so only this pipeline's files are on the branch
				File[] existing = tempDirFile.listFiles();
				if (existing != null) {
					for (File f : existing) {
						if (f.getName().equals(".git")) continue;
						if (f.isDirectory()) {
							deleteDirectoryRecursive(f.toPath());
						} else {
							Files.deleteIfExists(f.toPath());
						}
					}
				}
				// Stage removals
				git.add().setUpdate(true).addFilepattern(".").call();
			}

			// 3. Write only this pipeline/session's files
			for (java.util.Map.Entry<String, byte[]> entry : files.entrySet()) {
				String filename = entry.getKey();
				byte[] content = entry.getValue();

				File targetFile = new File(tempDirFile, pipelineName + "/" + filename);
				if (!targetFile.getParentFile().exists()) {
					Files.createDirectories(targetFile.getParentFile().toPath());
				}
				try (OutputStream os = new FileOutputStream(targetFile)) {
					os.write(content);
				}
			}

			// 4. Stage only the pipeline folder
			git.add().addFilepattern(pipelineName + "/").call();

			// 5. Commit
			git.commit().setMessage("Update " + files.size() + " files for " + pipelineName).call();

			// 6. Push
			PushCommand pushCommand = git.push();
			pushCommand.setCredentialsProvider(creds);
			pushCommand.setRemote("origin");
			pushCommand.add(branchName);
			pushCommand.setForce(true);
			pushCommand.call();

			log.info("[GitHubService] Successfully pushed {} files to GitHub => Repo: {}, Branch: {}, Pipeline: {}",
					files.size(), repoName, branchName, pipelineName);

		} finally {
			// 7. Close git and cleanup temp directory
			if (git != null) {
				git.close();
			}
			try {
				deleteDirectoryRecursive(tempDir);
				log.info("Cleaned up temp directory: {}", tempDir);
			} catch (IOException e) {
				log.warn("Could not clean up temp directory {}: {}", tempDir, e.getMessage());
			}
		}
	}

	/**
	 * Recursively delete a directory.
	 *
	 * <p>The {@code dir} argument is required to live underneath one of the
	 * trusted git working roots ({@link #gitPath} or {@link #gitPathStore}); any
	 * attempt to delete a path outside those roots is rejected, mitigating
	 * "Uncontrolled data used in path expression" issues at the {@code Files.walk}
	 * / {@code Files.delete} sinks below.
	 */
	private void deleteDirectoryRecursive(Path dir) throws IOException {
		if (dir == null) return;
		Path normalized = dir.toAbsolutePath().normalize();
		boolean underTrustedRoot = false;
		for (String root : new String[] { gitPath, gitPathStore }) {
			if (root == null || root.isEmpty()) continue;
			Path rootPath = Paths.get(root).toAbsolutePath().normalize();
			if (normalized.startsWith(rootPath)) {
				underTrustedRoot = true;
				break;
			}
		}
		if (!underTrustedRoot) {
			throw new IOException("Refusing to delete path outside trusted git roots: " + normalized);
		}
		if (!Files.exists(normalized)) return;
		try (java.util.stream.Stream<Path> walk = Files.walk(normalized)) {
			walk.sorted(java.util.Comparator.reverseOrder())
					.forEach(p -> {
						try { Files.delete(p); } catch (IOException ignored) {}
					});
		}
	}

	/**
	 * Fetch file content from a pipeline-specific branch.
	 */
	public byte[] fetchFileFromGitHubBranch(String pipelineName, String org,
			String filename, String branchName)
			throws IOException, GitAPIException {
		safeSegment(pipelineName, "pipelineName");
		safeSegment(org, "org");
		safeRelativePath(filename, "filename");
		Git git = getGitHubRepositoryForBranch(org, branchName);

		String url = resolveRepoUrl(org);
		String repoName = extractRepoNameFromUrl(url);

		File targetFile = new File(gitPath + repoName + "/" + pipelineName + "/" + filename);
		if (targetFile.exists()) {
			return Files.readAllBytes(targetFile.toPath());
		}
		return null;
	}

	public Git cloneRepoForDataset(String repoUrl, String personalAccessToken, String cloneDirectoryPath,
			String repoBranch) throws IllegalStateException, GitAPIException, IOException {
		try {
			if (repoBranch == null || repoBranch.isEmpty()) {
				repoBranch = "master";
			}
			// Validate the user-supplied clone directory path to prevent traversal
			// and reject any path containing '..' or null bytes.
			java.nio.file.Path safeClonePath =
					com.lfn.icip.dataset.util.PathValidationUtil.validateAndGetPath(cloneDirectoryPath);
			File gitRepoPath = safeClonePath.toFile();
			if (!gitRepoPath.exists()) {
				Files.createDirectories(safeClonePath);
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
