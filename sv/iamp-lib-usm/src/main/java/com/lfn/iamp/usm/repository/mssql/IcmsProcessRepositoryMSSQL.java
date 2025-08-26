package com.lfn.iamp.usm.repository.mssql;
import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.lfn.iamp.usm.domain.IcmsProcess;
import com.lfn.iamp.usm.repository.IcmsProcessRepository;

@Profile("mssql")
@Repository
public interface IcmsProcessRepositoryMSSQL extends IcmsProcessRepository {

	@Query(value="SELECT DISTINCT pr.process_id, pr.process_name, pr.process_display_name FROM IcmsProcess pr JOIN RoleProcess rpr ON pr.process_id = rpr.process_id.process_id JOIN UserProjectRole upr ON upr.role_id.id = rpr.role_id.id WHERE upr.user_id.id =?1 AND pr.project_id.id =?2 AND pr.is_active = TRUE")
	List<Object[]> getAllProcessesByUserRole(Integer userId, Integer projectid);

}
