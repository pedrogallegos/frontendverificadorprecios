import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import {
  FaTrashAlt, FaSearch, FaEdit, FaSignOutAlt, FaSave, FaSortUp, FaSortDown, FaSort
} from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

const URL = import.meta.env.VITE_API_BACK_END?.trim() || 'http://localhost:3001';

function Verificador({ onLogout }) {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precio, setPrecio] = useState('');
  const [codigo, setCodigo] = useState('');
  const [productos, setProductos] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [resultado, setResultado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idActual, setIdActual] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const ITEMS_POR_PAGINA = 5;
  const [orden, setOrden] = useState({ columna: 'nombre', direccion: 'asc' });

  useEffect(() => {
    const obtenerPerfil = async () => {
      try {
        const res = await fetch(`${URL}/perfil`, { credentials: 'include' });
        const data = await res.json();
        setUsuario(data.email);
      } catch {
        toast.error('No se pudo obtener el perfil');
      }
    };
    obtenerPerfil();
  }, []);

  const fetchProductos = async () => {
    try {
      const res = await fetch(`${URL}/productos`, { credentials: 'include' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProductos(data);
    } catch {
      toast.error('Error al cargar productos');
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const limpiarFormulario = () => {
    setNombre('');
    setCodigoBarras('');
    setCantidad('');
    setPrecio('');
    setCodigo('');
    setModoEdicion(false);
    setIdActual(null);
  };

  const cerrarSesion = async () => {
    try {
      await fetch(`${URL}/logout`, { method: 'POST', credentials: 'include' });
      toast.info('Sesión cerrada correctamente');
      onLogout();
      navigate('/login');
      window.location.reload();
    } catch {
      toast.error('Error al cerrar sesión');
    }
  };

  const agregarProducto = async () => {
    if (!nombre || !codigo || !precio) {
      toast.error('Completa Nombre, Código y Precio');
      return;
    }

    const producto = {
      nombre,
      codigoBarras,
      codigo,
      cantidad,
      precio: parseFloat(precio),
    };

    try {
      const res = await fetch(`${URL}/producto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(producto),
      });

      if (res.ok) {
        toast.success('Producto agregado');
        fetchProductos();
        limpiarFormulario();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Error al guardar');
      }
    } catch {
      toast.error('Error al conectar con el servidor');
    }
  };

  const actualizarProducto = async () => {
    if (!nombre || !codigo || !precio) {
      toast.error('Completa Nombre, Código y Precio');
      return;
    }

    try {
      const res = await fetch(`${URL}/producto/${idActual}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nombre,
          codigoBarras,
          codigo,
          cantidad,
          precio: parseFloat(precio),
        }),
      });

      if (res.ok) {
        toast.success('Producto actualizado');
        fetchProductos();
        limpiarFormulario();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Error al actualizar');
      }
    } catch {
      toast.error('Error al conectar con el servidor');
    }
  };

  const eliminarProducto = async (id) => {
    try {
      const res = await fetch(`${URL}/producto/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success('Producto eliminado');
        fetchProductos();
      } else {
        toast.error('Error al eliminar producto');
      }
    } catch {
      toast.error('Error al conectar con el servidor');
    }
  };

  const buscarProducto = async () => {
    if (!codigoBusqueda) {
      toast.error('Ingresa un código');
      return;
    }

    try {
      const res = await fetch(`${URL}/precio/${codigoBusqueda}`);
      const data = await res.json();

      if (res.ok) {
        setResultado(data);
      } else {
        setResultado(null);
        toast.error(data.error || 'Producto no encontrado');
      }
    } catch {
      toast.error('Error de red');
    }
  };

  const cambiarOrden = (columna) => {
    setOrden((prev) => ({
      columna,
      direccion: prev.columna === columna ? (prev.direccion === 'asc' ? 'desc' : 'asc') : 'asc',
    }));
  };

  const renderIconoOrden = (columna) => {
    if (orden.columna !== columna) return <FaSort className="inline ml-1 text-gray-400" />;
    return orden.direccion === 'asc'
      ? <FaSortUp className="inline ml-1 text-blue-600" />
      : <FaSortDown className="inline ml-1 text-blue-600" />;
  };

  const productosFiltrados = productos.filter((p) =>
    p.nombre?.toLowerCase().includes(filtroNombre.toLowerCase())
  );

  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    const valA = a[orden.columna];
    const valB = b[orden.columna];

    if (valA == null) return 1;
    if (valB == null) return -1;

    if (['precio', 'cantidad'].includes(orden.columna)) {
      return orden.direccion === 'asc' ? valA - valB : valB - valA;
    }

    return orden.direccion === 'asc'
      ? valA.toString().localeCompare(valB.toString())
      : valB.toString().localeCompare(valA.toString());
  });

  const totalPaginas = Math.ceil(productosOrdenados.length / ITEMS_POR_PAGINA);
  const productosPaginados = productosOrdenados.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

  return (
    <div className="max-w-6xl mx-auto p-6 relative min-h-screen">
      <button
        onClick={cerrarSesion}
        className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center gap-2"
      >
        <FaSignOutAlt /> Cerrar sesión
      </button>

      <h1 className="text-3xl font-bold mb-4 text-center text-blue-600">Verificador de Precios</h1>
      {usuario && (
        <p className="text-center mb-6 text-gray-700">
          Sesión iniciada como: <strong>{usuario}</strong>
        </p>
      )}

      {/* Aquí puedes insertar el formulario, la tabla de productos y la paginación */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Verificador;