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
package com.infosys.icets.icip.dataset.util;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class DynamicClassLoader.
 *
 * @author icets
 */
public class DynamicClassLoader  extends ClassLoader {
	
	/**
	 * This constructor is used to set the parent ClassLoader.
	 *
	 * @param parent the parent
	 */
    public DynamicClassLoader(ClassLoader parent) {
        super(parent);
    }
    
    /**
     * Instantiates a new dynamic class loader.
     */
    public DynamicClassLoader() {
    }
    
    /**
     * Define class.
     *
     * @param name the name
     * @param b the b
     * @return the class
     */
    public Class<?> defineClass(String name, byte[] b) {
        return defineClass(name, b, 0, b.length);
    }
    
    
}
