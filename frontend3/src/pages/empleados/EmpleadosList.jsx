// src/pages/empleados/EmpleadosList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
    Users, Plus, Edit, Trash2, Loader, DollarSign, 
    Briefcase, Building2, UserCheck, UploadCloud
} from 'lucide-react';
import { 
    getEmpleados, createEmpleado, updateEmpleado, deleteEmpleado, 
    getCargos, getDepartamentos, getRoles 
} from '../../api/dataService';
import Modal from '../../components/Modal';
import { useNotification } from '../../context/NotificacionContext';
import { usePermissions } from '../../hooks/usePermissions';
import SearchBar from '../../components/SearchBar';
import { useDebounce } from '../../hooks/useDebounce';

// --- Componentes de ayuda para el formulario (sin cambios) ---
const FormInput = ({ label, ...props }) => (
    <div className="flex flex-col">
        <label className="text-sm font-medium text-secondary mb-1.5">{label}</label>
        <input {...props} className="w-full p-3 bg-tertiary rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent" />
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
const FormSelect = ({ label, children, ...props }) => (
    <div className="flex flex-col">
        <label className="text-sm font-medium text-secondary mb-1.5">{label}</label>
        <select {...props} className="w-full p-3 bg-tertiary rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent appearance-none">
            <option value="" disabled>-- Seleccione --</option>
            {children}
        </select>
    </div>
);

// --- Formulario de Empleado (sin cambios) ---
const EmpleadoForm = ({ empleado, onSave, onCancel }) => {
    const isEditing = !!empleado;
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        first_name: '',
        email: '',
        ci: empleado?.ci || '',
        apellido_p: empleado?.apellido_p || '',
        apellido_m: empleado?.apellido_m || '',
        direccion: empleado?.direccion || '',
        telefono: empleado?.telefono || '',
        sueldo: empleado?.sueldo || '',
        cargo: empleado?.cargo || '',
        departamento: empleado?.departamento || '',
        roles: empleado?.roles || [],
    });
    const [fotoFile, setFotoFile] = useState(null);
    const [formDeps, setFormDeps] = useState({ cargos: [], departamentos: [], roles: [] });
    const [loadingDeps, setLoadingDeps] = useState(true);
    const { showNotification } = useNotification();

    useEffect(() => {
        const loadDependencies = async () => {
            try {
                setLoadingDeps(true);
                const [cargosRes, deptosRes, rolesRes] = await Promise.all([
                    getCargos(),
                    getDepartamentos(),
                    getRoles()
                ]);
                setFormDeps({
                    cargos: cargosRes.results || cargosRes || [],
                    departamentos: deptosRes.results || deptosRes || [],
                    roles: rolesRes.results || rolesRes || [],
                });
                
                if (isEditing && empleado.usuario) {
                    setFormData(prev => ({
                        ...prev,
                        username: empleado.usuario.username,
                        first_name: empleado.usuario.first_name,
                        email: empleado.usuario.email,
                    }));
                }

            } catch (error) {
                console.error("Error cargando dependencias del formulario", error);
                showNotification('Error al cargar opciones del formulario', 'error');
            } finally {
                setLoadingDeps(false);
            }
        };
        loadDependencies();
    }, [empleado, isEditing, showNotification]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFotoFile(e.target.files[0]);
    };

    const handleMultiSelectChange = (e) => {
        const { name, options } = e.target;
        const selectedValues = Array.from(options).filter(option => option.selected).map(option => option.value);
        setFormData(prev => ({ ...prev, [name]: selectedValues }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSend = new FormData();
        Object.keys(formData).forEach(key => {
            const value = formData[key];
            if (isEditing && key === 'username') {
                return; 
            }
            if (key === 'password') {
                if (value) {
                    dataToSend.append(key, value);
                }
                return;
            }
            if (key === 'roles') {
                if (Array.isArray(value)) {
                    value.forEach(roleId => dataToSend.append('roles', roleId));
                }
                return;
            }
            if (key === 'cargo' || key === 'departamento') {
                dataToSend.append(key, value || '');
                return;
            }
            dataToSend.append(key, value);
        });
        if (fotoFile) {
            dataToSend.append('foto_perfil', fotoFile);
        }
        onSave(dataToSend, empleado?.id);
    };

    if (loadingDeps) {
        return <div className="flex justify-center items-center h-48"><Loader className="animate-spin text-accent" /></div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2" autoComplete='off'>
            <fieldset className="border border-theme rounded-lg p-4">
                <legend className="text-sm font-medium text-accent px-2">Datos de Acceso</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput name="username" label="Username" value={formData.username} onChange={handleChange} required disabled={isEditing} autoComplete="off" />
                    <FormInput name="first_name" label="Nombre" value={formData.first_name} onChange={handleChange} required autoComplete="off" />
                    <FormInput name="email" label="Email" type="email" value={formData.email} onChange={handleChange} required autoComplete="off" />
                    <FormInput name="password" label="Password" type="password" value={formData.password} onChange={handleChange} placeholder={isEditing ? "Dejar en blanco para no cambiar" : "Requerido al crear"} required={!isEditing} autoComplete="new-password" />
                </div>
            </fieldset>
            <fieldset className="border border-theme rounded-lg p-4">
                <legend className="text-sm font-medium text-accent px-2">Datos Personales</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput name="ci" label="Cédula de Identidad" value={formData.ci} onChange={handleChange} required />
                    <FormInput name="apellido_p" label="Apellido Paterno" value={formData.apellido_p} onChange={handleChange} required />
                    <FormInput name="apellido_m" label="Apellido Materno" value={formData.apellido_m} onChange={handleChange} />
                    <FormInput name="telefono" label="Teléfono" value={formData.telefono} onChange={handleChange} />
                    <FormFileInput 
                        label="Foto de Perfil (Opcional)"
                        onChange={handleFileChange}
                        fileName={fotoFile?.name}
                    />
                    <FormInput name="direccion" label="Dirección" value={formData.direccion} onChange={handleChange} className="md:col-span-2" />
                </div>
            </fieldset>
            <fieldset className="border border-theme rounded-lg p-4">
                <legend className="text-sm font-medium text-accent px-2">Datos Laborales</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput name="sueldo" label="Sueldo (Bs.)" type="number" step="0.01" min="0" value={formData.sueldo} onChange={handleChange} />
                    <FormSelect name="cargo" label="Cargo" value={formData.cargo} onChange={handleChange}>
                        <option value="">-- Ninguno --</option>
                        {formDeps.cargos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </FormSelect>
                    <FormSelect name="departamento" label="Departamento" value={formData.departamento} onChange={handleChange}>
                        <option value="">-- Ninguno --</option>
                        {formDeps.departamentos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                    </FormSelect>
                    <div className="flex flex-col md:col-span-2">
                        <label className="text-sm font-medium text-secondary mb-1.5">Roles</label>
                        <select 
                            name="roles" 
                            multiple 
                            value={formData.roles} 
                            onChange={handleMultiSelectChange} 
                            className="w-full p-3 h-32 bg-tertiary rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            {formDeps.roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                        </select>
                    </div>
                </div>
            </fieldset>
            <div className="flex justify-end gap-3 pt-4 border-t border-theme">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-primary hover:bg-tertiary">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-opacity-90">Guardar</button>
            </div>
        </form>
    );
};

// --- Componente Principal de la Lista ---
export default function EmpleadosList() {
    const [empleados, setEmpleados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmpleado, setEditingEmpleado] = useState(null);
    const { showNotification } = useNotification();        
    const { hasPermission, loadingPermissions } = usePermissions();

    const [filters, setFilters] = useState({ search: '', departamento: '', cargo: '' });
    const [filterOptions, setFilterOptions] = useState({ departamentos: [], cargos: [] });
    const debouncedSearch = useDebounce(filters.search, 500);

    const canManage = !loadingPermissions && hasPermission('manage_empleado');

    const fetchEmpleados = useCallback(async (currentFilters) => {
        setLoading(true);
        try {
            const cleanFilters = Object.entries(currentFilters).reduce((acc, [key, value]) => {
                if (value) acc[key] = value;
                return acc;
            }, {});

            const data = await getEmpleados(cleanFilters);
            const processedData = (data.results || data || []).map(emp => ({
                ...emp,
                nombre_completo: `${emp.usuario.first_name} ${emp.apellido_p}`,
                cargo_nombre: emp.cargo_nombre || 'N/A',
                departamento_nombre: emp.departamento_nombre || 'N/A',
            }));
            setEmpleados(processedData);
        } catch (error) { 
            console.error("Error al obtener empleados:", error); 
            showNotification('Error al cargar los empleados','error');
        } finally { 
            setLoading(false); 
        }
    }, [showNotification]);

    useEffect(() => {
        const loadFilterOptions = async () => {
            try {
                const [deptosRes, cargosRes] = await Promise.all([getDepartamentos(), getCargos()]);
                setFilterOptions({
                    departamentos: deptosRes.results || deptosRes || [],
                    cargos: cargosRes.results || cargosRes || []
                });
            } catch (error) {
                showNotification('Error al cargar opciones de filtro', 'error');
            }
        };
        loadFilterOptions();
    }, [showNotification]);

    useEffect(() => {
        const currentFilters = { ...filters, search: debouncedSearch };
        fetchEmpleados(currentFilters);
    }, [debouncedSearch, filters.departamento, filters.cargo, fetchEmpleados]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (formData, empleadoId) => { 
        try {
            if (empleadoId) {
                await updateEmpleado(empleadoId, formData);
                showNotification('Empleado actualizado con éxito');
            } else {
                await createEmpleado(formData);
                showNotification('Empleado creado con éxito');
            }
            fetchEmpleados({ ...filters, search: debouncedSearch });
            setIsModalOpen(false);
            setEditingEmpleado(null);
        } catch (error) { 
            console.error("Error al guardar empleado:", error.response?.data || error.message);
            let errorMsg = 'Error al guardar el empleado';
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
        if (window.confirm('¿Seguro que quieres eliminar este empleado? Esta acción no se puede deshacer.')) {
            try {
                await deleteEmpleado(id);
                showNotification('Empleado eliminado con éxito');
                fetchEmpleados({ ...filters, search: debouncedSearch });
            } catch (error) { 
                console.error("Error al eliminar:", error); 
                showNotification('Error al eliminar el empleado','error');
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEmpleado(null);
    };
    
    const openCreateModal = () => {
        setEditingEmpleado(null); 
        setIsModalOpen(true);
    };

    const openEditModal = (empleado) => {
        setEditingEmpleado(empleado);
        setIsModalOpen(true);
    };
    
    return (
        <>            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-primary mb-2">Empleados</h1>
                        <p className="text-secondary">Gestiona el personal de tu empresa.</p>
                    </div>
                    {canManage && (                    
                        <button onClick={openCreateModal} className="flex items-center gap-2 bg-accent text-white font-semibold px-4 py-2 rounded-lg hover:bg-opacity-90 transition-transform active:scale-95">
                            <Plus size={20} /> Nuevo Empleado
                        </button>  
                    )}                                  
                </div>

                <div className="mb-6 flex flex-col md:flex-row gap-4">
                    <SearchBar 
                        value={filters.search}
                        onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
                        placeholder="Buscar por nombre, CI, email..."
                        className="flex-grow"
                    />
                    <FormSelect name="departamento" value={filters.departamento} onChange={handleFilterChange} className="md:max-w-xs">
                        <option value="">Todos los Departamentos</option>
                        {filterOptions.departamentos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                    </FormSelect>
                    <FormSelect name="cargo" value={filters.cargo} onChange={handleFilterChange} className="md:max-w-xs">
                        <option value="">Todos los Cargos</option>
                        {filterOptions.cargos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </FormSelect>
                </div>
                
                <div className="bg-secondary border border-theme rounded-xl p-4">
                    {loading ? <div className="flex justify-center items-center h-48"><Loader className="animate-spin text-accent" /></div> :
                    empleados.length === 0 ? <p className="text-center text-tertiary py-12">No se encontraron empleados con los filtros actuales.</p> :
                    empleados.map((emp, index) => (
                        <motion.div
                            key={emp.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center p-3 border-b border-theme last:border-b-0 hover:bg-tertiary rounded-lg"
                        >
                            <div className="p-0 bg-accent bg-opacity-10 rounded-full mr-4 flex-shrink-0">
                                {emp.foto_perfil ? (
                                    <img 
                                        src={emp.foto_perfil}
                                        alt={`Foto de ${emp.nombre_completo}`}
                                        className="w-10 h-10 rounded-full object-cover" 
                                        onError={(e) => { console.error("Error cargando imagen:", emp.foto_perfil, e); e.target.style.display='none'; }}
                                    />
                                ) : (
                                    <div className="w-10 h-10 flex items-center justify-center">
                                        <UserCheck className="text-accent" size={20} />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-x-4">
                                <div>
                                    <p className="font-semibold text-primary">{emp.nombre_completo}</p>
                                    <p className="text-sm text-secondary">{emp.usuario.email}</p>
                                </div>
                                <div>
                                    <p className="text-primary flex items-center gap-1.5"><Briefcase size={14} /> {emp.cargo_nombre}</p>
                                    <p className="text-secondary text-sm flex items-center gap-1.5"><Building2 size={14} /> {emp.departamento_nombre}</p>
                                </div>
                                <div>
                                    <p className="text-primary font-medium flex items-center gap-1.5"><DollarSign size={14} /> {parseFloat(emp.sueldo).toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}</p>

                                </div>
                            </div>
                            {canManage && (
                                <div className="flex gap-2 ml-4">                                
                                    <button onClick={() => openEditModal(emp)} className="p-2 text-primary hover:text-accent"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(emp.id)} className="p-2 text-primary hover:text-red-500"><Trash2 size={18} /></button>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingEmpleado ? "Editar Empleado" : "Nuevo Empleado"}>
                <EmpleadoForm 
                    empleado={editingEmpleado} 
                    onSave={handleSave} 
                    onCancel={handleCloseModal}
                />
            </Modal>
        </>
    );
}