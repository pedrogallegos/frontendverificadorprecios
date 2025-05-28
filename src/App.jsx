import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login';
import Verificador from './Verificador';
import Registro from './Registro';

function App() {
  const [logueado, setLogueado] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const navigate = useNavigate();

  // ✅ Reemplaza con tu URL de backend desplegado
  const API_URL = 'https://backendverificadorprecios-production.up.railway.app';

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const res = await fetch(`${API_URL}/productos`, {
          method: 'GET',
          credentials: 'include',
        });

        setLogueado(res.ok);
        if (res.ok) navigate('/verificador');
      } catch (error) {
        console.error('Error al verificar sesión:', error);
        setLogueado(false);
      } finally {
        setVerificando(false);
      }
    };

    verificarSesion();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
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