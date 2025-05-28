
import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login';
import Verificador from './Verificador';
import Registro from './Registro';

const URL = import.meta.env.VITE_API_BACK_END;

function App() {
  const [logueado, setLogueado] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const res = await fetch(`${URL}/productos`, {
          method: 'GET',
          credentials: 'include',
        });

        setLogueado(res.ok);
        if (res.ok) navigate('/verificador');
      } catch {
        setLogueado(false);
      } finally {
        setVerificando(false);
      }
    };

    verificarSesion();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch(`${URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      console.error('Error al cerrar sesión');
    } finally {
      setLogueado(false);
      navigate('/login');
    }
  };

  if (verificando) {
    return <p className="text-center mt-10">Verificando sesión...</p>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          logueado ? (
            <Navigate to="/verificador" />
          ) : (
            <Login onLoginSuccess={() => setLogueado(true)} />
          )
        }
      />
      <Route path="/registro" element={<Registro />} />
      <Route
        path="/verificador"
        element={
          logueado ? (
            <Verificador onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route path="*" element={<Navigate to={logueado ? '/verificador' : '/login'} />} />
    </Routes>
  );
}

export default App;
