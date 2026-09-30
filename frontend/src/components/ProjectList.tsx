import { Project } from '../types';

interface ProjectListProps {
  projects: Project[];
  onDelete: (id: string) => Promise<void>;
}

export function ProjectList({ projects, onDelete }: ProjectListProps) {
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      await onDelete(id);
    }
  };

  return (
    <div className="project-list">
      <h2>Your Projects</h2>
      <ul>
        {projects.map((project) => (
          <li key={project.id} className="project-card">
            <div>
              <h3>{project.name}</h3>
              {project.description && <p>{project.description}</p>}
              <small>
                Created {new Date(project.created_at).toLocaleDateString()}
              </small>
            </div>
            <button onClick={() => handleDelete(project.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
