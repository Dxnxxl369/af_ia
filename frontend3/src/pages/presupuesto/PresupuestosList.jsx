// src/pages/presupuestos/PresupuestosList.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PiggyBank, Plus, Edit, Trash2, Loader, Building2 } from 'lucide-react';
import { getPresupuestos, createPresupuesto, updatePresupuesto, deletePresupuesto, getDepartamentos } from '../../api/dataService';
import Modal from '../../components/Modal';
import { useNotification } from '../../context/NotificacionContext';
import { usePermissions } from '../../hooks/usePermissions';

// --- Componentes de ayuda del Formulario ---
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

// --- Formulario de Presupuesto ---
const PresupuestoForm = ({ presupuesto, onSave, onCancel }) => {
    // El serializer de 'create' espera 'departamento_id'
    const [departamentoId, setDepartamentoId] = useState(presupuesto?.departamento?.id || presupuesto?.departamento_id || '');
    const [monto, setMonto] = useState(presupuesto?.monto || '');
    const [fecha, setFecha] = useState((presupuesto?.fecha || '').split('T')[0]);
    const [descripcion, setDescripcion] = useState(presupuesto?.descripcion || '');
    
    const [departamentos, setDepartamentos] = useState([]);
    const [loadingDeps, setLoadingDeps] = useState(true);
    const { showNotification } = useNotification();

    useEffect(() => {
        const loadDepartamentos = async () => {
            try {
                setLoadingDeps(true);
                const data = await getDepartamentos();
                setDepartamentos(data.results || data || []);
            } catch (error) {
                console.error("Error al cargar departamentos:", error);
                showNotification('Error al cargar la lista de departamentos', 'error');
            } finally {
                setLoadingDeps(false);
            }
        };
        loadDepartamentos();
    }, [showNotification]);


    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ 
            monto, 
            fecha, 
            descripcion, 
            departamento_id: departamentoId // El serializer espera 'departamento_id'
        });
    };

    if (loadingDeps) {
        return <div className="flex justify-center items-center h-48"><Loader className="animate-spin text-accent" /></div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormSelect label="Departamento" value={departamentoId} onChange={(e) => setDepartamentoId(e.target.value)} required>
                {departamentos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </FormSelect>
            <FormInput label="Monto (Bs.)" type="number" step="0.01" min="0" value={monto} onChange={(e) => setMonto(e.target.value)} required />
            <FormInput label="Fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            <FormInput label="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej: Compra de equipos" />

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-primary hover:bg-tertiary">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-opacity-90">Guardar</button>
            </div>
        </form>
    );
};


// --- Componente Principal de la Lista ---
export default function PresupuestosList() {
    const [presupuestos, setPresupuestos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPresupuesto, setEditingPresupuesto] = useState(null);
    const { showNotification } = useNotification();
    const { hasPermission, loadingPermissions } = usePermissions();

    const fetchPresupuestos = async () => {
        try {
            setLoading(true);
            const data = await getPresupuestos();
            setPresupuestos(data.results || data || []);
        } catch (error) { 
            console.error("Error al obtener presupuestos:", error); 
            showNotification('Error al cargar los presupuestos','error');
        } finally { 
            setLoading(false); 
        }
    };

    const canManage = !loadingPermissions && hasPermission('manage_presupuesto');
    useEffect(() => { fetchPresupuestos(); }, []);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPresupuesto(null);
    };

    const handleSave = async (data) => {
        try {
            if (editingPresupuesto) {
                await updatePresupuesto(editingPresupuesto.id, data);
                showNotification('Presupuesto actualizado con éxito');
            } else {                
                await createPresupuesto(data);
                showNotification('Presupuesto creado con éxito');
            }
            fetchPresupuestos();
            handleCloseModal();
        } catch (error) { 
            console.error("Error al guardar:", error.response?.data || error); 
            showNotification('Error al guardar el presupuesto', 'error');
        }    
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Seguro que quieres eliminar este presupuesto?')) {
            try {
                await deletePresupuesto(id);
                showNotification('Presupuesto eliminado con éxito');
                fetchPresupuestos();
            } catch (error) { 
                console.error("Error al eliminar:", error); 
                showNotification('Error al eliminar el presupuesto','error');
            }
        }
    };
    
    return (
        <>            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-primary mb-2">Presupuestos</h1>
                        <p className="text-secondary">Gestiona los presupuestos asignados a los departamentos.</p>
                    </div>
                    {canManage && (
                        <button onClick={() => { setEditingPresupuesto(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-accent text-white font-semibold px-4 py-2 rounded-lg hover:bg-opacity-90 transition-transform active:scale-95">
                            <Plus size={20} /> Nuevo Presupuesto
                        </button>
                    )}
                </div>
                
                <div className="bg-secondary border border-theme rounded-xl p-4">
                    {loading ? <div className="flex justify-center items-center h-48"><Loader className="animate-spin text-accent" /></div> :
                    presupuestos.length === 0 ? <p className="text-center text-tertiary py-12">No hay presupuestos para mostrar.</p> :
                    presupuestos.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center p-3 border-b border-theme last:border-b-0 hover:bg-tertiary rounded-lg"
                        >
                            <div className="p-3 bg-accent bg-opacity-10 rounded-lg mr-4">
                                <PiggyBank className="text-accent" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-primary">{parseFloat(item.monto).toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}</p>
                                <p className="text-sm text-secondary flex items-center gap-1.5"><Building2 size={14} /> {item.departamento?.nombre || 'N/A'}</p>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-primary">{item.descripcion || 'Sin descripción'}</p>
                                <p className="text-sm text-secondary">{new Date(item.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                            {canManage && (
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditingPresupuesto(item); setIsModalOpen(true); }} className="p-2 text-primary hover:text-accent"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 text-primary hover:text-red-500"><Trash2 size={18} /></button>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingPresupuesto ? "Editar Presupuesto" : "Nuevo Presupuesto"}>
                <PresupuestoForm presupuesto={editingPresupuesto} onSave={handleSave} onCancel={handleCloseModal} />
            </Modal>
        </>
    );
}