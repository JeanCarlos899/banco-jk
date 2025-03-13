import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { User } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const login = async (
  cpf: string,
  password: string
): Promise<User | null> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('cpf', '==', cpf));
    // Executa a consulta e retorna os documentos
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data() as User;

    if (userData.password !== password) {
      return null;
    }

    const user = { ...userData, id: userDoc.id };
    await AsyncStorage.setItem('@BancoJK:user', JSON.stringify(user));

    return user;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  await AsyncStorage.removeItem('@BancoJK:user');
};

// Obtém o usuário atualizado do Firebase e atualiza o AsyncStorage
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userJson = await AsyncStorage.getItem('@BancoJK:user');

    if (!userJson) {
      return null;
    }

    const storedUser = JSON.parse(userJson) as User;

    const userRef = doc(db, 'users', storedUser.id);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }
  // Converte os dados do documento em um objeto User
    const userData = userDoc.data() as User;
    const updatedUser = { ...userData, id: userDoc.id };

    // Atualiza o AsyncStorage com os dados mais recentes
    await AsyncStorage.setItem('@BancoJK:user', JSON.stringify(updatedUser));

    return updatedUser;
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    return null;
  }
};
