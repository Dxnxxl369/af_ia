// src/pages/categorias/CategoriasActivosList.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderTree, Plus, Edit, Trash2, Loader } from 'lucide-react';
// 1. Importar las funciones con el nombre corregido
import { getItemsCatalogo, createItemCatalogo, updateItemCatalogo, deleteItemCatalogo } from '../../api/dataService';
import Modal from '../../components/Modal';
import { useNotification } from '../../context/NotificacionContext';
import { usePermissions } from '../../hooks/usePermissions'; 

// Formulario para Crear/Editar (ahora para ItemCatalogo)
const ItemCatalogoForm = ({ item, onSave, onCancel }) => {
    const [nombre, setNombre] = useState(item?.nombre || '');
    // 2. Cambiar "descripcion" por "tipo_item" para que coincida con el modelo
    const [tipoItem, setTipoItem] = useState(item?.tipo_item || '');
    const handleSubmit = (e) => { e.preventDefault(); onSave({ nombre, tipo_item: tipoItem }); };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del Item" required className="w-full p-3 bg-tertiary rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent" />
            <input value={tipoItem} onChange={(e) => setTipoItem(e.target.value)} placeholder="Tipo de Item (Ej: Mobiliario, Equipo de Cómputo)" required className="w-full p-3 bg-tertiary rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent" />
            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-primary hover:bg-tertiary">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-opacity-90">Guardar</button>
            </div>
        </form>
    );
};

export default function ItemsCatalogoList() { // 3. Renombrar componente
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const { showNotification } = useNotification();
    const { hasPermission, loadingPermissions } = usePermissions(); 
    // 4. Usar el permiso correcto
    const canManage = !loadingPermissions && hasPermission('manage_itemcatalogo');

    const fetchItems = async () => {
        try {
            setLoading(true);
            // 5. Usar la función de fetch correcta
            const data = await getItemsCatalogo();
            setItems(data.results || data || []);
        } catch (error) { 
            console.error("Error al obtener items del catálogo:", error); 
            showNotification('Error al cargar el catálogo','error');
        }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchItems(); }, []);    

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleSave = async (data) => {
        try {
            if (editingItem) {
                // 6. Usar la función de update correcta
                await updateItemCatalogo(editingItem.id, data);
                showNotification('Item actualizado con éxito');
            } else {                
                // 7. Usar la función de create correcta
                await createItemCatalogo(data);
                showNotification('Item creado con éxito');
            }
            fetchItems();
            handleCloseModal();
        } catch (error) { 
            console.error("Error al guardar item:", error); 
            showNotification('Error al guardar el item', 'error');
        }    
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Seguro que quieres eliminar este item del catálogo?')) {
            try {
                // 8. Usar la función de delete correcta
                await deleteItemCatalogo(id);
                showNotification('Item eliminado con éxito');
                fetchItems();
            } catch (error) { 
                console.error("Error al eliminar item:", error); 
                showNotification('Error al eliminar el item','error');
            }
        }
    };
    
    return (
        <>            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        {/* 9. Actualizar textos */}
                        <h1 className="text-4xl font-bold text-primary mb-2">Catálogo de Items</h1>
                        <p className="text-secondary">Define los tipos de bienes que la empresa puede adquirir.</p>
                    </div>
                    {canManage && (
                        <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-accent text-white font-semibold px-4 py-2 rounded-lg hover:bg-opacity-90 transition-transform active:scale-95">
                            <Plus size={20} /> Nuevo Item
                        </button>
                    )}
                </div>
                
                <div className="bg-secondary border border-theme rounded-xl p-4">
                    {loading ? <div className="flex justify-center items-center h-48"><Loader className="animate-spin text-accent" /></div> :
                    items.length === 0 ? <p className="text-center text-tertiary py-12">No hay items en el catálogo.</p> :
                    items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center p-3 border-b border-theme last:border-b-0 hover:bg-tertiary rounded-lg"
                        >
                            <div className="p-3 bg-accent bg-opacity-10 rounded-lg mr-4">
                                <FolderTree className="text-accent" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-primary">{item.nombre}</p>
                                {/* 10. Mostrar tipo_item en lugar de descripción */}
                                <p className="text-sm text-secondary">Tipo: {item.tipo_item || 'No especificado'}</p>
                            </div>
                            {canManage && (
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2 text-primary hover:text-accent"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 text-primary hover:text-red-500"><Trash2 size={18} /></button>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingItem ? "Editar Item del Catálogo" : "Nuevo Item al Catálogo"}>
                <ItemCatalogoForm item={editingItem} onSave={handleSave} onCancel={handleCloseModal} />
            </Modal>
        </>
    );
}