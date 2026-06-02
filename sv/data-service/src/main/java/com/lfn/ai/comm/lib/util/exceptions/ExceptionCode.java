/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package com.lfn.ai.comm.lib.util.exceptions;

// 
/**
 * The Enum ExceptionCode.
 *
 * @author essedum
 */
public enum ExceptionCode {

	// @formatter:off

	/** The td. */
	// TODO
	TD,

	/** The cgwgt0001. */
	// widget
	CGWGT0001,
	/** The cgwgt0002. */
	CGWGT0002,
	/** The cgwgt0003. */
	CGWGT0003,
	/** The cgwgt0004. */
	CGWGT0004,
	/** The cgwgt0005. */
	CGWGT0005,
	/** The cgwgt0006. */
	CGWGT0006,
	/** The cgwgt0007. */
	CGWGT0007,
	/** The cgwgt0008. */
	CGWGT0008,
	/** The cgwgt0009. */
	CGWGT0009,
	/** The cgwgt0010. */
	CGWGT0010,

	/** The cgwgt0011. */
	CGWGT0011,
	/** The cgwgt0012. */
	CGWGT0012,
	/** The cgwgt0013. */
	CGWGT0013,
	/** The cgwgt0014. */
	CGWGT0014,
	/** The cgwgt0015. */
	CGWGT0015,
	/** The cgwgt0016. */
	CGWGT0016,
	/** The cgwgt0017. */
	CGWGT0017,

	/** The cgdsq0001. */
	// dash sequence
	CGDSQ0001,
	/** The cgdsq0002. */
	CGDSQ0002,
	/** The cgdsq0003. */
	CGDSQ0003,
	/** The cgdsq0004. */
	CGDSQ0004,
	/** The cgdsq0005. */
	CGDSQ0005,
	/** The cgdsq0006. */
	CGDSQ0006,
	/** The cgdsq0007. */
	CGDSQ0007,
	/** The cgdsq0008. */
	CGDSQ0008,
	/** The cgdsq0009. */
	CGDSQ0009,

	/** The cgdas0001. */
	// dashboard
	CGDAS0001,
	/** The cgdas0002. */
	CGDAS0002,
	/** The cgdas0003. */
	CGDAS0003,
	/** The cgdas0004. */
	CGDAS0004,
	/** The cgdas0005. */
	CGDAS0005,
	/** The cgdas0006. */
	CGDAS0006,
	/** The cgdas0007. */
	CGDAS0007,

	/** The cgdrt0001. */
	// dash record type
	CGDRT0001,
	/** The cgdrt0002. */
	CGDRT0002,
	/** The cgdrt0003. */
	CGDRT0003,
	/** The cgdrt0004. */
	CGDRT0004,
	/** The cgdrt0005. */
	CGDRT0005,
	/** The cgdrt0006. */
	CGDRT0006,

	/** The cgrtm0001. */
	// dash record type metadata
	CGRTM0001,
	/** The cgrtm0002. */
	CGRTM0002,
	/** The cgrtm0003. */
	CGRTM0003,
	/** The cgrtm0004. */
	CGRTM0004,
	/** The cgrtm0005. */
	CGRTM0005,
	/** The cgrtm0006. */
	CGRTM0006,
	/** The cgrtm0007. */
	CGRTM0007,

	/** The cgdth0001. */
	// dash threshold
	CGDTH0001,
	/** The cgdth0002. */
	CGDTH0002,
	/** The cgdth0003. */
	CGDTH0003,
	/** The cgdth0004. */
	CGDTH0004,
	/** The cgdth0005. */
	CGDTH0005,
	/** The cgdth0006. */
	CGDTH0006,

	/** The cgtws0001. */
	// dash threshold widget sequence
	CGTWS0001,
	/** The cgtws0002. */
	CGTWS0002,
	/** The cgtws0003. */
	CGTWS0003,
	/** The cgtws0004. */
	CGTWS0004,
	/** The cgtws0005. */
	CGTWS0005,
	/** The cgtws0006. */
	CGTWS0006,

