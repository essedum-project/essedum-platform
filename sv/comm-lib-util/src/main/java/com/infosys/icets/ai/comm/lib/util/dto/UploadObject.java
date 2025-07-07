/**
 * @ 2023 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
/**
 * 
 */
package com.infosys.icets.ai.comm.lib.util.dto;

/**
 * @author icets
 *
 */
public class UploadObject {
	public String name;
	public String contentType;
	public String normalType;
	public String size;
	public int depth;
	public String depthPath;

	@Override
	public String toString() {
		return "UploadObject [name=" + name + ", contentType=" + contentType + ", normalType=" + normalType + ", size=" + size
				+ ", depth=" + depth + ", depthPath=" + depthPath + "]";
	}

}