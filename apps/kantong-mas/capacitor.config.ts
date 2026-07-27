import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kantongmas2.app',
  appName: 'Kantong Mas Idaman',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
