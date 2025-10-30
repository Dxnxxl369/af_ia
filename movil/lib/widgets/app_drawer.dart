// lib/widgets/app_drawer.dart
import 'package:flutter/material.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import '../screens/settings_screen.dart'; // Para navegar a Configuración

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    // TODO: Obtener permisos de AuthProvider (futuro)
    // final authProvider = Provider.of<AuthProvider>(context, listen: false);
    // bool canViewDashboard = authProvider.hasPermission('view_dashboard');
    // bool canViewActivos = authProvider.hasPermission('view_activofijo');
    // etc...

    return Drawer(
      // backgroundColor ya viene del drawerTheme
      child: Column(
        children: <Widget>[
          // --- Cabecera del Drawer ---
          DrawerHeader(
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary, // Usar color de acento
            ),
            child: Center(
              child: Text(
                'ActFijo App',
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onPrimary,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          // --- Lista de Módulos (Placeholder con permisos futuros) ---
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: <Widget>[
                // Mostrar condicionalmente basado en permisos (ejemplo)
                // if (canViewDashboard)
                ListTile(
                  leading: const Icon(LucideIcons.layoutGrid),
                  title: const Text('Dashboard'),
                  onTap: () {
                    // TODO: Navegar o cambiar contenido del body
                    Navigator.pop(context); // Cierra el drawer
                  },
                ),
                // if (canViewActivos)
                ListTile(
                  leading: const Icon(LucideIcons.box),
                  title: const Text('Activos Fijos'),
                  onTap: () {
                    Navigator.pop(context);
                  },
                ),
                 ListTile(
                  leading: const Icon(LucideIcons.wrench),
                  title: const Text('Mantenimientos'),
                  onTap: () {
                    Navigator.pop(context);
                  },
                ),
                // ... Añadir placeholders para los otros módulos ...
                // Departamentos, Cargos, Empleados, Roles, etc.
              ],
            ),
          ),
          // --- Elemento Fijo al Final: Configuración ---
          const Divider(),
          ListTile(
            leading: const Icon(LucideIcons.settings),
            title: const Text('Configuración'),
            onTap: () {
              Navigator.pop(context); // Cierra el drawer
              // Navega a la pantalla de Settings
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const SettingsScreen()),
              );
            },
          ),
        ],
      ),
    );
  }
}