	/** The cgvw0001. */
	// view
	CGVW0001,
	/** The cgvw0002. */
	CGVW0002,
	/** The cgvw0003. */
	CGVW0003,
	/** The cgvw0004. */
	CGVW0004,
	/** The cgvw0005. */
	CGVW0005,
	/** The cgvw0006. */
	CGVW0006,

	/** The cgsqw0001. */
	// sequenceWidget
	CGSQW0001,
	/** The cgsqw0002. */
	CGSQW0002,
	/** The cgsqw0003. */
	CGSQW0003,
	/** The cgsqw0004. */
	CGSQW0004,
	/** The cgsqw0005. */
	CGSQW0005,
	/** The cgsqw0006. */
	CGSQW0006,

	/** The cgdsr0001. */
	// dash records
	CGDSR0001,
	/** The cgdsr0002. */
	CGDSR0002,
	/** The cgdsr0003. */
	CGDSR0003,
	/** The cgdsr0004. */
	CGDSR0004,
	/** The cgdsr0005. */
	CGDSR0005,
	/** The cgdsr0006. */
	CGDSR0006,
	/** The cgdsr0007. */
	CGDSR0007,
	/** The cgdsr0008. */
	CGDSR0008,
	/** The cgdsr0009. */
	CGDSR0009,
	/** The cgdsr0010. */
	CGDSR0010,

	/** The cgdsr0011. */
	CGDSR0011,
	/** The cgdsr0012. */
	CGDSR0012,
	/** The cgdsr0013. */
	CGDSR0013,

	/** The cgwtd0001. */
	// dashwidgetdashboard
	CGWTD0001,
	/** The cgwtd0002. */
	CGWTD0002,
	/** The cgwtd0003. */
	CGWTD0003,
	/** The cgwtd0004. */
	CGWTD0004,
	/** The cgwtd0005. */
	CGWTD0005,
	/** The cgwtd0006. */
	CGWTD0006,

	/** The cgrua0001. */
	// rptuser authoroty
	CGRUA0001,
	/** The cgrua0002. */
	CGRUA0002,
	/** The cgrua0003. */
	CGRUA0003,
	/** The cgrua0004. */
	CGRUA0004,
	/** The cgrua0005. */
	CGRUA0005,
	/** The cgrua0006. */
	CGRUA0006,

	/** The cgrpu0001. */
	// rpt users
	CGRPU0001,
	/** The cgrpu0002. */
	CGRPU0002,
	/** The cgrpu0003. */
	CGRPU0003,
	/** The cgrpu0004. */
	CGRPU0004,
	/** The cgrpu0005. */
	CGRPU0005,
	/** The cgrpu0006. */
	CGRPU0006,
	/** The cgrpu0007. */
	CGRPU0007,
	/** The cgrpu0008. */
	CGRPU0008,

	// service impl
	/** The cgdhs0001. */
	// dashboard
	CGDHS0001,
	/** The cgdhs0002. */
	CGDHS0002,
	/** The cgdhs0003. */
	CGDHS0003,
	/** The cgdhs0004. */
	CGDHS0004,
	/** The cgdhs0005. */
	CGDHS0005,
	/** The cgdhs0006. */
	CGDHS0006,
	/** The cgdhs0007. */
	CGDHS0007,
	/** The cgdhs0008. */
	CGDHS0008,

	/** The cgrms0001. */
	// dashrecords metadata
	CGRMS0001,
	/** The cgrms0002. */
	CGRMS0002,
	/** The cgrms0003. */
	CGRMS0003,
	/** The cgrms0004. */
	CGRMS0004,
	/** The cgrms0005. */
	CGRMS0005,
	/** The cgrms0006. */
	CGRMS0006,
	/** The cgrms0007. */
	CGRMS0007,
	/** The cgrms0008. */
	CGRMS0008,

