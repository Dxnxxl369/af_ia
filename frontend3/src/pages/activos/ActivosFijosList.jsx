// src/pages/activos/ActivosFijosList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Box, Plus, Edit, Trash2, Loader, DollarSign, Tag, MapPin, CheckSquare, UploadCloud } from 'lucide-react';
import { 
    getActivosFijos, createActivoFijo, updateActivoFijo, deleteActivoFijo,
    getItemsCatalogo, getEstados, getUbicaciones, getProveedores, getDepartamentos
} from '../../api/dataService';
import Modal from '../../components/Modal';
import { useNotification } from '../../context/NotificacionContext';
import { usePermissions } from '../../hooks/usePermissions'; 
import SearchBar from '../../components/SearchBar';
import { useDebounce } from '../../hooks/useDebounce';

const FormInput = ({ label, ...props }) => (
    <div className="flex flex-col">
        <label className="text-sm font-medium text-secondary mb-1.5">{label}</label>
        <input {...props} className="w-full p-3 bg-tertiary rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent" />
    </div>
);

const FormSelect = ({ label, children, ...props }) => (
    <div className="flex flex-col">
        <label className="text-sm font-medium text-secondary mb-1.5">{label}</label>
        <select {...props} className="w-full p-3 bg-tertiary rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent appearance-none">
            <option value="" disabled>-- Seleccione --</option>
            {children}
        </select>
    </div>
);

const FormFileInput = ({ label, onChange, fileName }) => (
    <div className="flex flex-col">
        <label className="text-sm font-medium text-secondary mb-1.5">{label}</label>
        <label className="w-full p-3 bg-tertiary rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent flex items-center justify-center cursor-pointer hover:bg-theme">
            <UploadCloud size={18} className="mr-2" />
            <span className="text-sm">
                {fileName ? fileName : 'Seleccionar foto (Opcional)'}
            </span>
            <input 
                type="file"
                accept="image/*"
                onChange={onChange}
                className="hidden"
            />
        </label>
    </div>
);


