import { useState } from 'react';

const URL = import.meta.env.VITE_API_BACK_END || 'http://localhost:3001';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const res = await fetch(`${URL}/login`, {
        method: 'POST',
        credentials: 'include', // Necesario para enviar cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        setError('');
        onLoginSuccess();
      } else {
        const data = await res.json();
        setError(data.error || 'Inicio de sesión fallido');
      }
    } catch (err) {
      console.error('Error de conexión:', err);
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div className="max-w-sm mx-auto p-4 bg-white rounded shadow mt-10">
      <h2 className="text-xl font-bold mb-4">Iniciar Sesión</h2>
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-2 w-full p-2 border rounded"
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-2 w-full p-2 border rounded"
      />
      <button
        onClick={handleLogin}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        Ingresar
      </button>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}

export default Login;