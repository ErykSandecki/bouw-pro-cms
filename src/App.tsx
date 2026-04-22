import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useFirebase } from "./contexts/FirebaseContext";
import LoginPage from "./pages/LoginPage";
import CreateProjectPage from "./pages/CreateProjectPage";
import ProjectListPage from "./pages/ProjectListPage";
import ProjectDetailsPage from "./pages/ProjectDetailsPage";
import ProjectPicturesPage from "./pages/ProjectPicturesPage";

function App() {
  const { app } = useFirebase();
  const navigate = useNavigate();
  const [authReady, setAuthReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(app), async (user) => {
      if (user) {
        const token = await user.getIdToken();
        localStorage.setItem("bouwpro_auth_token", token);
        setAuthed(true);
        navigate("/create-project", { replace: true });
      } else {
        localStorage.removeItem("bouwpro_auth_token");
        setAuthed(false);
        navigate("/login", { replace: true });
      }
      setAuthReady(true);
    });
    return unsubscribe;
  }, [app]);

  if (!authReady) return null;

  return (
    <Routes>
      <Route
        path="/login"
        element={
          authed ? (
            <Navigate to="/create-project" replace />
          ) : (
            <LoginPage
              onLogin={() => navigate("/create-project", { replace: true })}
            />
          )
        }
      />
      <Route
        path="/create-project"
        element={
          authed ? (
            <CreateProjectPage
              onLogout={() => navigate("/login", { replace: true })}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/projects"
        element={
          authed ? (
            <ProjectListPage
              onLogout={() => navigate("/login", { replace: true })}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/project-details/:id"
        element={
          authed ? (
            <ProjectDetailsPage
              onLogout={() => navigate("/login", { replace: true })}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/project-pictures/:id"
        element={
          authed ? (
            <ProjectPicturesPage
              onLogout={() => navigate("/login", { replace: true })}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="*"
        element={
          <Navigate to={authed ? "/create-project" : "/login"} replace />
        }
      />
    </Routes>
  );
}

export default App;
