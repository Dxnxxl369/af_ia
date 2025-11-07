// src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

/**
 * Hook personalizado para "retrasar" la actualización de un valor.
 * Es útil para evitar peticiones a la API en cada tecleo en un campo de búsqueda.
 * @param {*} value El valor a "retrasar" (ej: el texto de búsqueda).
 * @param {number} delay El tiempo de espera en milisegundos.
 * @returns {*} El valor "retrasado".
 */
export function useDebounce(value, delay) {
  // Estado para guardar el valor retrasado
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Configura un temporizador para actualizar el valor solo después del 'delay'
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Función de limpieza: se ejecuta si el valor cambia antes de que pase el 'delay'.
    // Esto cancela el temporizador anterior y lo reinicia.
    return () => {
      clearTimeout(handler);
    };
  }, 
  [value, delay] // Solo se vuelve a ejecutar si el valor o el delay cambian
  );

  return debouncedValue;
}
