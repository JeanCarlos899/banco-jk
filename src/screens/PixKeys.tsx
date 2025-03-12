import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { addPixKey, removePixKey, editPixKey } from '../services/user';
import { TextInputMask } from 'react-native-masked-text';
import { PixKey } from '../types';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

type KeyType = 'CPF' | 'PHONE';

export const PixKeysScreen: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [pixKeys, setPixKeys] = useState<PixKey[]>([]);
  const [keyType, setKeyType] = useState<KeyType>('CPF');
  const [keyValue, setKeyValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [editingKey, setEditingKey] = useState<PixKey | null>(null);

  useEffect(() => {
    if (user?.pixKeys) {
      setPixKeys(user.pixKeys);
    }
  }, [user]);

  // Formata o valor para exibição na lista
  const formatDisplayValue = (type: KeyType, value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (type === 'CPF' && cleanValue.length === 11) {
      return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (type === 'PHONE' && cleanValue.length >= 10) {
      return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handleAddKey = async () => {
    if (!keyValue || !user) {
      Alert.alert('Erro', 'Preencha o valor da chave');
      return;
    }

    setLoading(true);

    try {
      let cleanValue = keyValue;
      if (keyType === 'CPF') {
        cleanValue = keyValue.replace(/\D/g, '');
      } else if (keyType === 'PHONE') {
        cleanValue = keyValue.replace(/\D/g, '');
      }

      const success = await addPixKey(user.id, keyType, cleanValue);

      if (success) {
        await updateUser();
        setKeyValue('');
        Alert.alert('Sucesso', 'Chave PIX adicionada com sucesso');
      } else {
        Alert.alert('Erro', 'Não foi possível adicionar a chave PIX');
      }
    } catch (error) {
      console.error('Erro ao adicionar chave PIX:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao adicionar a chave PIX');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveKey = async (keyId: string) => {
    if (!user) return;

    Alert.alert('Remover chave', 'Tem certeza que deseja remover esta chave?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            const success = await removePixKey(user.id, keyId);
            if (success) {
              await updateUser();
              Alert.alert('Sucesso', 'Chave PIX removida com sucesso');
            } else {
              Alert.alert('Erro', 'Não foi possível remover a chave PIX');
            }
          } catch (error) {
            console.error('Erro ao remover chave PIX:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao remover a chave PIX');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  // Inicia o modo de edição
  const handleEditKey = (key: PixKey) => {
    // Limpa o estado atual
    setKeyValue('');

    // Define o tipo da chave
    const type = key.type as KeyType;
    setKeyType(type);

    // Armazena a chave que está sendo editada
    setEditingKey(key);

    // Aplica o valor após definir o tipo
    setTimeout(() => {
      if (type === 'CPF') {
        // Para CPF, formatamos manualmente
        const cleanValue = key.value.replace(/\D/g, '');
        if (cleanValue.length === 11) {
          setKeyValue(
            cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
          );
        } else {
          setKeyValue(cleanValue);
        }
      } else if (type === 'PHONE') {
        // Para telefone, formatamos manualmente
        const cleanValue = key.value.replace(/\D/g, '');
        if (cleanValue.length >= 10) {
          setKeyValue(
            cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
          );
        } else {
          setKeyValue(cleanValue);
        }
      }
    }, 100);
  };

  // Cancela o modo de edição
  const handleCancelEdit = () => {
    setEditingKey(null);
    setKeyValue('');
    setKeyType('CPF');
  };

  // Altera o tipo de chave
  const handleTypeChange = (newType: KeyType) => {
    // Se o tipo for o mesmo, não faz nada
    if (newType === keyType) return;

    // Limpa o valor ao trocar o tipo
    setKeyValue('');
    setKeyType(newType);

    // Se estiver editando, atualiza o tipo da chave em edição
    if (editingKey) {
      setEditingKey({
        ...editingKey,
        type: newType,
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!user || !editingKey || !keyValue) {
      Alert.alert('Erro', 'Preencha o valor da chave');
      return;
    }

    setLoading(true);

    try {
      let cleanValue = keyValue;
      if (keyType === 'CPF') {
        cleanValue = keyValue.replace(/\D/g, '');
      } else if (keyType === 'PHONE') {
        cleanValue = keyValue.replace(/\D/g, '');
      }

      const success = await editPixKey(user.id, editingKey.id, cleanValue);

      if (success) {
        await updateUser();
        handleCancelEdit();
        Alert.alert('Sucesso', 'Chave PIX atualizada com sucesso');
      } else {
        Alert.alert('Erro', 'Não foi possível atualizar a chave PIX');
      }
    } catch (error) {
      console.error('Erro ao editar chave PIX:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao atualizar a chave PIX');
    } finally {
      setLoading(false);
    }
  };

  const renderKeyItem = ({ item }: { item: PixKey }) => (
    <View style={styles.keyItem}>
      <View>
        <Text style={styles.keyType}>
          {item.type === 'CPF' ? 'CPF' : 'Telefone'}
        </Text>
        <Text style={styles.keyValue}>
          {formatDisplayValue(item.type as KeyType, item.value)}
        </Text>
      </View>
      <View style={styles.keyActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditKey(item)}
        >
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveKey(item.id)}
        >
          <Text style={styles.removeButtonText}>Remover</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas chaves PIX</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2E7D32" style={styles.loader} />
      ) : (
        <>
          <View style={styles.addKeyForm}>
            <View style={styles.keyTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.keyTypeButton,
                  keyType === 'CPF' && styles.keyTypeButtonActive,
                ]}
                onPress={() => handleTypeChange('CPF')}
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
                onPress={() => handleTypeChange('PHONE')}
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

            <TouchableOpacity
              style={styles.addButton}
              onPress={editingKey ? handleSaveEdit : handleAddKey}
            >
              <Text style={styles.addButtonText}>
                {editingKey ? 'Salvar Alterações' : 'Adicionar Chave'}
              </Text>
            </TouchableOpacity>

            {editingKey && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelButtonText}>Cancelar Edição</Text>
              </TouchableOpacity>
            )}
          </View>

          {pixKeys.length > 0 ? (
            <FlatList
              data={pixKeys}
              renderItem={renderKeyItem}
              keyExtractor={(item) => item.id}
              style={styles.keysList}
            />
          ) : (
            <Text style={styles.emptyText}>
              Você ainda não possui chaves PIX cadastradas
            </Text>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 16,
    marginTop: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  addKeyForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  keyTypeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
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
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#D32F2F',
    fontSize: 16,
  },
  keysList: {
    flex: 1,
  },
  keyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 2,
  },
  keyType: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  keyValue: {
    fontSize: 16,
    color: '#424242',
  },
  keyActions: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    padding: 6,
    marginRight: 8,
  },
  editButtonText: {
    color: '#2E7D32',
    fontSize: 14,
  },
  removeButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    padding: 6,
  },
  removeButtonText: {
    color: '#D32F2F',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginTop: 20,
  },
});
