import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { LoginScreen } from '../screens/Login';
import { HomeScreen } from '../screens/Home';
import { TransferScreen } from '../screens/Transfer';
import { PixKeysScreen } from '../screens/PixKeys';
import { RegisterScreen } from '@/screens/Register';

const Stack = createStackNavigator();

export const Routes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2E7D32',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {user ? (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Transfer"
              component={TransferScreen}
              options={{ title: 'Transferência PIX' }}
            />
            <Stack.Screen
              name="PixKeys"
              component={PixKeysScreen}
              options={{ title: 'Chaves PIX' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Criar Conta' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
