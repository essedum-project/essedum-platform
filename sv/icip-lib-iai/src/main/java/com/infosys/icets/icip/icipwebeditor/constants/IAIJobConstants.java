/**
 * @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.icip.icipwebeditor.constants;

// TODO: Auto-generated Javadoc
/**
 * The Class IAIJobConstants.
 * 
 * @author icets
 *
 */
public class IAIJobConstants {

	/**
	 * Instantiates a new IAI job constants.
	 */
	private IAIJobConstants() {
	}

	/** The Constant CORRELATIONFILEDIRECTORY. */
	public static final String CORRELATIONFILEDIRECTORY = "correlationfiles/";

	/** The Constant CORRELATIONEXTENSION. */
	public static final String CORRELATIONEXTENSION = "_in.json";

	/** The Constant RESTNODEFILE. */
	public static final String RESTNODEFILE = "inputFilePath";

	/** The Constant RESTNODECLASSNAME. */
	public static final String RESTNODECLASSNAME = "leap.RESTAPIExecuter";

	/** The Constant LOGGERS. */
	public static final String LOGGERS = "loggers";

	/** The Constant GETDATA. */
	public static final String GETDATA = "getData";

	/** The Constant SAVEDATA. */
	public static final String SAVEDATA = "saveData";

	/** The Constant TRANSFORM. */
	public static final String TRANSFORM = "transform";

	/** The Constant INPUTS. */
	public static final String INPUTS = "inputs";

	/** The Constant VALUE. */
	public static final String VALUE = "value";

	/** The Constant SOLIDS. */
	public static final String SOLIDS = "solids";

	/** The Constant BUILDDAG. */
	public static final String BUILDDAG = "buildDAG";

	/** The Constant PIPELINEJSON. */
	public static final String PIPELINEJSON = "pipelineJson";

	/** The Constant LOG_LEVEL. */
	public static final String LOG_LEVEL = "INFO";

	/** The Constant PIPELINENAME. */
	public static final String PIPELINENAME = "pipelinename";

	/** The Constant DATASET. */
	public static final String DATASET = "dataset";

	/** The Constant ATTRIBUTES. */
	public static final String ATTRIBUTES = "attributes";

	/** The Constant DATASOURCE. */
	public static final String DATASOURCE = "datasource";

	/** The Constant SCHEMA. */
	public static final String SCHEMA = "schema";

	/** The Constant ELEMENTS. */
	public static final String ELEMENTS = "elements";

	/** The Constant PYTHON2. */
	public static final String PYTHON2 = "python2";

	/** The Constant PYTHON3. */
	public static final String PYTHON3 = "python3";

	/** The Constant IPDATASETCONFIG. */
	public static final String IPDATASETCONFIG = "inputDatasetConfig";

	/** The Constant OPDATASETCONFIG. */
	public static final String OPDATASETCONFIG = "outputDatasetConfig";

	/** The Constant ICIPDAGSTER. */
	public static final String ICIPDAGSTER = "icipdagster";

	/** The Constant PYTHONFILE. */
	public static final String PYTHONFILE = ".py";

	/** The Constant YAMLFILE. */
	public static final String YAMLFILE = "_inputs.yaml";

	/** The Constant PROP_COMMAND. */
	public static final String PROP_COMMAND = "command";

	/** The Constant PROP_PARAMETERS. */
	public static final String PROP_PARAMETERS = "parameters";

	/** The Constant PROP_WAIT_FOR_PROCESS. */
	public static final String PROP_WAIT_FOR_PROCESS = "waitForProcess";

	/** The Constant PROP_CONSUME_STREAMS. */
	public static final String PROP_CONSUME_STREAMS = "consumeStreams";

	/** The Constant PIPELINELOGPATH. */
	public static final String PIPELINELOGPATH = "/logs/pipeline/logfile";
	
	public static final String AICLOUDLOSSTORAEPATH="/logs/aicloud/";
	
	public static final String REMOTELOSSTORAEPATH="/logs/remote/";

	/** The Constant AGENTLOGPATH. */
	public static final String AGENTLOGPATH = "/logs/agent/logfile_";

	/** The Constant LOGPATH. */
	public static final String LOGPATH = "logs";

	/** The Constant CHAINLOGPATH. */
	public static final String CHAINLOGPATH = "chain";

	/** The Constant READ_LINE_COUNT. */
	public static final int READ_LINE_COUNT = 20;

	/** The Constant LINE_SEPARATOR. */
	public static final String LINE_SEPARATOR = "line.separator";

	/** The Constant OUTLOG. */
	public static final String OUTLOG = "_out.log";
	
	/** The Constant OUTLOG. */
	public static final int STRING_BUILDER_CAPACITY = 4096;
	
//	/** The Constant ERRLOG. */
//	public static final String ERRLOG = "_err.log";

	/** The Constant DATETIME_ERROR. */
	public static final String DATETIME_ERROR = "datetime must be after current time";

	public static final Object EMRLOGSSTOREPATH = "/logs/emr/";

	public static final String NATIVE_SCRIPT = "NativeScript";
	
	public static final String FILE_TYPE = "filetype";
	
	public static final String ARGUMENTS = "arguments";
	
	public static final String JYTHON = "Jython";
	
	public static final String FILES = "files";
	
	public static final String JOBS_SUB_PATH = "/jobs";
	
	public static final String NAME = "name";
	
	public static final String COLON = ":";
	
	public static final String JYTHON_LANG = "jython";

	public static final Object SAGEMAKERLOGSSTOREPATH = "/logs/sagemaker/";
}
