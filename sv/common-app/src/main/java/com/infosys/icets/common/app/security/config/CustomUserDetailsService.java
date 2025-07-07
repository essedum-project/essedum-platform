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
package com.infosys.icets.common.app.security.config;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.infosys.icets.iamp.usm.domain.Users;
import com.infosys.icets.iamp.usm.service.UsersService;

// 
/**
 * The Class UserDetailsServiceCommon.
 *
 * @author icets
 */
@Service
class CustomUserDetailsService implements UserDetailsService {

	/** The user service. */
	@Autowired
	private UsersService userService;

	/**
	 * Load user by username.
	 *
	 * @param username the username
	 * @return the user details
	 * @throws UsernameNotFoundException the username not found exception
	 */
	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		Users user = userService.findByUserLogin(username);
		List<GrantedAuthority> grantedAuthorities = new ArrayList<>();
		grantedAuthorities.add(() -> "USER_ROLE");
		if (user == null)
			throw new UsernameNotFoundException(username);
		return new User(user.getUser_login(), user.getPassword(), grantedAuthorities);
	}

}