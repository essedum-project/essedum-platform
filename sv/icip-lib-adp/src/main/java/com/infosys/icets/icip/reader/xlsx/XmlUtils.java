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
package com.infosys.icets.icip.reader.xlsx;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

import javax.xml.XMLConstants;
import javax.xml.namespace.NamespaceContext;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;

import org.apache.poi.ooxml.util.DocumentHelper;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import com.infosys.icets.icip.reader.exceptions.ParseException;

// TODO: Auto-generated Javadoc
/**
 * The Class XmlUtils.
 */
@Component
public class XmlUtils {
	
	/**
	 * Instantiates a new xml utils.
	 */
	private XmlUtils() {
		// Avoid instantiation of the class since its a Utility class
	}

	/**
	 * Document.
	 *
	 * @param is the is
	 * @return the document
	 */
	public static Document document(InputStream is) {
		try {
			return DocumentHelper.readDocument(is);
		} catch (SAXException | IOException e) {
			throw new ParseException(e);
		}
	}

	/**
	 * Search for node list.
	 *
	 * @param document the document
	 * @param xpath the xpath
	 * @return the node list
	 */
	public static NodeList searchForNodeList(Document document, String xpath) {
		try {
			XPath xp = XPathFactory.newInstance().newXPath();
			NamespaceContextImpl nc = new NamespaceContextImpl();
			nc.addNamespace("ss", "http://schemas.openxmlformats.org/spreadsheetml/2006/main");
			xp.setNamespaceContext(nc);
			return (NodeList) xp.compile(xpath).evaluate(document, XPathConstants.NODESET);
		} catch (XPathExpressionException e) {
			throw new ParseException(e);
		}
	}

	/**
	 * The Class NamespaceContextImpl.
	 */
	private static class NamespaceContextImpl implements NamespaceContext {
		
		/** The uris by prefix. */
		private Map<String, String> urisByPrefix = new HashMap<String, String>();

		/** The prefixes by URI. */
		private Map<String, Set> prefixesByURI = new HashMap<String, Set>();

		/**
		 * Instantiates a new namespace context impl.
		 */
		public NamespaceContextImpl() {
			addNamespace(XMLConstants.XML_NS_PREFIX, XMLConstants.XML_NS_URI);
			addNamespace(XMLConstants.XMLNS_ATTRIBUTE, XMLConstants.XMLNS_ATTRIBUTE_NS_URI);
		}

		/**
		 * Adds the namespace.
		 *
		 * @param prefix the prefix
		 * @param namespaceURI the namespace URI
		 */
		private void addNamespace(String prefix, String namespaceURI) {
			urisByPrefix.put(prefix, namespaceURI);
			if (prefixesByURI.containsKey(namespaceURI)) {
				(prefixesByURI.get(namespaceURI)).add(prefix);
			} else {
				Set<String> set = new HashSet<String>();
				set.add(prefix);
				prefixesByURI.put(namespaceURI, set);
			}
		}

		/**
		 * Gets the namespace URI.
		 *
		 * @param prefix the prefix
		 * @return the namespace URI
		 */
		public String getNamespaceURI(String prefix) {
			if (prefix == null)
				throw new IllegalArgumentException("prefix cannot be null");
			if (urisByPrefix.containsKey(prefix))
				return (String) urisByPrefix.get(prefix);
			else
				return XMLConstants.NULL_NS_URI;
		}

		/**
		 * Gets the prefix.
		 *
		 * @param namespaceURI the namespace URI
		 * @return the prefix
		 */
		public String getPrefix(String namespaceURI) {
			return (String) getPrefixes(namespaceURI).next();
		}

		/**
		 * Gets the prefixes.
		 *
		 * @param namespaceURI the namespace URI
		 * @return the prefixes
		 */
		public Iterator getPrefixes(String namespaceURI) {
			if (namespaceURI == null)
				throw new IllegalArgumentException("namespaceURI cannot be null");
			if (prefixesByURI.containsKey(namespaceURI)) {
				return ((Set) prefixesByURI.get(namespaceURI)).iterator();
			} else {
				return Collections.EMPTY_SET.iterator();
			}
		}
	}
}
