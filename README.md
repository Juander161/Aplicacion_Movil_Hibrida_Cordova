# 🐾 Aplicación Móvil - Clínica Veterinaria Patitas Felices

Aplicación móvil híbrida desarrollada con Apache Cordova para la gestión completa de una clínica veterinaria. Integrada con una API REST de MongoDB para proporcionar una experiencia completa de gestión veterinaria.

## 🚀 Características

### ✅ Autenticación y Roles
- **Sistema de Login/Registro** con JWT
- **Roles de Usuario**: Cliente, Veterinario, Recepcionista, Administrador
- **Gestión de Perfiles** personalizada por rol

### ✅ Gestión de Mascotas
- **CRUD Completo** de mascotas
- **Información Detallada**: Nombre, especie, raza, edad, peso
- **Asociación con Propietarios**

### ✅ Sistema de Citas
- **Programación de Citas** con fecha y hora
- **Asignación de Veterinarios**
- **Estados de Cita**: Pendiente, Confirmada, Completada, Cancelada
- **Filtros por Estado**

### ✅ Historiales Médicos
- **Registro de Consultas** (solo veterinarios)
- **Síntomas, Diagnóstico y Tratamiento**
- **Observaciones Médicas**
- **Historial Completo por Mascota**

### ✅ Gestión de Usuarios
- **Vista de Usuarios** (admin/recepcionista)
- **Filtros por Rol**
- **Gestión de Permisos**

### ✅ Dashboard Interactivo
- **Estadísticas en Tiempo Real**
- **Acciones Rápidas** según rol
- **Interfaz Responsive**

## 📱 Tecnologías Utilizadas

- **Apache Cordova** - Framework híbrido
- **HTML5, CSS3, JavaScript ES6+**
- **Font Awesome** - Iconografía
- **API REST** - Comunicación con backend
- **JWT** - Autenticación segura
- **LocalStorage** - Persistencia local

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js (v14 o superior)
- Apache Cordova CLI
- API REST funcionando en `http://localhost:3000`

### 1. Instalar Cordova CLI
```bash
npm install -g cordova
```

### 2. Clonar el proyecto
```bash
git clone <url-del-repositorio>
cd Veterinaria
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Configurar la API
Editar `www/js/config.js` para apuntar a tu API:
```javascript
API_BASE_URL: 'http://localhost:3000/api'
```

### 5. Ejecutar la aplicación

#### Desarrollo (navegador)
```bash
cordova serve
```

#### Android
```bash
cordova platform add android
cordova build android
cordova run android
```

#### iOS
```bash
cordova platform add ios
cordova build ios
cordova run ios
```

## 🔧 Configuración de la API

La aplicación está configurada para trabajar con la API REST de MongoDB. Asegúrate de que tu API esté ejecutándose en `http://localhost:3000` con los siguientes endpoints:

### Endpoints Requeridos
- `POST /api/auth/login` - Autenticación
- `POST /api/auth/registro` - Registro de usuarios
- `GET /api/auth/perfil` - Perfil del usuario
- `GET /api/mascotas` - Listar mascotas
- `POST /api/mascotas` - Crear mascota
- `PUT /api/mascotas/:id` - Actualizar mascota
- `DELETE /api/mascotas/:id` - Eliminar mascota
- `GET /api/citas` - Listar citas
- `POST /api/citas` - Crear cita
- `PUT /api/citas/:id` - Actualizar cita
- `DELETE /api/citas/:id` - Eliminar cita
- `GET /api/historiales` - Listar historiales
- `POST /api/historiales` - Crear historial
- `PUT /api/historiales/:id` - Actualizar historial
- `DELETE /api/historiales/:id` - Eliminar historial
- `GET /api/usuarios` - Listar usuarios
- `DELETE /api/usuarios/:id` - Eliminar usuario

## 👥 Roles y Permisos

