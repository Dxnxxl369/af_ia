// lib/screens/settings_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import '../providers/theme_provider.dart'; // Importar el provider

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Obtener el provider para leer y modificar el estado del tema
    final themeProvider = Provider.of<ThemeProvider>(context);

    // Color actual para el picker (necesitamos convertir Color a HSLColor)
    final currentColor = themeProvider.customColor;
    // final currentHslColor = HSLColor.fromColor(currentColor);

    // Función para mostrar el Color Picker
    void showColorPicker() {
      showDialog(
        context: context,
        builder: (BuildContext context) {
          Color pickerColor = themeProvider.customColor; // Color inicial del picker
          return AlertDialog(
            title: const Text('Elige tu Color Primario'),
            content: SingleChildScrollView(
              child: ColorPicker(
                pickerColor: pickerColor,
                onColorChanged: (Color color) {
                   pickerColor = color; // Actualizar color mientras se elige
                },
                // enableAlpha: false, // Deshabilitar alfa si no lo necesitas
                // displayThumbColor: true,
                // pickerAreaHeightPercent: 0.8,
              ),
            ),
            actions: <Widget>[
              TextButton(
                child: const Text('Cancelar'),
                onPressed: () {
                  Navigator.of(context).pop();
                },
              ),
              TextButton(
                child: const Text('Guardar'),
                onPressed: () {
                  themeProvider.setCustomColor(pickerColor); // Guardar color final
                  Navigator.of(context).pop();
                },
              ),
            ],
          );
        },
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Personalizar Apariencia'),
      ),
      body: ListView( // Usar ListView para permitir scroll si hay muchos elementos
        padding: const EdgeInsets.all(16.0),
        children: <Widget>[
          // --- Selector de Modo de Tema ---
          Card( // Usar Card para agrupar visualmente
            // color: Theme.of(context).cardColor, // Color viene del tema
            elevation: 1, // Sombra sutil
             shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
             clipBehavior: Clip.antiAlias, // Para que el borde redondeado funcione bien
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Modo de Tema',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 12),
                  RadioListTile<ThemeMode>(
                    title: const Text('Claro'),
                    value: ThemeMode.light,
                    groupValue: themeProvider.themeMode == ThemeMode.system ? null : themeProvider.themeMode, // Marcar si es light o dark
                     activeColor: Theme.of(context).colorScheme.primary,
                    onChanged: (ThemeMode? value) {
                      if (value != null) themeProvider.setThemeMode(value);
                    },
                  ),
                  RadioListTile<ThemeMode>(
                    title: const Text('Oscuro'),
                    value: ThemeMode.dark,
                    groupValue: themeProvider.themeMode == ThemeMode.system ? null : themeProvider.themeMode,
                     activeColor: Theme.of(context).colorScheme.primary,
                    onChanged: (ThemeMode? value) {
                      if (value != null) themeProvider.setThemeMode(value);
                    },
                  ),
                   // Botón para activar modo Custom y elegir color
                   ListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Personalizado'),
                      trailing: Icon(
                        themeProvider.themeMode == ThemeMode.system
                         ? Icons.radio_button_checked
                         : Icons.radio_button_unchecked,
                        color: themeProvider.themeMode == ThemeMode.system
                         ? Theme.of(context).colorScheme.primary
                         : Theme.of(context).hintColor,
                      ),
                      onTap: showColorPicker, // Abre el selector de color
                   ),
                   // Muestra el color actual si es custom
                    if (themeProvider.themeMode == ThemeMode.system)
                      Padding(
                        padding: const EdgeInsets.only(left: 16.0, top: 8.0),
                        child: Row(
                          children: [
                             Text('Color actual:', style: Theme.of(context).textTheme.bodySmall),
                             const SizedBox(width: 8),
                             Container(
                               width: 24,
                               height: 24,
                               decoration: BoxDecoration(
                                 color: themeProvider.customColor,
                                 borderRadius: BorderRadius.circular(4),
                                 border: Border.all(color: Theme.of(context).dividerColor),
                               ),
                             ),
                             const SizedBox(width: 8),
                             Text(
                               colorToHexString(themeProvider.customColor),
                               style: Theme.of(context).textTheme.bodySmall?.copyWith(fontFamily: 'monospace')
                             ),
                          ],
                        ),
                      )
                ],
              ),
            ),
          ),
          const SizedBox(height: 24), // Espacio

          // --- Efectos Visuales (Glow) ---
           Card(
            elevation: 1,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            clipBehavior: Clip.antiAlias,
            child: SwitchListTile(
              title: const Text('Activar brillo de neón'),
              subtitle: Text(
                'Añade un efecto de brillo sutil.',
                 style: Theme.of(context).textTheme.bodySmall,
              ),
              value: themeProvider.glowEnabled,
              activeColor: Theme.of(context).colorScheme.primary,
              onChanged: (bool value) {
                themeProvider.setGlowEnabled(value);
              },
              secondary: const Icon(LucideIcons.sparkles),
            ),
          ),

        ],
      ),
    );
  }
}