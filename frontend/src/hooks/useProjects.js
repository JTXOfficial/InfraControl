import { useState, useEffect } from 'react';
import projectService from '../services/projectService';

const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const projectsData = await projectService.getAllProjects({ status: 'active' });
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loadingProjects,
    fetchProjects
  };
};

export default useProjects;