// lib/providers/theme_provider.dart
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../utils/debounce.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart'; // Para colorToString

// Helper para convertir Color a Hex String '#RRGGBB'
String colorToHexString(Color color) {
  return '#${color.value.toRadixString(16).substring(2).toUpperCase()}';
}

// Helper para convertir Hex String '#RRGGBB' a Color (con fallback)
Color hexStringToColor(String? hexColor) {
  hexColor = (hexColor ?? '#6366F1').replaceAll("#", ""); // Default si es null
  if (hexColor.length == 6) {
    hexColor = "FF" + hexColor; // Add alpha if missing
  }
  try {
     if (hexColor.length == 8) {
       return Color(int.parse("0x$hexColor"));
     }
  } catch(e) {
     print("Error parsing hex color: $hexColor, defaulting.");
  }
  return const Color(0xFF6366F1); // Default índigo
}


class ThemeProvider with ChangeNotifier {
  final ApiService _apiService = ApiService(); // Instancia del servicio API
  final _debouncer = Debouncer(milliseconds: 1000); // Debouncer de 1 segundo

  ThemeMode _themeMode = ThemeMode.dark; // Default inicial
  Color _customColor = const Color(0xFF6366F1); // Default inicial
  bool _glowEnabled = false; // Default inicial

  ThemeMode get themeMode => _themeMode;
  Color get customColor => _customColor;
  bool get glowEnabled => _glowEnabled;

  // Método llamado por AuthProvider (futuro) o al inicio
  void loadInitialTheme(Map<String, dynamic>? userData) {
    print("ThemeProvider: Loading initial theme from user data: $userData");
    String themePref = userData?['theme_preference'] ?? 'dark';
    String? colorHex = userData?['theme_custom_color'];
    bool glow = userData?['theme_glow_enabled'] ?? false;

    _themeMode = themePref == 'light' ? ThemeMode.light :
                 themePref == 'custom' ? ThemeMode.system : // Usaremos system para Custom temporalmente
                 ThemeMode.dark;
    _customColor = hexStringToColor(colorHex);
    _glowEnabled = glow;

    // Si el tema es custom, _themeMode se ajustará en el ThemeData
    if (themePref == 'custom') {
       // Necesitamos una forma de saber que es custom. Podemos usar _themeMode = ThemeMode.system
       // y luego verificar en app_theme.dart
    }

    notifyListeners(); // Notificar a los widgets
    print("ThemeProvider: Initial theme loaded - Mode: $_themeMode, Color: $_customColor, Glow: $_glowEnabled");
  }

  void setThemeMode(ThemeMode mode) {
    if (_themeMode == mode) return;
    _themeMode = mode;
    notifyListeners();
    String prefValue = mode == ThemeMode.light ? 'light' : 'dark';
    // Si era 'system' (nuestro 'custom'), lo guardamos como 'custom'
    // Necesitamos una lógica mejor si 'custom' se activa directamente
    _debouncer.run(() => _savePreference({'theme_preference': prefValue}));
  }

  // Función específica para activar el tema 'custom'
   void setCustomTheme(Color color) {
    _themeMode = ThemeMode.system; // Usamos system como indicador de custom
    _customColor = color;
    notifyListeners();
    String colorHex = colorToHexString(color);
    _debouncer.run(() => _savePreference({
      'theme_preference': 'custom',
      'theme_custom_color': colorHex
    }));
  }


  void setCustomColor(Color color) {
    if (_customColor == color) return;
    _customColor = color;
    // Si el modo actual no es 'custom', lo cambiamos también
    if (_themeMode != ThemeMode.system) { // ThemeMode.system representa 'custom'
      _themeMode = ThemeMode.system;
    }
    notifyListeners();
    String colorHex = colorToHexString(color);
    _debouncer.run(() => _savePreference({
         'theme_preference': 'custom', // Asegurar que se guarde como custom
         'theme_custom_color': colorHex
    }));
  }

  void setGlowEnabled(bool enabled) {
    if (_glowEnabled == enabled) return;
    _glowEnabled = enabled;
    notifyListeners();
    _debouncer.run(() => _savePreference({'theme_glow_enabled': enabled}));
  }

  // Función privada para llamar a la API (manejada por el debouncer)
  Future<void> _savePreference(Map<String, dynamic> preference) async {
    try {
      await _apiService.updateMyThemePreferences(preference);
    } catch (e) {
      print("ThemeProvider: Failed to save preference - $e");
      // Aquí podrías usar showNotification si tuvieras acceso a él
      // (requiere pasar el BuildContext o usar un servicio global)
    }
  }

  @override
  void dispose() {
    _debouncer.dispose(); // Limpiar el timer del debouncer
    super.dispose();
  }
}