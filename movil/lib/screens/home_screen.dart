// lib/screens/home_screen.dart
import 'package:flutter/material.dart';
import '../widgets/app_drawer.dart'; // Importar el Drawer
import 'package:lucide_flutter/lucide_flutter.dart'; // Importar iconos

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Usamos Scaffold para la estructura básica (AppBar, Drawer, Body)
    return Scaffold(
      appBar: AppBar(
        title: const Text('ActFijo App'),
        actions: [
          // --- Icono de Notificaciones ---
          IconButton(
            icon: Badge( // Usar Badge si hay notificaciones no leídas (lógica futura)
               // label: Text('3'), // Número de notificaciones
               // isLabelVisible: true, // Mostrar solo si hay > 0
               child: const Icon(LucideIcons.bell),
            ),
            tooltip: 'Notificaciones',
            onPressed: () {
              // TODO: Mostrar overlay/pantalla de notificaciones
            },
          ),
          // --- Icono/Menú de Perfil ---
          PopupMenuButton<String>(
            icon: CircleAvatar( // Mostrar iniciales o foto (lógica futura)
              backgroundColor: Theme.of(context).colorScheme.primary,
              foregroundColor: Theme.of(context).colorScheme.onPrimary,
              radius: 16,
              child: const Text("AG"), // Placeholder
            ),
            tooltip: 'Perfil',
            onSelected: (String result) {
              if (result == 'logout') {
                // TODO: Llamar a logout de AuthProvider
              }
            },
            itemBuilder: (BuildContext context) => <PopupMenuEntry<String>>[
              // TODO: Mostrar info del usuario aquí (leer de AuthProvider)
              const PopupMenuItem<String>(
                 enabled: false, // No seleccionable
                 child: ListTile(
                    leading: Icon(LucideIcons.user),
                    title: Text("Ana Gomez"), // Placeholder
                    subtitle: Text("ana@innovatech.com"),
                 ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem<String>(
                value: 'logout',
                child: ListTile(
                  leading: Icon(LucideIcons.logOut, size: 20),
                  title: Text('Cerrar sesión'),
                ),
              ),
            ],
          ),
          const SizedBox(width: 8), // Espacio
        ],
      ),
      // --- El Menú Lateral ---
      drawer: const AppDrawer(),
      // --- Contenido Principal (Placeholder) ---
      body: Center(
        child: Text(
          'Contenido Principal (Dashboard/Módulos)',
           style: Theme.of(context).textTheme.bodyMedium,
        ),
      ),
    );
  }
}