/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

//package com.lfn.iamp.usm.repository;
//
//import java.util.List;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.stereotype.Repository;
//
//import com.lfn.iamp.usm.domain.Delegate;
//
//@Repository("usmDelegateRepository")
//public interface DelegateRepository extends JpaRepository<Delegate, Integer> {
//	
//	@Query(value = "SELECT c from Delegate c WHERE c.process_id=?1 AND c.login_id.id=?2 AND c.project_id.id =?3")
//	public List<Delegate> findByProcessIdAndLoginId(Integer process_id, Integer login_id, Integer project_id);
//	
//	@Query(value = "SELECT c from Delegate c WHERE c.login_id.id=?1 AND c.project_id.id =?2")
//	public List<Delegate> findAllByLoginId(Integer login_id, Integer project_id);
//	
//}


