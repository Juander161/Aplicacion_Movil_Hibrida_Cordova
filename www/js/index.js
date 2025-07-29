/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Inicialización de la aplicación Patitas Felices
// Esperar a que el dispositivo esté listo antes de usar las APIs de Cordova
// Ver: https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready

// Función que se ejecuta cuando el dispositivo está listo
function onDeviceReady() {
    Logger.info('Dispositivo listo - Cordova inicializado');
    Logger.info('Plataforma: ' + cordova.platformId + '@' + cordova.version);
    
    // Configurar la aplicación móvil
    setupMobileApp();
    
    // Inicializar la aplicación principal
    if (typeof initializeApp === 'function') {
        initializeApp();
    } else {
        Logger.warn('Función initializeApp no encontrada');
        // Fallback: inicializar directamente
        if (typeof app === 'undefined') {
            Logger.info('Inicializando aplicación...');
            // La aplicación se inicializará automáticamente cuando se carguen todos los scripts
        }
    }
}

// Configurar la aplicación móvil
function setupMobileApp() {
    try {
        // Configurar StatusBar
        if (window.StatusBar) {
            StatusBar.styleDefault();
            StatusBar.backgroundColorByHexString('#2E8B57');
            Logger.info('StatusBar configurada');
        }
        
        // Configurar SplashScreen
        if (window.navigator && window.navigator.splashscreen) {
            setTimeout(function() {
                navigator.splashscreen.hide();
                Logger.info('SplashScreen ocultada');
            }, 3000);
        }
        
        // Configurar eventos de pausa y resume
        document.addEventListener('pause', onPause, false);
        document.addEventListener('resume', onResume, false);
        document.addEventListener('backbutton', onBackButton, false);
        
        // Eventos de red
        document.addEventListener('online', onOnline, false);
        document.addEventListener('offline', onOffline, false);
        
        Logger.info('Configuración móvil completada');
        
    } catch (error) {
        Logger.error('Error configurando aplicación móvil:', error);
    }
}

// Función que se ejecuta cuando la aplicación se pausa
function onPause() {
    Logger.info('Aplicación pausada');
    // Guardar estado de la aplicación
    if (window.saveAppState) {
        window.saveAppState();
    }
}

// Función que se ejecuta cuando la aplicación se reanuda
function onResume() {
    Logger.info('Aplicación reanudada');
    // Verificar conexión y sincronizar datos
    if (window.checkConnection) {
        window.checkConnection();
    }
}

// Función que maneja el botón atrás
function onBackButton(e) {
    e.preventDefault();
    
    // Si hay un modal abierto, cerrarlo
    const activeModal = document.querySelector('.modal.active');
    if (activeModal) {
        if (window.closeAllModals) {
            window.closeAllModals();
        }
        return;
    }
    
    // Si no estamos en dashboard, ir al dashboard
    if (window.app && window.app.currentSection !== 'dashboard') {
        window.showSection('dashboard');
        return;
    }
    
    // Si estamos en dashboard, mostrar diálogo de salida
    if (window.navigator && navigator.notification) {
        navigator.notification.confirm(
            '¿Deseas salir de la aplicación?',
            function(buttonIndex) {
                if (buttonIndex === 1) {
                    navigator.app.exitApp();
                }
            },
            'Salir de Patitas Felices',
            ['Sí', 'No']
        );
    } else {
        // Fallback para navegador
        if (confirm('¿Deseas salir de la aplicación?')) {
            window.close();
        }
    }
}

// Función que se ejecuta cuando se restaura la conexión
function onOnline() {
    Logger.info('Conexión restaurada');
    if (window.handleOnline) {
        window.handleOnline();
    }
}

// Función que se ejecuta cuando se pierde la conexión
function onOffline() {
    Logger.info('Conexión perdida');
    if (window.handleOffline) {
        window.handleOffline();
    }
}

// Esperar a que el dispositivo esté listo
if (window.cordova) {
    document.addEventListener('deviceready', onDeviceReady, false);
} else {
    // Para desarrollo en navegador
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onDeviceReady);
    } else {
        onDeviceReady();
    }
}

// Logger básico si no está definido
if (typeof Logger === 'undefined') {
    window.Logger = {
        debug: function(...args) { console.log('[DEBUG]', ...args); },
        info: function(...args) { console.info('[INFO]', ...args); },
        warn: function(...args) { console.warn('[WARN]', ...args); },
        error: function(...args) { console.error('[ERROR]', ...args); }
    };
}

Logger.info('Index.js cargado correctamente');