	/** The cgths0001. */
	// dash thresholds
	CGTHS0001,
	/** The cgths0002. */
	CGTHS0002,
	/** The cgths0003. */
	CGTHS0003,
	/** The cgths0004. */
	CGTHS0004,
	/** The cgths0005. */
	CGTHS0005,
	/** The cgths0006. */
	CGTHS0006,

	/** The cgdrs0001. */
	// dashrecords
	CGDRS0001,
	/** The cgdrs0002. */
	CGDRS0002,
	/** The cgdrs0003. */
	CGDRS0003,
	/** The cgdrs0004. */
	CGDRS0004,
	/** The cgdrs0005. */
	CGDRS0005,
	/** The cgdrs0006. */
	CGDRS0006,
	/** The cgdrs0007. */
	CGDRS0007,
	/** The cgdrs0008. */
	CGDRS0008,
	/** The cgdrs0009. */
	CGDRS0009,
	/** The cgdrs0010. */
	CGDRS0010,

	/** The cgdrs0011. */
	CGDRS0011,
	/** The cgdrs0012. */
	CGDRS0012,
	/** The cgdrs0013. */
	CGDRS0013,
	/** The cgdrs0014. */
	CGDRS0014,
	/** The cgdrs0015. */
	CGDRS0015,
	/** The cgdrs0016. */
	CGDRS0016,
	/** The cgdrs0017. */
	CGDRS0017,
	/** The cgdrs0018. */
	CGDRS0018,
	/** The cgdrs0019. */
	CGDRS0019,
	/** The cgdrs0020. */
	CGDRS0020,

	/** The cgrts0001. */
	// dash recordstype
	CGRTS0001,
	/** The cgrts0002. */
	CGRTS0002,
	/** The cgrts0003. */
	CGRTS0003,
	/** The cgrts0004. */
	CGRTS0004,
	/** The cgrts0005. */
	CGRTS0005,
	/** The cgrts0006. */
	CGRTS0006,

	/** The cgsqs0001. */
	// dash sequence
	CGSQS0001,
	/** The cgsqs0002. */
	CGSQS0002,
	/** The cgsqs0003. */
	CGSQS0003,
	/** The cgsqs0004. */
	CGSQS0004,
	/** The cgsqs0005. */
	CGSQS0005,
	/** The cgsqs0006. */
	CGSQS0006,
	/** The cgsqs0007. */
	CGSQS0007,
	/** The cgsqs0008. */
	CGSQS0008,

	/** The cgras0001. */
	// rpt authority
	CGRAS0001,
	/** The cgras0002. */
	CGRAS0002,
	/** The cgras0003. */
	CGRAS0003,
	/** The cgras0004. */
	CGRAS0004,
	/** The cgras0005. */
	CGRAS0005,
	/** The cgras0006. */
	CGRAS0006,

	/** The cguss0001. */
	// rpt user
	CGUSS0001,
	/** The cguss0002. */
	CGUSS0002,
	/** The cguss0003. */
	CGUSS0003,
	/** The cguss0004. */
	CGUSS0004,
	/** The cguss0005. */
	CGUSS0005,
	/** The cguss0006. */
	CGUSS0006,
	/** The cguss0007. */
	CGUSS0007,
	/** The cguss0008. */
	CGUSS0008,
	/** The cguss0009. */
	CGUSS0009,

	/** The cgrus0001. */
	// rpt user authority
	CGRUS0001,
	/** The cgrus0002. */
	CGRUS0002,
	/** The cgrus0003. */
	CGRUS0003,
	/** The cgrus0004. */
	CGRUS0004,
	/** The cgrus0005. */
	CGRUS0005,
	/** The cgrus0006. */
	CGRUS0006,

	/** The cgwds0001. */
	// widget dashboard mapping
	CGWDS0001,
	/** The cgwds0002. */
	CGWDS0002,
	/** The cgwds0003. */
	CGWDS0003,
	/** The cgwds0004. */
	CGWDS0004,
	/** The cgwds0005. */
	CGWDS0005,
	/** The cgwds0006. */
	CGWDS0006,
	/** The cgwds0007. */
	CGWDS0007,

