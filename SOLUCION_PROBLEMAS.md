# 🔧 Solución de Problemas - Patitas Felices

## Problemas Identificados y Soluciones

### 1. **Content Security Policy (CSP) - Fuentes**

**Problema:**
```
Refused to load the font 'https://fonts.gstatic.com/s/spacemono/v6/i7dPIFZifjKcF5UAWdDRYE58RXi4EwSsbg.woff2' because it violates the following Content Security Policy directive: "font-src 'self' https://cdnjs.cloudflare.com".
```

**Solución:**
✅ **Ya corregido** - Se actualizaron las políticas CSP en:
- `config.xml` - Agregadas políticas para fuentes de Google
- `www/index.html` - Actualizada la meta tag CSP

### 2. **CORS Policy - Conexión a API**

**Problema:**
```
Access to fetch at 'https://dlnk.one/e?id=nol9RNkNdre4&type=1' from origin 'http://127.0.0.1:5500' has been blocked by CORS policy
```

**Solución:**
✅ **Ya corregido** - Se actualizaron las políticas CSP para permitir conexiones a:
- `http://127.0.0.1:3000`
- `http://localhost:3000`
- `http://192.168.1.100:3000`

### 3. **API URL Incorrecta**

**Problema:**
```
Fetch API cannot load https://tu-servidor.com/api/auth/login. Refused to connect because it violates the document's Content Security Policy.
```

**Solución:**
✅ **Ya corregido** - Se actualizó la configuración para usar:
- Desarrollo: `http://127.0.0.1:3000/api`
- Producción: `https://tu-servidor.com/api`

## 🚀 Cómo Usar la Aplicación Ahora

### **1. Configuración Inicial**

```bash
# Navegar al directorio del proyecto
cd Aplicacion_Movil_Hibrida_Cordova

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run serve
```

### **2. Cambiar URL de la API (si es necesario)**

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Ver URLs disponibles
listAPIUrls();

// Cambiar a localhost
changeAPIUrl('localhost');

// Cambiar a 127.0.0.1
changeAPIUrl('localhost_alt');

// Cambiar a Docker
changeAPIUrl('docker');

// Auto-detect la mejor URL
autoDetectAPIUrl();
```

### **3. Login Automático (para pruebas)**

```javascript
// Login como admin
autoLoginDemo('admin');

// Login como veterinario
autoLoginDemo('veterinario');

// Login como recepcionista
autoLoginDemo('recepcionista');

// Login como cliente
autoLoginDemo('cliente');
```

### **4. Verificar Conexión**

```javascript
// Probar conexión actual
testAPIConnection();

// Probar todas las URLs
testAllAPIUrls();

// Mostrar información de desarrollo
showDevInfo();
```

## 🔧 Configuración Manual

### **Si tu API está en una URL diferente:**

1. **Editar `www/js/dev-config.js`:**
```javascript
// Cambiar esta línea
CURRENT_API_URL: 'http://TU-IP:3000/api'
```

2. **O usar la consola:**
```javascript
// Cambiar dinámicamente
updateAPIUrl('http://TU-IP:3000/api');
```

### **Si tu API usa HTTPS:**

1. **Editar `www/js/config.js`:**
```javascript
development: {
    API_BASE_URL: 'https://tu-dominio.com/api',
    // ...
}
```

## 📋 URLs Preconfiguradas

| Clave | URL | Uso |
|-------|-----|-----|
| `localhost` | `http://localhost:3000/api` | Desarrollo local |
| `localhost_alt` | `http://127.0.0.1:3000/api` | Desarrollo alternativo |
| `docker` | `http://192.168.1.100:3000/api` | Docker/Red local |
| `production` | `https://tu-servidor.com/api` | Producción |

## 🔍 Verificar que Todo Funcione

### **1. Abrir la aplicación:**
```
http://127.0.0.1:5500/www/index.html
```

### **2. Verificar en la consola:**
```javascript
// Deberías ver algo como:
🔧 Configuración de la aplicación:
   Entorno: development
   API URL: http://127.0.0.1:3000/api
   Debug: true
   Móvil: false
```

### **3. Probar login:**
- Email: `admin@clinica.com`
- Password: `admin123456`

## 🛠️ Comandos Útiles

### **En la consola del navegador:**

```javascript
// Cambiar entorno
switchToDevelopment();
switchToProduction();

// Ver configuración actual
getConfig();

// Probar conexión
testAPIConnection();

// Auto-login
autoLoginDemo('admin');
```

### **En el terminal:**

```bash
# Servir la aplicación
npm run serve

# Construir para Android
npm run build:android

# Construir para iOS
npm run build:ios

# Ejecutar en dispositivo
npm run run:android
npm run run:ios
```

## 🚨 Si Aún Hay Problemas

### **1. Verificar que la API esté corriendo:**
```bash
# En el directorio de tu API
npm start
# o
docker-compose up
```

### **2. Verificar puertos:**
- API: `http://127.0.0.1:3000`
- App: `http://127.0.0.1:5500`

### **3. Verificar firewall:**
- Asegúrate de que el puerto 3000 esté abierto
- Si usas Docker, verifica que el puerto esté expuesto

### **4. Verificar CORS en el servidor:**
Tu API debe permitir requests desde:
- `http://127.0.0.1:5500`
- `http://localhost:5500`
- `http://192.168.1.100:5500`

## 📞 Soporte

Si sigues teniendo problemas:

1. **Verifica la consola del navegador** para errores específicos
2. **Verifica que tu API esté corriendo** en el puerto correcto
3. **Prueba las diferentes URLs** con `testAllAPIUrls()`
4. **Usa el auto-detect** con `autoDetectAPIUrl()`

---

**¡La aplicación debería funcionar correctamente ahora!** 🎉 