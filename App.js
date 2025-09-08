import React from 'react';
import { LogBox, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CustomAuthProvider } from './src/context/CustomAuthContext';
import { NotificationsProvider } from './src/context/NotificationsContext';
import AppNavigator from './src/navigation/AppNavigator';

// Ignore specific harmless warnings to reduce noise
LogBox.ignoreLogs([
  'Sending `onAnimatedValueUpdate` with no listeners registered',
  'VirtualizedLists should never be nested'
]);

// Simple error boundary component
class AppErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error("App crashed:", error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Something went wrong
          </Text>
          <Text style={{ textAlign: 'center', marginBottom: 20 }}>
            The app encountered an error. Please restart the application.
          </Text>
          <Text style={{ fontSize: 12, color: '#999' }}>
            Error: {this.state.error?.toString()}
          </Text>
        </View>
      );
    }
    
    return this.props.children;
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <CustomAuthProvider>
          <NotificationsProvider>
            <AppNavigator />
          </NotificationsProvider>
        </CustomAuthProvider>
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}


