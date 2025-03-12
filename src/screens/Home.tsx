import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Transaction } from '../types';

export const HomeScreen: React.FC = () => {
  const { user, signOut, updateUser } = useAuth();
  const navigation = useNavigation();
  const [showBalance, setShowBalance] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      updateUser();
    }, [])
  );

  const handleTransfer = () => {
    navigation.navigate('Transfer' as never);
  };

  const handleManagePixKeys = () => {
    navigation.navigate('PixKeys' as never);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const isReceived = item.type === 'RECEIVED';
    const amountColor = isReceived ? '#2E7D32' : '#D32F2F';
    const amountPrefix = isReceived ? '+ ' : '- ';

    return (
      <View style={styles.transactionItem}>
        <View>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
          <Text style={styles.transactionParty}>
            {isReceived
              ? `De: ${item.fromUser?.split(' ')[0]}`
              : `Para: ${item.toUser?.split(' ')[0]}`}
          </Text>
        </View>
        <Text style={[styles.transactionAmount, { color: amountColor }]}>
          {amountPrefix}
          {formatCurrency(item.amount)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {user?.name}</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.balanceContainer}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Saldo disponível</Text>
          <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
            <Text style={styles.toggleBalanceText}>
              {showBalance ? 'Ocultar' : 'Mostrar'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.balanceValue}>
          {showBalance ? formatCurrency(user?.balance || 0) : 'R$ ••••••'}
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleTransfer}>
          <Text style={styles.actionButtonText}>Transferir</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleManagePixKeys}
        >
          <Text style={styles.actionButtonText}>Chaves PIX</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.transactionsContainer}>
        <Text style={styles.transactionsTitle}>Histórico de transações</Text>
        {user?.transactions && user.transactions.length > 0 ? (
          <FlatList
            data={user.transactions}
            keyExtractor={(item) => item.id}
            renderItem={renderTransactionItem}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Text style={styles.emptyTransactions}>
            Você ainda não possui transações
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
  },
  logoutText: {
    fontSize: 16,
    color: '#D32F2F',
  },
  balanceContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#757575',
  },
  toggleBalanceText: {
    fontSize: 14,
    color: '#2E7D32',
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#424242',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    padding: 16,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#424242',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 2,
  },
  transactionParty: {
    fontSize: 14,
    color: '#757575',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyTransactions: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginTop: 20,
  },
});
