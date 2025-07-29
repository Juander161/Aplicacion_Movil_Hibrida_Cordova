
/// <reference path="..\.vscode\typings\cordova\cordova.d.ts"/>

// Definiciones de tipos para Cordova y plugins

declare namespace Cordova {
  interface Device {
    cordova: string;
    model: string;
    platform: string;
    uuid: string;
    version: string;
    manufacturer: string;
    isVirtual: boolean;
    serial: string;
  }

  interface File {
    // Definiciones básicas para cordova-plugin-file
  }

  interface NetworkInformation {
    // Definiciones para cordova-plugin-network-information
  }
}

declare namespace cordova {
  const device: Cordova.Device;
  const file: Cordova.File;
  const network: Cordova.NetworkInformation;
}

declare namespace navigator {
  const device: Cordova.Device;
  const splashscreen: {
    hide(): void;
    show(): void;
  };
  const statusbar: {
    styleDefault(): void;
    styleLightContent(): void;
    styleBlackTranslucent(): void;
    styleBlackOpaque(): void;
    overlaysWebView(overlay: boolean): void;
    backgroundColorByName(colorName: string): void;
    backgroundColorByHexString(hexString: string): void;
    hide(): void;
    show(): void;
    isVisible: boolean;
  };
  const notification: {
    alert(message: string, alertCallback: () => void, title?: string, buttonName?: string): void;
    confirm(message: string, confirmCallback: (buttonIndex: number) => void, title?: string, buttonLabels?: string[]): void;
    prompt(message: string, promptCallback: (results: { buttonIndex: number; input1: string }) => void, title?: string, buttonLabels?: string[], defaultText?: string): void;
    beep(times: number): void;
    vibrate(milliseconds: number): void;
    vibrateWithPattern(pattern: number[], repeat: number): void;
    cancelVibration(): void;
  };
  const app: {
    exitApp(): void;
    backbutton: any;
  };
  const connection: {
    type: string;
    UNKNOWN: string;
    ETHERNET: string;
    WIFI: string;
    CELL_2G: string;
    CELL_3G: string;
    CELL_4G: string;
    CELL: string;
    NONE: string;
  };
}

declare namespace window {
  const cordova: typeof cordova;
  const device: Cordova.Device;
  const splashscreen: typeof navigator.splashscreen;
  const statusbar: typeof navigator.statusbar;
  const notification: typeof navigator.notification;
  const app: typeof navigator.app;
  const connection: typeof navigator.connection;
}

// Variables globales de la aplicación
declare global {
  interface Window {
    api: any;
    app: any;
    auth: any;
    Logger: {
      debug(...args: any[]): void;
      info(...args: any[]): void;
      warn(...args: any[]): void;
      error(...args: any[]): void;
    };
    Storage: {
      set(key: string, value: any): boolean;
      get(key: string): any;
      remove(key: string): boolean;
      clear(): boolean;
    };
    CONFIG: {
      API_BASE_URL: string;
      APP_NAME: string;
      VERSION: string;
      TOAST_DURATION: number;
      LOADING_TIMEOUT: number;
      STORAGE_KEYS: {
        TOKEN: string;
        USER: string;
        SETTINGS: string;
        OFFLINE_DATA: string;
      };
      NETWORK: {
        TIMEOUT: number;
        RETRY_ATTEMPTS: number;
        RETRY_DELAY: number;
      };
      MOBILE: {
        VIBRATION_DURATION: number;
        CAMERA_QUALITY: number;
        GEOLOCATION_TIMEOUT: number;
        GEOLOCATION_MAX_AGE: number;
      };
      CONNECTION_STATUS: {
        ONLINE: string;
        OFFLINE: string;
        CHECKING: string;
      };
      USER_ROLES: {
        ADMIN: string;
        VETERINARIO: string;
        RECEPCIONISTA: string;
        CLIENTE: string;
      };
    };
    showLogin(): void;
    showRegister(): void;
    showSection(section: string): void;
    showProfile(): void;
    logout(): void;
    editProfile(): void;
    togglePassword(inputId: string): void;
    handleBackButton(): void;
    handleOnline(): void;
    handleOffline(): void;
    saveAppState(): void;
    checkConnection(): Promise<boolean>;
    reloadCurrentSection(): void;
    showToast(message: string, type?: 'success' | 'error' | 'warning' | 'info'): void;
    closeAllModals(): void;
    showAddMascota(): void;
    showAddCita(): void;
    showAddHistorial(): void;
    closeMascotaModal(): void;
    closeCitaModal(): void;
    closeHistorialModal(): void;
    loadMascotas(): Promise<void>;
    loadCitas(): Promise<void>;
    loadHistoriales(): Promise<void>;
    loadUsuarios(): Promise<void>;
    isOnline(): boolean;
    isMobile(): boolean;
    getConfig(key?: string): any;
    updateAPIUrl(newUrl: string): void;
  }
}

export {};