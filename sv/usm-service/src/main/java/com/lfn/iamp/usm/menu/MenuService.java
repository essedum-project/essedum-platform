package com.lfn.iamp.usm.menu;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.lfn.iamp.usm.access.AccessContextService;

/**
 * menuFor(userId) == filter by min_role_rank <= caller's rank, order by
 * displayOrder. Replaces the sidebar's `if (role.name == "X")` chain. §7.
 */
@Service
public class MenuService {

	private final MenuItemRepository menuItemRepository;
	private final AccessContextService accessContextService;

	public MenuService(MenuItemRepository menuItemRepository, AccessContextService accessContextService) {
		this.menuItemRepository = menuItemRepository;
		this.accessContextService = accessContextService;
	}

	public List<MenuItem> menuFor(Integer userId) {
		int rank = accessContextService.highestRank(userId);
		return menuItemRepository.findAll().stream()
				.filter(item -> item.getMinRoleRank() <= rank)
				.sorted(Comparator.comparing(MenuItem::getParentId, Comparator.nullsFirst(Integer::compareTo))
						.thenComparing(MenuItem::getDisplayOrder))
				.collect(Collectors.toList());
	}
}
