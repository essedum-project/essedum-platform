package com.lfn.iamp.usm.menu;

import java.util.List;

/**
 * A flat view of one legacy sidebar menu item stored in usm_constant
 * (item = "&lt;Role&gt; Side", item_value = JSON). This is the live source the
 * non-admin sidebars render from, so editing it through Menu Configuration is
 * reflected immediately — no migration, single source of truth.
 */
public class RoleMenuDto {
	private Integer id;
	/** Role display name, i.e. the usm_constant "item" with the trailing " Side" stripped. */
	private String role;
	private String project;
	private String label;
	private String icon;
	private String url;
	private boolean hasChildren;
	/**
	 * Full children array from the sidebar JSON — preserved on create so that
	 * navigation works for items whose real URL lives in a child node.
	 */
	private List<Object> children;

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

	public String getProject() {
		return project;
	}

	public void setProject(String project) {
		this.project = project;
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	public String getIcon() {
		return icon;
	}

	public void setIcon(String icon) {
		this.icon = icon;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public boolean isHasChildren() {
		return hasChildren;
	}

	public void setHasChildren(boolean hasChildren) {
		this.hasChildren = hasChildren;
	}

	public List<Object> getChildren() {
		return children;
	}

	public void setChildren(List<Object> children) {
		this.children = children;
	}
}
