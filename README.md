# 🐾 Patitas Felices - Aplicación Móvil Híbrida

Aplicación móvil híbrida desarrollada con Apache Cordova para la gestión de la Clínica Veterinaria Patitas Felices.

## 🚀 Características

- ✅ **Multiplataforma** - Funciona en Android, iOS y navegador web
- ✅ **Autenticación JWT** - Sistema completo de login y registro
- ✅ **Roles de Usuario** - Cliente, Veterinario, Recepcionista, Admin
- ✅ **Gestión de Mascotas** - CRUD completo de mascotas
- ✅ **Sistema de Citas** - Programación y gestión de citas
- ✅ **Historiales Médicos** - Registro de consultas veterinarias
- ✅ **Gestión de Usuarios** - Administración de usuarios del sistema
- ✅ **Modo Offline** - Funcionalidad básica sin conexión
- ✅ **UI Responsive** - Interfaz adaptada para móviles
- ✅ **Notificaciones Toast** - Feedback visual para el usuario

## 📋 Requisitos Previos

### Para Desarrollo
- Node.js (v14 o superior)
- npm o yarn
- Apache Cordova CLI
- Android Studio (para desarrollo Android)
- Xcode (para desarrollo iOS, solo macOS)

### Para Ejecutar la API
- MongoDB (local o Atlas)
- Node.js (v14 o superior)

## 🛠️ Instalación

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd Aplicacion_Movil_Hibrida_Cordova
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Agregar Plataformas
```bash
# Para desarrollo en navegador
cordova platform add browser

# Para desarrollo en Android
cordova platform add android

# Para desarrollo en iOS (solo macOS)
cordova platform add ios
```

### 4. Instalar Plugins
```bash
cordova plugin add cordova-plugin-whitelist
cordova plugin add cordova-plugin-statusbar
cordova plugin add cordova-plugin-splashscreen
cordova plugin add cordova-plugin-device
cordova plugin add cordova-plugin-file
cordova plugin add cordova-plugin-network-information
```

## 🚀 Ejecutar la Aplicación

### Desarrollo en Navegador
```bash
# Servir la aplicación en navegador
npm run serve

# O con live reload
npm run dev
```

### Desarrollo en Android
```bash
# Verificar requisitos
cordova requirements

# Ejecutar en emulador
npm run emulate:android

# Ejecutar en dispositivo físico
npm run run:android
```

### Desarrollo en iOS (solo macOS)
```bash
# Ejecutar en simulador
npm run emulate:ios

# Ejecutar en dispositivo físico
npm run run:ios
```

## 🔧 Configuración

### Configurar URL de la API
Edita el archivo `www/js/config.js` y actualiza la URL de la API:

```javascript
// Para desarrollo local
API_BASE_URL: 'http://localhost:3000/api'

// Para servidor de producción
API_BASE_URL: 'https://tu-servidor.com/api'
```

### Configurar para Dispositivo Móvil
Si vas a probar en un dispositivo móvil, actualiza la IP en `config.js`:

```javascript
// Cambiar por la IP de tu computadora en la red local
return 'http://192.168.1.100:3000/api';
```

## 📱 Funcionalidades por Rol

### 👤 Cliente
- Ver y gestionar sus mascotas
- Programar citas veterinarias
- Ver historial de citas
- Actualizar información de perfil

### 🏥 Veterinario
- Ver todas las mascotas
- Gestionar historiales médicos
- Ver y actualizar citas
- Crear nuevos historiales

### 📞 Recepcionista
- Ver usuarios del sistema
- Gestionar citas
- Ver información de mascotas
- Asistir en la programación

### 👨‍💼 Administrador
- Acceso completo a todas las funcionalidades
- Gestionar usuarios del sistema
- Ver estadísticas generales
- Control total del sistema

## 🔐 Usuario Administrador por Defecto

Al iniciar la API por primera vez, se crea automáticamente un usuario administrador:

```
Email: admin@clinica.com
Password: admin123456
```

⚠️ **IMPORTANTE**: Cambia estas credenciales después del primer login por seguridad.

## 📁 Estructura del Proyecto

