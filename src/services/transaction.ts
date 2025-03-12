import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Transaction, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const transferPix = async (
  fromUserId: string,
  toUserId: string,
  amount: number,
  description: string
): Promise<boolean> => {
  try {
    // Verifica se o valor é válido
    if (amount <= 0) {
      return false;
    }

    // Busca usuário de origem
    const fromUserRef = doc(db, 'users', fromUserId);
    const fromUserDoc = await getDoc(fromUserRef);

    if (!fromUserDoc.exists()) {
      return false;
    }

    const fromUserData = fromUserDoc.data() as User;

    // Verifica se o usuário tem saldo suficiente
    if (fromUserData.balance < amount) {
      return false;
    }

    // Busca usuário de destino
    const toUserRef = doc(db, 'users', toUserId);
    const toUserDoc = await getDoc(toUserRef);

    if (!toUserDoc.exists()) {
      return false;
    }

    const toUserData = toUserDoc.data() as User;

    // Cria a transação
    const date = new Date().toISOString();
    const transactionId = uuidv4();

    const sentTransaction: Transaction = {
      id: transactionId,
      date,
      amount,
      type: 'SENT',
      description,
      fromUser: fromUserData.name,
      toUser: toUserData.name,
    };

    const receivedTransaction: Transaction = {
      id: transactionId,
      date,
      amount,
      type: 'RECEIVED',
      description,
      fromUser: fromUserData.name,
      toUser: toUserData.name,
    };

    // Atualiza o saldo e adiciona a transação para o remetente
    const fromUserTransactions = fromUserData.transactions || [];
    await updateDoc(fromUserRef, {
      balance: fromUserData.balance - amount,
      transactions: [sentTransaction, ...fromUserTransactions],
    });

    // Atualiza o saldo e adiciona a transação para o destinatário
    const toUserTransactions = toUserData.transactions || [];
    await updateDoc(toUserRef, {
      balance: toUserData.balance + amount,
      transactions: [receivedTransaction, ...toUserTransactions],
    });

    return true;
  } catch (error) {
    console.error('Erro ao realizar transferência PIX:', error);
    return false;
  }
};
