import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChargingHomePage } from './pages/ChargingHomePage';
import { ChargingResultsPage } from './pages/ChargingResultsPage';
import './App.css';

/**
 * ChargePark MVP App
 *
 * Routes:
 * - / → HomePage (search)
 * - /results → ResultsPage (results with map + list)
 *
 * No authentication in MVP (stateless searches)
 */
export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChargingHomePage />} />
        <Route path="/results" element={<ChargingResultsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
          email: session.user.email || '',
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen bg-background">
        {user ? (
          <ProjectsPage
            user={user}
            onLogout={() => setUser(null)}
          />
        ) : (
          <AuthPage onAuthSuccess={(newUser) => setUser(newUser)} />
        )}
      </main>
    </QueryClientProvider>
  );
}