```
Aplicacion_Movil_Hibrida_Cordova/
├── config.xml                 # Configuración de Cordova
├── package.json              # Dependencias y scripts
├── www/                      # Código fuente de la aplicación
│   ├── index.html           # Página principal
│   ├── css/                 # Estilos CSS
│   │   ├── index.css       # Estilos principales
│   │   ├── components.css  # Componentes UI
│   │   └── mobile.css      # Estilos específicos móvil
│   ├── js/                  # JavaScript
│   │   ├── app.js          # Aplicación principal
│   │   ├── api.js          # Cliente API
│   │   ├── config.js       # Configuración
│   │   ├── auth.js         # Autenticación
│   │   ├── mascotas.js     # Gestión de mascotas
│   │   ├── citas.js        # Gestión de citas
│   │   ├── historiales.js  # Historiales médicos
│   │   ├── usuarios.js     # Gestión de usuarios
│   │   ├── ui.js           # Utilidades UI
│   │   └── navigation.js   # Navegación
│   └── img/                 # Imágenes e iconos
└── README.md               # Este archivo
```

## 🔌 Plugins de Cordova Utilizados

- **cordova-plugin-whitelist**: Control de acceso a recursos
- **cordova-plugin-statusbar**: Gestión de la barra de estado
- **cordova-plugin-splashscreen**: Pantalla de carga
- **cordova-plugin-device**: Información del dispositivo
- **cordova-plugin-file**: Acceso al sistema de archivos
- **cordova-plugin-network-information**: Información de red

## 🎨 Características de la UI

- **Diseño Material Design** - Interfaz moderna y intuitiva
- **Colores Veterinarios** - Paleta de colores verde y naranja
- **Iconografía Font Awesome** - Iconos consistentes
- **Animaciones Suaves** - Transiciones fluidas
- **Responsive Design** - Adaptable a diferentes tamaños
- **Modo Oscuro** - Soporte para tema oscuro (futuro)

## 📊 Funcionalidades Técnicas

### Autenticación
- JWT (JSON Web Tokens)
- Almacenamiento seguro local
- Verificación automática de sesión
- Logout automático en token expirado

### Gestión de Datos
- Sincronización con API REST
- Almacenamiento local para modo offline
- Cache inteligente de datos
- Reintentos automáticos en errores de red

### Seguridad
- Validación de formularios
- Sanitización de datos
- Control de acceso basado en roles
- Headers de seguridad

## 🐛 Solución de Problemas

### Error de Conexión a la API
1. Verifica que la API esté ejecutándose
2. Confirma la URL en `config.js`
3. Verifica la conectividad de red
4. Revisa los logs de la consola

### Error en Android
1. Verifica que Android Studio esté instalado
2. Confirma que las variables de entorno estén configuradas
3. Ejecuta `cordova requirements` para verificar
4. Limpia el proyecto: `cordova clean`

### Error en iOS
1. Verifica que Xcode esté instalado
2. Confirma que las herramientas de línea de comandos estén instaladas
3. Ejecuta `cordova requirements` para verificar
4. Limpia el proyecto: `cordova clean`

### Error de Plugins
1. Verifica que todos los plugins estén instalados
2. Ejecuta `cordova plugin list` para verificar
3. Reinstala los plugins si es necesario
4. Limpia y reconstruye el proyecto

## 📱 Comandos Útiles

### Desarrollo
```bash
# Ver información del proyecto
cordova info

# Ver requisitos del sistema
cordova requirements

# Limpiar proyecto
cordova clean

# Preparar proyecto
cordova prepare
```

### Construcción
```bash
# Construir para navegador
npm run build:browser

# Construir para Android
npm run build:android

# Construir para iOS
npm run build:ios
```

### Depuración
```bash
# Ver logs en tiempo real (Android)
adb logcat | grep "Cordova"

# Ver logs en tiempo real (iOS)
xcrun simctl spawn booted log stream --predicate 'process == "Cordova"'
```

## 🔄 Actualizaciones

### Actualizar Cordova
```bash
npm update -g cordova
```

### Actualizar Plugins
```bash
cordova plugin update
```

### Actualizar Plataformas
```bash
cordova platform update android
cordova platform update ios
```

## 📄 Licencia

ISC License

## 👨‍💻 Autor

Juan de Dios Valero Casillas

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para soporte técnico o preguntas sobre la aplicación:

- 📧 Email: admin@clinica.com
- 🌐 Sitio web: https://patitasfelices.com
- 📱 Teléfono: +52 123 456 7890

---

**¡Gracias por usar Patitas Felices! 🐾** 