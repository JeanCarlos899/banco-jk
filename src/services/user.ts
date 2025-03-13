import 'react-native-get-random-values';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { PixKey, Transaction, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const getUserByCpf = async (cpf: string): Promise<User | null> => {
  try {
    // usersRef é uma referência à coleção 'users'
    const usersRef = collection(db, 'users');
    // Consulta para buscar um usuário com o CPF informado
    const q = query(usersRef, where('cpf', '==', cpf));
    // Executa a consulta
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    return { ...(userDoc.data() as User), id: userDoc.id };
  } catch (error) {
    console.error('Erro ao buscar usuário por CPF:', error);
    return null;
  }
};

export const getUserByPixKey = async (
  keyType: string,
  keyValue: string
): Promise<User | null> => {
  try {
    if (keyType !== 'CPF' && keyType !== 'PHONE') {
      return null;
    }

    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);

    for (const userDoc of querySnapshot.docs) {
      const userData = userDoc.data() as User;
      const pixKey = userData.pixKeys?.find(
        (key) => key.type === keyType && key.value === keyValue
      );

      if (pixKey) {
        return { ...userData, id: userDoc.id };
      }
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar usuário por chave PIX:', error);
    return null;
  }
};

export const addPixKey = async (
  userId: string,
  keyType: string,
  keyValue: string
): Promise<boolean> => {
  try {
    if (keyType !== 'CPF' && keyType !== 'PHONE') {
      return false;
    }

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return false;
    }

    const userData = userDoc.data() as User;
    const pixKeys = userData.pixKeys || [];

    const keyExists = pixKeys.some(
      (key) => key.type === keyType && key.value === keyValue
    );

    if (keyExists) {
      return false;
    }

    const newKey: PixKey = {
      id: uuidv4(),
      type: keyType as any,
      value: keyValue,
    };

    await updateDoc(userRef, {
      pixKeys: [...pixKeys, newKey],
    });

    return true;
  } catch (error) {
    console.error('Erro ao adicionar chave PIX:', error);
    return false;
  }
};

export const removePixKey = async (
  userId: string,
  keyId: string
): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return false;
    }

    const userData = userDoc.data() as User;
    const pixKeys = userData.pixKeys || [];

    const updatedKeys = pixKeys.filter((key) => key.id !== keyId);

    await updateDoc(userRef, {
      pixKeys: updatedKeys,
    });

    return true;
  } catch (error) {
    console.error('Erro ao remover chave PIX:', error);
    return false;
  }
};

export const editPixKey = async (
  userId: string,
  keyId: string,
  newValue: string
): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return false;
    }

    const userData = userDoc.data() as User;
    const pixKeys = userData.pixKeys || [];

    const keyIndex = pixKeys.findIndex((key) => key.id === keyId);
    if (keyIndex === -1) {
      return false;
    }

    // Verifica se já existe uma chave com o novo valor
    const keyExists = pixKeys.some(
      (key) => key.value === newValue && key.id !== keyId
    );

    if (keyExists) {
      return false;
    }

    // Atualiza o valor da chave
    pixKeys[keyIndex] = {
      ...pixKeys[keyIndex],
      value: newValue,
    };

    await updateDoc(userRef, {
      pixKeys: pixKeys,
    });

    return true;
  } catch (error) {
    console.error('Erro ao editar chave PIX:', error);
    return false;
  }
};
