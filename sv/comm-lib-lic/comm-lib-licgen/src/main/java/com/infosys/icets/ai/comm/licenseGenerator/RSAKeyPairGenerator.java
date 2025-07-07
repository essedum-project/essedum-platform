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
package com.infosys.icets.ai.comm.licenseGenerator;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.security.*;
import java.util.Base64;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// 
/**
 * The Class RSAKeyPairGenerator.
 *
 * @author icets
 */
public class RSAKeyPairGenerator {

    /** The private key. */
    private PrivateKey privateKey;
    
    /** The public key. */
    private PublicKey publicKey;

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(RSAKeyPairGenerator.class);
	
    /**
     * Instantiates a new RSA key pair generator.
     *
     * @throws NoSuchAlgorithmException the no such algorithm exception
     */
    public RSAKeyPairGenerator() throws NoSuchAlgorithmException {
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
        keyGen.initialize(2048);
        KeyPair pair = keyGen.generateKeyPair();
        this.privateKey = pair.getPrivate();
        this.publicKey = pair.getPublic();
    }

    /**
     * Write to file.
     *
     * @param path the path
     * @param key the key
     * @throws IOException Signals that an I/O exception has occurred.
     */
    public void writeToFile(String path, byte[] key) throws IOException {
        File f = new File(path);
        f.getParentFile().mkdirs();

        try(FileOutputStream fos = new FileOutputStream(f);){        
        fos.write(key);
        fos.flush();
        fos.close();
        }catch(IOException e) {
        	log.error("IOException", e);
        }
    }

    /**
     * Gets the private key.
     *
     * @return the private key
     */
    public PrivateKey getPrivateKey() {
        return privateKey;
    }

    /**
     * Gets the public key.
     *
     * @return the public key
     */
    public PublicKey getPublicKey() {
        return publicKey;
    }

    /**
     * The main method.
     *
     * @param args the arguments
     * @throws NoSuchAlgorithmException the no such algorithm exception
     * @throws IOException Signals that an I/O exception has occurred.
     */
    public static void main(String[] args) throws NoSuchAlgorithmException, IOException {
        RSAKeyPairGenerator keyPairGenerator = new RSAKeyPairGenerator();
        keyPairGenerator.writeToFile("RSA/publicKey", keyPairGenerator.getPublicKey().getEncoded());
        keyPairGenerator.writeToFile("RSA/privateKey", keyPairGenerator.getPrivateKey().getEncoded());      
    }
}
