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

