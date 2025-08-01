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

package com.infosys.icets.iamp.usm.domain;
import java.io.Serializable;
import java.sql.Date;
import lombok.EqualsAndHashCode;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

// TODO: Auto-generated Javadoc
/**
 * A UsmModuleOrganisation.
 */
/**
* @author icets
*/

/**
 * Sets the organisation.
 *
 * @param organisation the new organisation
 */

/**
 * Sets the subscription.
 *
 * @param subscription the new subscription
 */

/**
 * Sets the subscription.
 *
 * @param subscription the new subscription
 */
@Setter

/**
 * Gets the organisation.
 *
 * @return the organisation
 */

/**
 * Gets the subscription.
 *
 * @return the subscription
 */

/**
 * Gets the subscription.
 *
 * @return the subscription
 */
@Getter

/**
 * To string.
 *
 * @return the java.lang. string
 */

/**
 * To string.
 *
 * @return the java.lang. string
 */

/**
 * To string.
 *
 * @return the java.lang. string
 */
@ToString

/**
 * Hash code.
 *
 * @return the int
 */

/**
 * Hash code.
 *
 * @return the int
 */
@Entity
@JsonIdentityInfo(generator=ObjectIdGenerators.PropertyGenerator.class, property="id", scope=UsmModuleOrganisation.class)
@Table(name = "usm_module_organisation")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class UsmModuleOrganisation implements Serializable {

    /** The Constant serialVersionUID. */
    private static final long serialVersionUID = 1L;

    /** The id. */
    @Id
	@EqualsAndHashCode.Include
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /** The module. */
    @JoinColumn(name ="module")  
    @ManyToOne
    private UsmModule module;

    /** The startdate. */
    @Column(name = "start_date")
    private Date startdate;

    /** The enddate. */
    @Column(name = "end_date")
    private Date enddate;

    /** The subscriptionstatus. */
    @Column(name = "subscription_status")
    private Boolean subscriptionstatus;

     /** The organisation. */
     @JoinColumn(name ="organisation")   
    @ManyToOne
    private Project organisation;
     
     
     /** The subscription. */
     @Column(columnDefinition = "TEXT")
     private String subscription;

}

