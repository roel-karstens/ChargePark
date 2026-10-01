import { Trash2 } from 'lucide-react';
import { Project } from '../types';

interface ProjectListProps {
  projects: Project[];
  onDelete: (id: string) => Promise<void>;
  isDeleting?: boolean;
}

export function ProjectList({ projects, onDelete, isDeleting = false }: ProjectListProps) {
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      await onDelete(id);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-4">Your Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="card hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col h-full">
              <div className="flex-1 mb-4">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {project.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Created {new Date(project.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <button
                onClick={() => handleDelete(project.id)}
                disabled={isDeleting}
                className="mt-auto flex items-center justify-center gap-2 w-full px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                aria-label={`Delete project ${project.name}`}
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
