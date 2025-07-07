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
package com.infosys.icets.icip.reader.exceptions;

// TODO: Auto-generated Javadoc
/**
 * The Class NotSupportedException.
 */
public class NotSupportedException extends RuntimeException {

  /**
   * Instantiates a new not supported exception.
   */
  public NotSupportedException() {
    super();
  }

  /**
   * Instantiates a new not supported exception.
   *
   * @param msg the msg
   */
  public NotSupportedException(String msg) {
    super(msg);
  }

  /**
   * Instantiates a new not supported exception.
   *
   * @param e the e
   */
  public NotSupportedException(Exception e) {
    super(e);
  }

  /**
   * Instantiates a new not supported exception.
   *
   * @param msg the msg
   * @param e the e
   */
  public NotSupportedException(String msg, Exception e) {
    super(msg, e);
  }
}
