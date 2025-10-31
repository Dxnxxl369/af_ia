
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from './Dashboard';
import Settings from './Settings';
import DepartamentosList from '../pages/departamentos/DepartamentosList';
import ActivosFijosList from '../pages/activos/ActivosFijosList';
import CargosList from '../pages/cargos/CargosList';
import EmpleadosList from '../pages/empleados/EmpleadosList';
import RolesList from '../pages/roles/RolesList';
import PresupuestosList from '../pages/presupuesto/PresupuestosList';
import UbicacionesList from '../pages/ubicaciones/UbicacionesList';
import ProveedoresList from '../pages/proveedores/ProveedoresList';
import CategoriasActivosList from '../pages/categorias/CategoriasActivosList';
import EstadosList from '../pages/estados/EstadosList';
import ReportesPage from '../pages/reportes/ReportesPage';
import PermisosList from '../pages/permisos/PermisosList';
import MantenimientoList from '../pages/mantenimiento/MantenimientoList';
import RevalorizacionPage from '../pages/revalorizacion/RevalorizacionPage';

export default function Layout() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    // Main container takes full height and prevents outer scroll
    <div className="flex h-screen bg-primary overflow-hidden"> 
      {/* Sidebar component */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden"> 
        {/* Header (should NOT scroll) */}
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        
        {/* Main content (THIS part should scroll independently) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8"> 
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'departamentos' && <DepartamentosList />} 
          {currentPage === 'activos_fijos' && <ActivosFijosList/>}
          {currentPage === 'mantenimientos' && <MantenimientoList />}
          {currentPage === 'revalorizaciones' && <RevalorizacionPage />}
          {currentPage === 'cargos' && <CargosList />}
          {currentPage === 'empleados' && <EmpleadosList />}
          {currentPage === 'roles' && <RolesList />}
          {currentPage === 'presupuestos' && <PresupuestosList />}
          {currentPage === 'ubicaciones' && <UbicacionesList />}
          {currentPage === 'proveedores' && <ProveedoresList />}
          {currentPage === 'categorias' && <CategoriasActivosList />}
          {currentPage === 'estados' && <EstadosList />}
          {currentPage === 'reportes' && <ReportesPage />}
          {currentPage === 'permisos' && <PermisosList />}           
          {currentPage === 'settings' && <Settings />}                    
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}