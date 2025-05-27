import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { FaTrashAlt, FaSearch, FaEdit, FaSignOutAlt, FaSave, FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

function Verificador({ onLogout }) {
  const navigate = useNavigate();

  // Estados principales
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

  // Paginación y orden
  const [paginaActual, setPaginaActual] = useState(1);
  const ITEMS_POR_PAGINA = 5;
  const [orden, setOrden] = useState({ columna: 'nombre', direccion: 'asc' });

  useEffect(() => {
    const obtenerPerfil = async () => {
      try {
        const res = await fetch('http://localhost:3001/perfil', {
          credentials: 'include',
        });
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
      const res = await fetch('http://localhost:3001/productos', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Error al cargar productos');
      const data = await res.json();
      setProductos(data);
    } catch {
      toast.error('Error al cargar productos');
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const cambiarOrden = (columna) => {
    if (orden.columna === columna) {
      setOrden({
        columna,
        direccion: orden.direccion === 'asc' ? 'desc' : 'asc',
      });
    } else {
      setOrden({ columna, direccion: 'asc' });
    }
  };

  const renderIconoOrden = (columna) => {
    if (orden.columna !== columna) return <FaSort className="inline ml-1 text-gray-400" />;
    return orden.direccion === 'asc' ? (
      <FaSortUp className="inline ml-1 text-blue-600" />
    ) : (
      <FaSortDown className="inline ml-1 text-blue-600" />
    );
  };

  const productosFiltrados = productos.filter((p) =>
    p.nombre?.toLowerCase().includes(filtroNombre.toLowerCase())
  );

  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    const valA = a[orden.columna];
    const valB = b[orden.columna];

    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    if (orden.columna === 'precio' || orden.columna === 'cantidad') {
      return orden.direccion === 'asc' ? valA - valB : valB - valA;
    }

    const compA = valA.toString().toLowerCase();
    const compB = valB.toString().toLowerCase();

    if (compA < compB) return orden.direccion === 'asc' ? -1 : 1;
    if (compA > compB) return orden.direccion === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPaginas = Math.ceil(productosOrdenados.length / ITEMS_POR_PAGINA);
  const productosPaginados = productosOrdenados.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

  const paginaAnterior = () => {
    setPaginaActual((prev) => (prev > 1 ? prev - 1 : prev));
  };
  const paginaSiguiente = () => {
    setPaginaActual((prev) => (prev < totalPaginas ? prev + 1 : prev));
  };
  const irAPagina = (num) => {
    if (num >= 1 && num <= totalPaginas) {
      setPaginaActual(num);
    }
  };

  const cerrarSesion = async () => {
    try {
      await fetch('http://localhost:3001/logout', {
        method: 'POST',
        credentials: 'include',
      });
      toast.info('Sesión cerrada correctamente');
      onLogout();
      navigate('/login');
      window.location.reload();
    } catch (err) {
      toast.error('Error al cerrar sesión');
    }
  };

  const limpiarFormulario = () => {
    setNombre('');
    setCodigoBarras('');
    setCantidad('');
    setPrecio('');
    setCodigo('');
    setModoEdicion(false);
    setIdActual(null);
  };

  const agregarProducto = async () => {
    if (!nombre.trim() || !codigo.trim() || !precio) {
      toast.error('Por favor completa los campos obligatorios: Nombre, Código y Precio');
      return;
    }
    const producto = { nombre, codigoBarras, codigo, cantidad, precio: parseFloat(precio) };
    try {
      const res = await fetch('http://localhost:3001/producto', {
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
    if (!nombre.trim() || !codigo.trim() || !precio) {
      toast.error('Por favor completa los campos obligatorios: Nombre, Código y Precio');
      return;
    }
    try {
      const res = await fetch(`http://localhost:3001/producto/${idActual}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nombre, codigoBarras, codigo, cantidad, precio: parseFloat(precio) }),
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

  const editarProducto = (producto) => {
    setNombre(producto.nombre);
    setCodigoBarras(producto.codigoBarras);
    setCantidad(producto.cantidad);
    setPrecio(producto.precio);
    setCodigo(producto.codigo);
    setIdActual(producto.id);
    setModoEdicion(true);
  };

  const eliminarProducto = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/producto/${id}`, {
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
    if (!codigoBusqueda.trim()) {
      toast.error('Ingresa un código para buscar');
      return;
    }
    try {
      const res = await fetch(`http://localhost:3001/precio/${codigoBusqueda}`);
      if (!res.ok) {
        const data = await res.json();
        setResultado(null);
        toast.error(data.error || 'Producto no encontrado');
        return;
      }
      const data = await res.json();
      setResultado(data);
    } catch {
      toast.error('Error al conectar con el servidor');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 relative min-h-screen">
      <button
        onClick={cerrarSesion}
        className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center gap-2"
      >
        <FaSignOutAlt /> Cerrar sesión
      </button>

      <h1 className="text-3xl font-bold mb-4 text-center text-blue-600">
        Verificador de Precios
      </h1>

      {usuario && (
        <p className="text-center mb-6 text-gray-700">
          Sesión iniciada como: <strong>{usuario}</strong>
        </p>
      )}

      <form
        className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6 max-w-6xl mx-auto items-end"
        onSubmit={(e) => {
          e.preventDefault();
          modoEdicion ? actualizarProducto() : agregarProducto();
        }}
      >
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="border rounded px-3 py-2"
          required
        />
        <input
          type="text"
          placeholder="Código de Barras"
          value={codigoBarras}
          onChange={(e) => setCodigoBarras(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <input
          type="number"
          placeholder="Cantidad"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          className="border rounded px-3 py-2"
          min="0"
          required
        />
        <input
          type="number"
          placeholder="Precio"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          className="border rounded px-3 py-2"
          step="0.01"
          min="0"
          required
        />
        <input
          type="text"
          placeholder="Código"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          className="border rounded px-3 py-2"
          required
        />
        <button
          type="submit"
          className={`bg-blue-600 text-white rounded px-6 py-2 hover:bg-blue-700 transition ${
            modoEdicion ? 'bg-yellow-500 hover:bg-yellow-600' : ''
          }`}
        >
          {modoEdicion ? (
            <>
              <FaSave className="inline mr-2" /> Actualizar producto
            </>
          ) : (
            <>
              <FaSave className="inline mr-2" /> Guardar
            </>
          )}
        </button>
      </form>

      <div className="max-w-md mx-auto mb-6">
        <input
          type="text"
          placeholder="Buscar producto por código"
          value={codigoBusqueda}
          onChange={(e) => setCodigoBusqueda(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-2"
        />
        <button
          onClick={buscarProducto}
          className="bg-green-600 text-white px-6 py-2 rounded w-auto hover:bg-green-700 flex justify-center gap-2"
        >
          <FaSearch /> Consultar
        </button>
        {resultado && (
          <div className="mt-4 p-4 bg-green-50 text-green-800 border rounded">
            <p>
              <strong>Nombre:</strong> {resultado.nombre}
            </p>
            <p>
              <strong>Precio:</strong> ${resultado.precio.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      <input
        type="text"
        placeholder="Buscar por nombre"
        value={filtroNombre}
        onChange={(e) => setFiltroNombre(e.target.value)}
        className="w-full max-w-md mx-auto border rounded px-3 py-2 mb-6 block"
      />

      <div className="max-w-6xl mx-auto overflow-x-auto">
        <table className="table-auto min-w-full border text-left text-sm">
          <thead className="bg-gray-100 font-semibold cursor-pointer select-none">
            <tr>
              <th className="border px-2 py-2" onClick={() => cambiarOrden('codigo')}>
                Código {renderIconoOrden('codigo')}
              </th>
              <th className="border px-2 py-2" onClick={() => cambiarOrden('nombre')}>
                Nombre {renderIconoOrden('nombre')}
              </th>
              <th className="border px-2 py-2" onClick={() => cambiarOrden('codigoBarras')}>
                Barras {renderIconoOrden('codigoBarras')}
              </th>
              <th className="border px-2 py-2" onClick={() => cambiarOrden('cantidad')}>
                Cantidad {renderIconoOrden('cantidad')}
              </th>
              <th className="border px-2 py-2" onClick={() => cambiarOrden('precio')}>
                Precio {renderIconoOrden('precio')}
              </th>
              <th className="border px-2 py-2 text-center" style={{ width: '120px', minWidth: '110px' }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {productosPaginados.map((p, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="border px-2 py-2">{p.codigo}</td>
                <td className="border px-2 py-2">{p.nombre}</td>
                <td className="border px-2 py-2">{p.codigoBarras || 'na'}</td>
                <td className="border px-2 py-2">{p.cantidad}</td>
                <td className="border px-2 py-2">${Number(p.precio).toFixed(2)}</td>
                <td
                  className="border px-2 py-2 flex flex-col gap-2 items-center justify-center"
                  style={{ width: '120px', minWidth: '110px' }}
                >
                  <button
                    onClick={() => editarProducto(p)}
                    aria-label="Editar producto"
                    title="Editar producto"
                    className="inline-flex bg-yellow-500 text-white px-5 py-2 rounded hover:bg-yellow-600 items-center"
                  >
                    <FaEdit size={16} />
                  </button>
                  <button
                    onClick={() => eliminarProducto(p.id)}
                    aria-label="Eliminar producto"
                    title="Eliminar producto"
                    className="inline-flex bg-red-500 text-white px-5 py-2 rounded hover:bg-red-600 items-center"
                  >
                    <FaTrashAlt size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="max-w-6xl mx-auto flex justify-center items-center gap-2 mt-4 select-none flex-wrap">
        <button
          onClick={paginaAnterior}
          disabled={paginaActual === 1}
          className={`px-4 py-2 rounded border ${
            paginaActual === 1
              ? 'text-gray-400 border-gray-300 cursor-not-allowed'
              : 'text-blue-600 border-blue-600 hover:bg-blue-100'
          }`}
        >
          Anterior
        </button>

        {[...Array(totalPaginas).keys()].map((num) => (
          <button
            key={num + 1}
            onClick={() => irAPagina(num + 1)}
            className={`px-4 py-2 rounded border ${
              paginaActual === num + 1
                ? 'bg-blue-600 text-white border-blue-600'
                : 'text-blue-600 border-blue-600 hover:bg-blue-100'
            }`}
          >
            {num + 1}
          </button>
        ))}

        <button
          onClick={paginaSiguiente}
          disabled={paginaActual === totalPaginas || totalPaginas === 0}
          className={`px-4 py-2 rounded border ${
            paginaActual === totalPaginas || totalPaginas === 0
              ? 'text-gray-400 border-gray-300 cursor-not-allowed'
              : 'text-blue-600 border-blue-600 hover:bg-blue-100'
          }`}
        >
          Siguiente
        </button>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Verificador;