import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { getUserByPixKey } from '../services/user';
import { transferPix } from '../services/transaction';
import { TextInputMask } from 'react-native-masked-text';

export const TransferScreen: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigation = useNavigation();
  const [keyType, setKeyType] = useState<string>('CPF');
  const [keyValue, setKeyValue] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleTransfer = async () => {
    if (!keyValue || !amount || !description) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    const amountValue = parseFloat(
      amount.replace('R$', '').replace('.', '').replace(',', '.').trim()
    );

    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Erro', 'Valor inválido');
      return;
    }

    if (amountValue > (user?.balance || 0)) {
      Alert.alert('Erro', 'Saldo insuficiente');
      return;
    }

    setLoading(true);

    try {
      // Limpa o valor da chave (remove formatação)
      let cleanKeyValue = keyValue;
      if (keyType === 'CPF') {
        cleanKeyValue = keyValue.replace(/\D/g, '');
      } else if (keyType === 'PHONE') {
        cleanKeyValue = keyValue.replace(/\D/g, '');
      }

      // Busca o destinatário pela chave PIX
      const recipient = await getUserByPixKey(keyType, cleanKeyValue);

      if (!recipient) {
        Alert.alert('Erro', 'Destinatário não encontrado');
        return;
      }

      if (recipient.id === user?.id) {
        Alert.alert('Erro', 'Não é possível transferir para si mesmo');
        return;
      }

      // Realiza a transferência
      const success = await transferPix(
        user?.id || '',
        recipient.id,
        amountValue,
        description
      );

      if (success) {
        await updateUser();
        Alert.alert('Sucesso', 'Transferência realizada com sucesso', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Erro', 'Não foi possível realizar a transferência');
      }
    } catch (error) {
      console.error('Erro ao realizar transferência:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao realizar a transferência');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Transferência PIX</Text>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tipo de chave</Text>
            <View style={styles.keyTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.keyTypeButton,
                  keyType === 'CPF' && styles.keyTypeButtonActive,
                ]}
                onPress={() => {
                  setKeyType('CPF');
                  setKeyValue('');
                }}
              >
                <Text
                  style={[
                    styles.keyTypeText,
                    keyType === 'CPF' && styles.keyTypeTextActive,
                  ]}
                >
                  CPF
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.keyTypeButton,
                  keyType === 'PHONE' && styles.keyTypeButtonActive,
                ]}
                onPress={() => {
                  setKeyType('PHONE');
                  setKeyValue('');
                }}
              >
                <Text
                  style={[
                    styles.keyTypeText,
                    keyType === 'PHONE' && styles.keyTypeTextActive,
                  ]}
                >
                  Telefone
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Chave PIX</Text>
            <TextInputMask
              type={keyType === 'CPF' ? 'cpf' : 'cel-phone'}
              options={
                keyType === 'PHONE'
                  ? {
                      maskType: 'BRL',
                      withDDD: true,
                      dddMask: '(99) ',
                    }
                  : undefined
              }
              value={keyValue}
              onChangeText={setKeyValue}
              style={styles.input}
              placeholder={
                keyType === 'CPF' ? '000.000.000-00' : '(00) 00000-0000'
              }
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Valor</Text>
            <TextInputMask
              type={'money'}
              options={{
                precision: 2,
                separator: ',',
                delimiter: '.',
                unit: 'R$ ',
                suffixUnit: '',
              }}
              value={amount}
              onChangeText={setAmount}
              style={styles.input}
              placeholder="R$ 0,00"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              style={styles.input}
              placeholder="Descreva a transferência"
              maxLength={50}
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleTransfer}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Transferir</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 24,
    marginTop: 20,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  keyTypeContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  keyTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 12,
  },
  keyTypeButtonActive: {
    backgroundColor: '#2E7D32',
  },
  keyTypeText: {
    fontSize: 14,
    color: '#757575',
  },
  keyTypeTextActive: {
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
