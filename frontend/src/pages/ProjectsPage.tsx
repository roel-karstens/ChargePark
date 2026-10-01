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

const DEV_MODE = import.meta.env.MODE === 'development';

export function ProjectsPage({ user, onLogout }: ProjectsPageProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(true);

  useEffect(() => {
    // Get initial session and listen for auth state changes
    const getInitialSession = async () => {
      try {
        if (DEV_MODE && localStorage.getItem('sb-dev-token')) {
          // Dev mode: get token from backend
          console.log('📝 Dev mode: requesting test token from backend...');
          const response = await fetch('http://localhost:8000/api/v1/dev/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id }),
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Dev token retrieved:', data.token.substring(0, 20) + '...');
            setToken(data.token);
          } else {
            console.error('Failed to get dev token');
            setError('Failed to get dev token');
          }
          setTokenLoading(false);
        } else {
          // Production: first try to get existing session
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            console.log('✅ Token retrieved from Supabase (initial):', session.access_token.substring(0, 20) + '...');
            setToken(session.access_token);
            setTokenLoading(false);
          } else {
            // No initial session, wait for auth state changes
            console.log('📝 No initial session, listening for auth changes...');
            const { data: authListener } = supabase.auth.onAuthStateChange(
              async (event, session) => {
                if (session?.access_token) {
                  console.log('✅ Token retrieved from Supabase (event:', event, '):', session.access_token.substring(0, 20) + '...');
                  setToken(session.access_token);
                } else if (event !== 'INITIAL_SESSION') {
                  console.warn('❌ No token found in session (event:', event, ')');
                  setError('Not authenticated - no token in session');
                }
                setTokenLoading(false);
              }
            );
            
            return () => {
              authListener?.subscription.unsubscribe();
            };
          }
        }
      } catch (err) {
        console.error('Error getting token:', err);
        setError('Error getting authentication token');
        setTokenLoading(false);
      }
    };

    getInitialSession();
  }, [user.id]);

  const loadProjects = useCallback(async () => {
    if (!token) {
      console.warn('⚠️ loadProjects called but token is null');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('📡 Fetching projects...');
      const data = await api.get<Project[]>('/api/v1/projects', token);
      console.log('✅ Projects loaded:', data);
      setProjects(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load projects';
      console.error('❌ Error loading projects:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token || tokenLoading) return;
    loadProjects();
  }, [token, tokenLoading, loadProjects]);

  const handleCreateProject = async (name: string, description: string) => {
    if (!token) {
      setError('Not authenticated - token not available');
      return;
    }
    try {
      console.log('📝 Creating project...');
      const newProject = await api.post<Project>(
        '/api/v1/projects',
        { name, description },
        token,
      );
      console.log('✅ Project created:', newProject);
      setProjects([...projects, newProject]);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create project';
      console.error('❌ Error creating project:', message);
      setError(message);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!token) {
      setError('Not authenticated - token not available');
      return;
    }
    try {
      await api.delete(`/api/v1/projects/${id}`, token);
      setProjects(projects.filter((p) => p.id !== id));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete project';
      console.error('❌ Error deleting project:', message);
      setError(message);
    }
  };

  const handleLogout = async () => {
    if (DEV_MODE) {
      localStorage.removeItem('sb-dev-token');
    } else {
      await supabase.auth.signOut();
    }
    onLogout();
  };

  if (tokenLoading) {
    return <div>Authenticating...</div>;
  }

  return (
    <div className="projects-container">
      <header>
        <h1>Projects</h1>
        <div>
          <span>{user.email}</span>
          {DEV_MODE && <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>🚀 Dev Mode</span>}
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
