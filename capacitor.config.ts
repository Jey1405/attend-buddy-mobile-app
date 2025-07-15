import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.b84f286848d44b1cb12b89200aa0bea2',
  appName: 'Student Attendance App',
  webDir: 'dist',
  server: {
    url: 'https://b84f2868-48d4-4b1c-b12b-89200aa0bea2.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3b82f6',
      showSpinner: false
    }
  }
};

export default config;