import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { Project } from '../types';
import { ProjectForm } from '../components/ProjectForm';
import { ProjectList } from '../components/ProjectList';

interface ProjectsPageProps {
  user: { id: string; email: string };
  onLogout: () => void;
}

export function ProjectsPage({ user, onLogout }: ProjectsPageProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Get auth token
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        setToken(session.access_token);
      }
    });
  }, []);

  const loadProjects = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const data = await api.get<Project[]>('/api/v1/projects', token);
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    loadProjects();
  }, [token, loadProjects]);

  const handleCreateProject = async (name: string, description: string) => {
    try {
      const newProject = await api.post<Project>(
        '/api/v1/projects',
        { name, description },
        token!,
      );
      setProjects([...projects, newProject]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await api.delete(`/api/v1/projects/${id}`, token!);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  return (
    <div className="projects-container">
      <header>
        <h1>Projects</h1>
        <div>
          <span>{user.email}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <ProjectForm onCreate={handleCreateProject} />

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : projects.length === 0 ? (
        <div className="empty-state">No projects yet. Create one above!</div>
      ) : (
        <ProjectList projects={projects} onDelete={handleDeleteProject} />
      )}
    </div>
  );
}
