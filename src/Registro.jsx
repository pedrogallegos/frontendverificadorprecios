import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// ✅ Usa variable de entorno para distinguir entre local y producción
const URL = import.meta.env.VITE_API_BACK_END?.trim() || 'http://localhost:3001';

function Registro() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const registrar = async () => {
    if (!email || !password) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    try {
      const res = await fetch(`${URL}/crear-usuario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Usuario registrado correctamente');
        navigate('/login');
      } else {
        toast.error(data.error || 'Error al registrar');
      }
    } catch (err) {
      console.error('Error de red:', err);
      toast.error('No se pudo conectar con el servidor');
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Registro de Usuario</h2>
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
        required
      />
      <button
        onClick={registrar}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        Registrarse
      </button>
    </div>
  );
}

export default Registro;