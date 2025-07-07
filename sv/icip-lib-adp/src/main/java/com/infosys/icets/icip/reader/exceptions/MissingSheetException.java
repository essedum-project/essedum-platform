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
 * The Class MissingSheetException.
 */
public class MissingSheetException extends RuntimeException {

  /**
   * Instantiates a new missing sheet exception.
   */
  public MissingSheetException() {
    super();
  }

  /**
   * Instantiates a new missing sheet exception.
   *
   * @param msg the msg
   */
  public MissingSheetException(String msg) {
    super(msg);
  }

  /**
   * Instantiates a new missing sheet exception.
   *
   * @param e the e
   */
  public MissingSheetException(Exception e) {
    super(e);
  }

  /**
   * Instantiates a new missing sheet exception.
   *
   * @param msg the msg
   * @param e the e
   */
  public MissingSheetException(String msg, Exception e) {
    super(msg, e);
  }
}