// --- Formulario de Activo Fijo ---
const ActivoFijoForm = ({ activo, onSave, onCancel }) => {
    
    const [formData, setFormData] = useState({
        nombre: activo?.nombre || '',
        codigo_interno: activo?.codigo_interno || '',
        fecha_adquisicion: (activo?.fecha_adquisicion || '').split('T')[0],
        valor_actual: activo?.valor_actual || '',
        vida_util: activo?.vida_util || '',
        departamento: activo?.departamento?.id || activo?.departamento || '',
        item_catalogo: activo?.item_catalogo?.id || activo?.item_catalogo || '',
        estado: activo?.estado?.id || activo?.estado || '',
        ubicacion: activo?.ubicacion?.id || activo?.ubicacion || '',
        proveedor: activo?.proveedor?.id || activo?.proveedor || '',
    });
    
    const [fotoFile, setFotoFile] = useState(null);

    const [formDeps, setFormDeps] = useState({ 
        itemsCatalogo: [], estados: [], ubicaciones: [], proveedores: [], departamentos: []
    });
    const [loadingDeps, setLoadingDeps] = useState(true);
    const { showNotification } = useNotification();
    
    useEffect(() => {
        const loadDependencies = async () => {
            try {
                setLoadingDeps(true);
                const [catRes, estRes, ubiRes, provRes, deptoRes] = await Promise.all([
                    getItemsCatalogo(),
                    getEstados(),
                    getUbicaciones(),
                    getProveedores(),
                    getDepartamentos()
                ]);
                
                setFormDeps({
                    itemsCatalogo: catRes.results || catRes || [],
                    estados: estRes.results || estRes || [],
                    ubicaciones: ubiRes.results || ubiRes || [],
                    proveedores: provRes.results || provRes || [],
                    departamentos: deptoRes.results || deptoRes || []
                });
            } catch (error) {
                console.error("Error cargando dependencias del formulario", error);
                showNotification('Error al cargar opciones del formulario', 'error');
            } finally {
                setLoadingDeps(false);
            }
        };
        loadDependencies();
    }, [showNotification]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFotoFile(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const dataToSend = new FormData();

        Object.keys(formData).forEach(key => {
            const value = formData[key];
            
            if (key === 'proveedor' || key === 'departamento') {
                dataToSend.append(key, value || '');
            } else {
                dataToSend.append(key, value);
            }
        });
        
        if (fotoFile) {
            dataToSend.append('foto_activo', fotoFile);
        }
        
        onSave(dataToSend, activo?.id);
    };

    if (loadingDeps) {
        return <div className="flex justify-center items-center h-48"><Loader className="animate-spin text-accent" /></div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormInput name="nombre" label="Nombre del Activo" value={formData.nombre} onChange={handleChange} required />
            <FormInput name="codigo_interno" label="Código Interno" value={formData.codigo_interno} onChange={handleChange} required />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput name="fecha_adquisicion" label="Fecha de Adquisición" type="date" value={formData.fecha_adquisicion} onChange={handleChange} required />
                <FormInput name="valor_actual" label="Valor Actual" type="number" step="0.01" min="0" value={formData.valor_actual} onChange={handleChange} required />
                <FormInput name="vida_util" label="Vida Útil (años)" type="number" step="1" min="1" value={formData.vida_util} onChange={handleChange} required />
                
                <FormSelect name="item_catalogo" label="Categoría" value={formData.item_catalogo} onChange={handleChange} required>
                    {formDeps.itemsCatalogo.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)} 
                </FormSelect>
                
                <FormSelect name="estado" label="Estado" value={formData.estado} onChange={handleChange} required>
                    {formDeps.estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </FormSelect>
                
                <FormSelect name="ubicacion" label="Ubicación" value={formData.ubicacion} onChange={handleChange} required>
                    {formDeps.ubicaciones.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                </FormSelect>

                <FormSelect name="departamento" label="Departamento (Opcional)" value={formData.departamento} onChange={handleChange}>
                    <option value="">-- Ninguno --</option>
                    {formDeps.departamentos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </FormSelect>
                
                <FormSelect name="proveedor" label="Proveedor (Opcional)" value={formData.proveedor} onChange={handleChange}>
                    <option value="">-- Ninguno --</option>
                    {formDeps.proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </FormSelect>

                <div className="md:col-span-2">
                    <FormFileInput 
                        label="Foto del Activo (Opcional)"
                        onChange={handleFileChange}
                        fileName={fotoFile?.name}
                    />
                </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-theme">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-primary hover:bg-tertiary">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-opacity-90">Guardar</button>
            </div>
        </form>
    );
};


// --- Componente Principal de la Lista ---
export default function ActivosFijosList() {
    const [activos, setActivos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingActivo, setEditingActivo] = useState(null);
    const { showNotification } = useNotification();
    const { hasPermission, loadingPermissions } = usePermissions();

    const [filters, setFilters] = useState({ search: '', estado: '', departamento: '' });
    const [filterOptions, setFilterOptions] = useState({ estados: [], departamentos: [] });
    const debouncedSearch = useDebounce(filters.search, 500);

    const canManage = !loadingPermissions && hasPermission('manage_activofijo');

    const fetchActivosFijos = useCallback(async (currentFilters) => {
        setLoading(true);
        try {
            const cleanFilters = Object.entries(currentFilters).reduce((acc, [key, value]) => {
                if (value) acc[key] = value;
                return acc;
            }, {});

            const data = await getActivosFijos(cleanFilters);
            const processedData = (data.results || data || []).map(activo => ({
                ...activo,
                categoria_nombre: activo.item_catalogo?.nombre || 'N/A',
                estado_nombre: activo.estado?.nombre || 'N/A',
                ubicacion_nombre: activo.ubicacion?.nombre || 'N/A',
            }));
            setActivos(processedData);
        } catch (error) { 
            console.error("Error al obtener activos:", error); 
            showNotification('Error al cargar los activos','error');
        } finally { 
            setLoading(false); 
        }
    }, [showNotification]);

    useEffect(() => {
        const loadFilterOptions = async () => {
            try {
                const [estadosRes, deptosRes] = await Promise.all([
                    getEstados(),
                    getDepartamentos()
                ]);
                setFilterOptions({
                    estados: estadosRes.results || estadosRes || [],
                    departamentos: deptosRes.results || deptosRes || []
                });
            } catch (error) {
                showNotification('Error al cargar opciones de filtro', 'error');
            }
        };
        loadFilterOptions();
    }, [showNotification]);

    useEffect(() => {
        const currentFilters = { ...filters, search: debouncedSearch };
        fetchActivosFijos(currentFilters);
    }, [debouncedSearch, filters.estado, filters.departamento, fetchActivosFijos]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (formData, activoId) => {
        try {
            if (activoId) {
                await updateActivoFijo(activoId, formData);
                showNotification('Activo actualizado con éxito');
            } else {                
                await createActivoFijo(formData);
                showNotification('Activo creado con éxito');
            }
            fetchActivosFijos({ ...filters, search: debouncedSearch });
            setIsModalOpen(false);
            setEditingActivo(null);
        } catch (error) { 
            console.error("Error al guardar activo:", error.response?.data || error.message); 
            let errorMsg = 'Error al guardar el activo';
            if (error.response?.data) {
                const errors = error.response.data;
                if (errors.detail) {
                    errorMsg = errors.detail;
                } else {
                    const firstErrorKey = Object.keys(errors)[0];
                    errorMsg = `${firstErrorKey}: ${errors[firstErrorKey][0]}`;
                }
            }
            showNotification(errorMsg, 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Seguro que quieres eliminar este activo fijo?')) {
            try {
                await deleteActivoFijo(id);
                showNotification('Activo eliminado con éxito');
                fetchActivosFijos({ ...filters, search: debouncedSearch });
            } catch (error) { 
                console.error("Error al eliminar:", error); 
                showNotification('Error al eliminar el activo','error');
            }
        }
    };

    const openCreateModal = () => {
        setEditingActivo(null);
        setIsModalOpen(true);
    };

    const openEditModal = (activo) => {
        setEditingActivo(activo);
        setIsModalOpen(true);
    };
    
    return (
        <>            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="mb-8 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-primary mb-2">Activos Fijos</h1>
                        <p className="text-secondary">Gestiona los bienes y propiedades de tu empresa.</p>
                    </div>                  
                    {canManage && (
                        <button onClick={openCreateModal} className="flex items-center gap-2 bg-accent text-white font-semibold px-4 py-2 rounded-lg hover:bg-opacity-90 transition-transform active:scale-95 self-start md:self-center">
                            <Plus size={20} /> Nuevo Activo
                        </button>
                    )}
                </div>

                <div className="mb-6 flex flex-col md:flex-row gap-4">
                    <SearchBar 
                        value={filters.search}
                        onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
                        placeholder="Buscar por nombre, código o serial..."
                        className="flex-grow"
                    />
                    <FormSelect name="estado" value={filters.estado} onChange={handleFilterChange} className="md:max-w-xs">
                        <option value="">Todos los Estados</option>
                        {filterOptions.estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                    </FormSelect>
                    <FormSelect name="departamento" value={filters.departamento} onChange={handleFilterChange} className="md:max-w-xs">
                        <option value="">Todos los Departamentos</option>
                        {filterOptions.departamentos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                    </FormSelect>
                </div>
                
                <div className="bg-secondary border border-theme rounded-xl p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-48"><Loader className="animate-spin text-accent" /></div>
                    ) : activos.length === 0 ? (
                        <p className="text-center text-tertiary py-12">No se encontraron activos con los filtros actuales.</p>
                    ) : (
                        activos.map((activo, index) => (
                            <motion.div
                                key={activo.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex flex-col md:flex-row items-start md:items-center p-3 border-b border-theme last:border-b-0 hover:bg-tertiary rounded-lg"
                            >
                                <div className="p-0 bg-accent bg-opacity-10 rounded-lg mr-4 mb-2 md:mb-0 flex-shrink-0">
                                    {activo.foto_activo ? (
                                        <img 
                                            src={activo.foto_activo}
                                            alt={activo.nombre}
                                            className="w-12 h-12 rounded-lg object-cover"         
                                            onError={(e) => { console.error("Error cargando imagen:", activo.foto_activo, e); e.target.style.display='none';}}
                                        />
                                    ) : (
                                        <div className="w-12 h-12 flex items-center justify-center">
                                            <Box className="text-accent" size={24} />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2">
                                    <div>
                                        <p className="font-semibold text-primary">{activo.nombre}</p>
                                        <p className="text-sm text-secondary flex items-center gap-1.5"><Tag size={14} /> {activo.codigo_interno}</p>
                                    </div>
                                    <div>
                                        <p className="text-primary flex items-center gap-1.5"><CheckSquare size={14} /> {activo.estado_nombre}</p>
                                        <p className="text-secondary text-sm flex items-center gap-1.5"><MapPin size={14} /> {activo.ubicacion_nombre}</p>
                                    </div>
                                    <div>
                                        <p className="text-primary font-medium flex items-center gap-1.5"><DollarSign size={14} /> {parseFloat(activo.valor_actual).toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}</p>
                                        <p className="text-secondary text-sm flex items-center gap-1.5"><Tag size={14} /> {activo.categoria_nombre}</p>
                                    </div>
                                    <div>
                                        <p className="text-primary text-sm font-medium">Adquirido:</p>
                                        <p className="text-secondary text-sm">{new Date(activo.fecha_adquisicion + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                
                                {canManage && (
                                    <div className="flex gap-2 ml-auto mt-2 md:mt-0 md:ml-4">
                                        <button onClick={() => openEditModal(activo)} className="p-2 text-primary hover:text-accent"><Edit size={18} /></button>
                                        <button onClick={() => handleDelete(activo.id)} className="p-2 text-primary hover:text-red-500"><Trash2 size={18} /></button>
                                    </div>
                                )}
                            </motion.div>
                        ))
                    )}
                </div>
            </motion.div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingActivo ? "Editar Activo Fijo" : "Nuevo Activo Fijo"}>
                <ActivoFijoForm 
                    activo={editingActivo} 
                    onSave={handleSave} 
                    onCancel={() => setIsModalOpen(false)} 
                />
            </Modal>
        </>
    );
}