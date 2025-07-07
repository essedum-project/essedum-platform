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
 * The Class OpenException.
 */
public class OpenException extends RuntimeException {

  /**
   * Instantiates a new open exception.
   */
  public OpenException() {
    super();
  }

  /**
   * Instantiates a new open exception.
   *
   * @param msg the msg
   */
  public OpenException(String msg) {
    super(msg);
  }

  /**
   * Instantiates a new open exception.
   *
   * @param e the e
   */
  public OpenException(Exception e) {
    super(e);
  }

  /**
   * Instantiates a new open exception.
   *
   * @param msg the msg
   * @param e the e
   */
  public OpenException(String msg, Exception e) {
    super(msg, e);
  }
}
