// lib/main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

// Importar Providers
import 'providers/theme_provider.dart';
// import 'providers/auth_provider.dart'; // (Futuro)

// Importar Pantallas
import 'screens/home_screen.dart';
// import 'screens/auth/login_screen.dart'; // (Futuro)

import 'app_theme.dart'; // Importar definiciones de tema

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Envolver la app con los Providers
    return MultiProvider(
      providers: [
        // ChangeNotifierProvider(create: (_) => AuthProvider()), // (Futuro)
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
      ],
      child: Consumer<ThemeProvider>( // Consumer para reaccionar a cambios de tema
        builder: (context, themeProvider, child) {
          ThemeData currentTheme;
          // Determinar el tema a aplicar
          if (themeProvider.themeMode == ThemeMode.light) {
            currentTheme = AppTheme.lightTheme;
          } else if (themeProvider.themeMode == ThemeMode.dark) {
            currentTheme = AppTheme.darkTheme;
          } else { // ThemeMode.system representa nuestro 'custom'
            currentTheme = AppTheme.getCustomTheme(themeProvider.customColor);
          }

          return MaterialApp(
            title: 'ActFijo App',
            debugShowCheckedModeBanner: false,
            theme: currentTheme, // Aplicar el tema calculado
            // themeMode: themeProvider.themeMode, // No necesitamos esto si calculamos arriba
            // darkTheme: AppTheme.darkTheme, // Ya no es necesario
            home: const HomeScreen(), // Por ahora va directo a HomeScreen
            // (Futuro: Lógica para mostrar Login o Home según AuthProvider)
            // home: Consumer<AuthProvider>(
            //   builder: (context, auth, _) {
            //     if (auth.isLoading) return SplashScreen(); // O un loader
            //     return auth.isAuthenticated ? HomeScreen() : LoginScreen();
            //   },
            // ),
             routes: {
               // '/login': (context) => LoginScreen(), // (Futuro)
               '/home': (context) => const HomeScreen(),
               // '/settings': (context) => SettingsScreen(), // Se navega desde el drawer
             },
          );
        },
      ),
    );
  }
}