### 🔐 Cliente
- ✅ Gestionar sus propias mascotas
- ✅ Programar y ver sus citas
- ✅ Ver historiales de sus mascotas

### 🏥 Veterinario
- ✅ Ver todas las mascotas
- ✅ Gestionar historiales médicos
- ✅ Ver y actualizar citas
- ✅ Crear nuevos historiales

### 📋 Recepcionista
- ✅ Ver usuarios del sistema
- ✅ Gestionar citas
- ✅ Ver mascotas
- ✅ Asignar veterinarios

### 👑 Administrador
- ✅ Acceso completo a todas las funcionalidades
- ✅ Gestionar usuarios
- ✅ Eliminar registros
- ✅ Control total del sistema

## 🎨 Características de la UI

### ✨ Diseño Moderno
- **Gradientes y Sombras** para profundidad visual
- **Animaciones Suaves** en transiciones
- **Iconografía Font Awesome** para mejor UX
- **Colores por Rol** para identificación rápida

### 📱 Responsive Design
- **Adaptable a diferentes pantallas**
- **Navegación táctil optimizada**
- **Modales y formularios móviles**

### 🎯 Interacciones
- **Hover Effects** en elementos interactivos
- **Loading States** para feedback visual
- **Toast Notifications** para confirmaciones
- **Smooth Transitions** entre vistas

## 🔐 Seguridad

### Autenticación JWT
- **Tokens seguros** para autenticación
- **Expiración automática** de sesiones
- **Almacenamiento local** seguro

### Validación de Datos
- **Validación en frontend** para mejor UX
- **Sanitización de inputs**
- **Manejo de errores** robusto

## 📊 Funcionalidades por Rol

### Dashboard Personalizado
Cada rol ve estadísticas relevantes:
- **Cliente**: Sus mascotas y citas
- **Veterinario**: Historiales y citas
- **Recepcionista**: Usuarios y citas
- **Admin**: Estadísticas completas

### Acciones Rápidas
Botones de acceso directo según el rol del usuario para las tareas más comunes.

## 🐛 Solución de Problemas

### Error de Conexión a la API
1. Verificar que la API esté ejecutándose
2. Revisar la URL en `config.js`
3. Comprobar CORS en el servidor

### Error de Autenticación
1. Verificar credenciales
2. Limpiar localStorage
3. Revisar token JWT

### Problemas de Build
1. Verificar que Cordova esté instalado
2. Revisar dependencias de plataforma
3. Limpiar cache: `cordova clean`

## 📱 Uso de la Aplicación

### 1. Inicio de Sesión
- Usar credenciales de la API
- Demo admin: `admin@clinica.com` / `admin123456`

### 2. Navegación
- **Inicio**: Dashboard con estadísticas
- **Mascotas**: Gestión de mascotas
- **Citas**: Programación y gestión
- **Historiales**: Registros médicos (veterinarios)
- **Usuarios**: Gestión de usuarios (admin/recep)

### 3. Gestión de Datos
- **Agregar**: Botón "+" en cada sección
- **Editar**: Icono de lápiz en cada elemento
- **Eliminar**: Icono de papelera (con confirmación)

## 🚀 Despliegue

### Producción
1. Cambiar URL de API en `config.js`
2. Build para plataforma específica
3. Firmar aplicación (Android/iOS)
4. Subir a stores

### Desarrollo
```bash
# Servir en navegador
cordova serve

# Build para Android
cordova build android

# Build para iOS
cordova build ios
```

## 📝 Notas de Desarrollo

- La aplicación utiliza **ES6+** para mejor rendimiento
- **Modularización** para mantenimiento fácil
- **Responsive design** para múltiples dispositivos
- **Optimización** para rendimiento móvil

## 👨‍💻 Autor

Juan de Dios Valero Casillas

## 📄 Licencia

ISC

---

**¡Disfruta gestionando tu clínica veterinaria con Patitas Felices! 🐾** 