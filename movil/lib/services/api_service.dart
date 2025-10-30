// lib/services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/constants.dart'; // Importar baseURL

class ApiService {
  // Función para obtener el token (la usaremos mucho)
  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token'); // Asumimos que guardamos el token con esta clave
  }

  // Función para actualizar preferencias de tema
  Future<void> updateMyThemePreferences(Map<String, dynamic> preferences) async {
    final token = await _getToken();
    if (token == null) {
      print("ApiService: No token found for updating theme.");
      // Podrías lanzar una excepción o manejarlo de otra forma
      return;
    }

    final url = Uri.parse('$apiBaseUrl/me/theme/');
    try {
      final response = await http.patch(
        url,
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(preferences),
      );

      if (response.statusCode == 200) {
        print("ApiService: Theme preferences updated successfully.");
        // No necesitamos devolver nada, pero podrías devolver response.body si quieres
      } else {
        print("ApiService: Error updating theme preferences - Status: ${response.statusCode}");
        print("ApiService: Error body: ${response.body}");
        // Lanza una excepción para que el Provider la capture
        throw Exception('Failed to update theme preferences: ${response.body}');
      }
    } catch (e) {
      print("ApiService: Exception during theme update: $e");
      throw Exception('Failed to update theme preferences: $e');
    }
  }

  // Aquí irán otras funciones API (getActivos, createDepartamento, etc.)
}