// src/components/SearchBar.jsx
import React from 'react';
import { Search } from 'lucide-react';

/**
 * Componente reutilizable de barra de búsqueda con un ícono.
 * @param {string} value - El valor actual del campo de búsqueda.
 * @param {function(string): void} onChange - La función a llamar cuando el valor cambia.
 * @param {string} [placeholder="Buscar..."] - El texto a mostrar cuando el campo está vacío.
 * @param {string} [className=""] - Clases de CSS adicionales para el contenedor principal.
 */
const SearchBar = ({ value, onChange, placeholder = "Buscar...", className = "" }) => {
    return (
        <div className={`relative ${className}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} className="text-tertiary" />
            </div>
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full p-3 pl-10 bg-tertiary rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
        </div>
    );
};

export default SearchBar;
