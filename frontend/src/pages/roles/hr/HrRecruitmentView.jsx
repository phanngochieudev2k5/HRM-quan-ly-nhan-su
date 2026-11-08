import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Briefcase, Users, RefreshCw } from 'lucide-react';
import HrService from '../../../services/HrService';
import RecruitmentJobs from './components/RecruitmentJobs';
import CandidateKanban from './components/CandidateKanban';
import Toast from './components/Toast';
import '../../../styles/roles/hr/HrRecruitmentView.css';

export default function HrRecruitmentView({
  subModule: propSubModule = 'jobs',
  onNavigate
}) {
  const navigate = useNavigate();
  const routeParams = useParams();
  const [searchParams] = useSearchParams();

  const currentSubModule = routeParams.subModule || searchParams.get('subModule') || propSubModule || 'jobs';

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [candidateCount, setCandidateCount] = useState(0);

  const [toast, setToast] = useState(null);
  const [selectedJobIdForKanban, setSelectedJobIdForKanban] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadSharedData = useCallback(async () => {
    try {
      const [depts, empsRes, jobsList, candidatesList] = await Promise.all([
        HrService.getDepartments().catch(() => []),
        HrService.getEmployees({ limit: 100 }).catch(() => ({ employees: [] })),
        HrService.getRecruitmentJobs().catch(() => []),
        HrService.getCandidates().catch(() => [])
      ]);

      if (depts && depts.length > 0) setDepartments(depts);
      if (empsRes?.employees) setEmployees(empsRes.employees);
      else if (Array.isArray(empsRes)) setEmployees(empsRes);
      if (jobsList && jobsList.length > 0) setJobs(jobsList);
      if (Array.isArray(candidatesList)) setCandidateCount(candidatesList.length);
    } catch (err) {
      console.warn(err.message);
    }
  }, []);

  useEffect(() => {
    loadSharedData();
  }, [loadSharedData]);

  const handleTabChange = (targetSub) => {
    if (onNavigate) {
      onNavigate('hr-recruitment', targetSub);
    } else {
      navigate(`/hr/recruitment/${targetSub}`);
    }
  };

  const handleNavigateToKanbanWithJob = (jobId) => {
    setSelectedJobIdForKanban(jobId);
    handleTabChange('candidates');
  };

  return (
    <div className="hr-recruitment-container">
      <div className="attendance-tabs-header">
        <button
          className={`attendance-tab-btn ${currentSubModule === 'jobs' ? 'active' : ''}`}
          onClick={() => handleTabChange('jobs')}
        >
          <Briefcase size={16} />
          <span>Vị trí tuyển dụng & Chỉ tiêu</span>
          <span className="badge b-p" style={{ marginLeft: '6px' }}>
            {jobs.length}
          </span>
        </button>

        <button
          className={`attendance-tab-btn ${currentSubModule === 'candidates' ? 'active' : ''}`}
          onClick={() => handleTabChange('candidates')}
        >
          <Users size={16} />
          <span>Pipeline ứng viên - Kanban</span>
          <span className="badge b-blue" style={{ marginLeft: '6px' }}>
            {candidateCount}
          </span>
        </button>
      </div>

      {currentSubModule === 'candidates' ? (
        <CandidateKanban
          jobs={jobs}
          employees={employees}
          initialJobId={selectedJobIdForKanban}
          showToast={showToast}
        />
      ) : (
        <RecruitmentJobs
          departments={departments}
          onNavigateCandidates={handleNavigateToKanbanWithJob}
          showToast={showToast}
        />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
