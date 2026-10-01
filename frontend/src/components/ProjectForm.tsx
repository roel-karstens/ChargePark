import { useForm } from 'react-hook-form';

interface ProjectFormProps {
  onCreate: (name: string, description: string) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

interface ProjectFormInputs {
  name: string;
  description: string;
}

export function ProjectForm({ onCreate, isLoading = false, error: externalError }: ProjectFormProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProjectFormInputs>({
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (data: ProjectFormInputs) => {
    try {
      await onCreate(data.name, data.description);
      reset();
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  const loading = isLoading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Create New Project</h2>
        <p className="text-sm text-muted-foreground mt-1">Add a new project to your dashboard</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="label">
            Project Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="My Awesome Project"
            className="input"
            disabled={loading}
            {...register('name', {
              required: 'Project name is required',
              minLength: {
                value: 1,
                message: 'Project name cannot be empty',
              },
            })}
          />
          {errors.name && <span className="error">{errors.name.message}</span>}
        </div>

        <div>
          <label htmlFor="description" className="label">
            Description <span className="text-muted-foreground text-sm font-normal">(optional)</span>
          </label>
          <textarea
            id="description"
            placeholder="What is this project about?"
            className="input resize-none"
            rows={3}
            disabled={loading}
            {...register('description')}
          />
          {errors.description && <span className="error">{errors.description.message}</span>}
        </div>

        {externalError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-800">{externalError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Creating...' : 'Create Project'}
        </button>
      </div>
    </form>
  );
}
