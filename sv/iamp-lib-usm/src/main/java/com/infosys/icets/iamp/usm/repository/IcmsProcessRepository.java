package com.infosys.icets.iamp.usm.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.stereotype.Repository;

import com.infosys.icets.iamp.usm.domain.IcmsProcess;

@NoRepositoryBean
public interface IcmsProcessRepository extends JpaRepository<IcmsProcess, Integer> {

//	@Query(value="SELECT DISTINCT pr.process_id, pr.process_name, pr.process_display_name FROM IcmsProcess pr JOIN RoleProcess rpr ON pr.process_id = rpr.process_id.process_id JOIN UserProjectRole upr ON upr.role_id.id = rpr.role_id WHERE upr.user_id.id =?1 AND pr.project_id.id =?2 AND pr.is_active = 1")
	List<Object[]> getAllProcessesByUserRole(Integer userId, Integer projectid);

}