	/** The cgwcs0001. */
	// widget
	CGWCS0001,
	/** The cgwcs0002. */
	CGWCS0002,
	/** The cgwcs0003. */
	CGWCS0003,
	/** The cgwcs0004. */
	CGWCS0004,
	/** The cgwcs0005. */
	CGWCS0005,
	/** The cgwcs0006. */
	CGWCS0006,
	/** The cgwcs0007. */
	CGWCS0007,
	/** The cgwcs0008. */
	CGWCS0008,
	/** The cgwcs0009. */
	CGWCS0009,
	/** The cgwcs0010. */
	CGWCS0010,

	/** The cgwcs0011. */
	CGWCS0011,
	/** The cgwcs0012. */
	CGWCS0012,
	/** The cgwcs0013. */
	CGWCS0013,
	/** The cgwcs0014. */
	CGWCS0014,
	/** The cgwcs0015. */
	CGWCS0015,
	/** The cgwcs0016. */
	CGWCS0016,
	/** The cgwcs0017. */
	CGWCS0017,

	/** The cgdts0001. */
	// threshold widget sequence mapping
	CGDTS0001,
	/** The cgdts0002. */
	CGDTS0002,
	/** The cgdts0003. */
	CGDTS0003,
	/** The cgdts0004. */
	CGDTS0004,
	/** The cgdts0005. */
	CGDTS0005,
	/** The cgdts0006. */
	CGDTS0006,

	/** The cgsws0001. */
	// dash sequence widget
	CGSWS0001,
	/** The cgsws0002. */
	CGSWS0002,
	/** The cgsws0003. */
	CGSWS0003,
	/** The cgsws0004. */
	CGSWS0004,
	/** The cgsws0005. */
	CGSWS0005,
	/** The cgsws0006. */
	CGSWS0006,

	/** The cgvws0001. */
	// dash views
	CGVWS0001,
	/** The cgvws0002. */
	CGVWS0002,
	/** The cgvws0003. */
	CGVWS0003,
	/** The cgvws0004. */
	CGVWS0004,
	/** The cgvws0005. */
	CGVWS0005,
	/** The cgvws0006. */
	CGVWS0006,
	/** The cgvws0007. */
	CGVWS0007

	;
	// @formatter:on

	/** The code. */
	private final String code;

	/** The message. */
	private final String message;

	/** The user friendly message. */
	private final String userFriendlyMessage;

	/**
	 * Instantiates a new exception code.
	 */
	private ExceptionCode() {
		this.code = this.name();
		this.message = code.toString();
		this.userFriendlyMessage = this.generateUserFriendlyMessage();
	}

	/*
	 * private ExceptionCode(String code) { this.code = code; this.message =
	 * ErrorUtil.getErrorMessage(code); this.userFriendlyMessage =
	 * this.generateUserFriendlyMessage(); }
	 */

	/**
	 * Generate user friendly message.
	 *
	 * @return the string
	 */
	private String generateUserFriendlyMessage() {
		StringBuilder strErrMsg = new StringBuilder();
		strErrMsg.append(code);
		strErrMsg.append(": ");
		strErrMsg.append(message);
		return strErrMsg.toString();
	}

	/**
	 * Gets the code.
	 *
	 * @return the code
	 */
	public String getCode() {
		return code;
	}

	/**
	 * Gets the message.
	 *
	 * @return the message
	 */
	public String getMessage() {
		return message;
	}

	/**
	 * Gets the user friendly message.
	 *
	 * @return the user friendly message
	 */
	public String getUserFriendlyMessage() {
		return userFriendlyMessage;
	}

	/**
	 * To string.
	 *
	 * @return the string
	 */
	@Override
	public String toString() {
		return userFriendlyMessage;
	}
}
