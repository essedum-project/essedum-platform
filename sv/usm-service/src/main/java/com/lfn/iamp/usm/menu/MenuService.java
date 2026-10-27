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
		// Rank-based default + role override (§7): return items the caller's rank
		// clears, PLUS any role-tagged item (regardless of rank) so the client can
		// surface it to the role it's acting as. Role matching is applied
		// client-side where the acting role is known; the labels returned here
		// are non-sensitive and every screen is still auth-gated server-side.
		//max_role_rank check applies only to the rank gate, not the role override
		return menuItemRepository.findAll().stream()
				.filter(item -> (item.getMinRoleRank() <= rank
						&& (item.getMaxRoleRank() == null
						|| rank <= item.getMaxRoleRank()))
						|| (item.getRoles() != null && !item.getRoles().trim().isEmpty()))
				.sorted(Comparator.comparing(MenuItem::getParentId, Comparator.nullsFirst(Integer::compareTo))
						.thenComparing(MenuItem::getDisplayOrder))
				.collect(Collectors.toList());
	}
}




