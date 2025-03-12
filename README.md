# BancoJK

Um aplicativo bancário simples desenvolvido com Expo e TypeScript, utilizando Firebase Firestore para armazenamento de dados.

## Funcionalidades

- Autenticação por CPF e senha
- Visualização de saldo e histórico de transações
- Transferências via PIX entre contas cadastradas
- Gerenciamento de chaves PIX (adicionar, remover)

## Tecnologias utilizadas

- React Native com Expo
- TypeScript
- Firebase Firestore
- React Navigation
- AsyncStorage para persistência local

## Configuração do projeto

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Configure o Firebase:

   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   - Adicione um aplicativo web ao projeto
   - Copie as credenciais do Firebase e substitua no arquivo `src/services/firebase.ts`

4. Execute o projeto:
   ```
   npm start
   ```

## Estrutura do banco de dados

O aplicativo utiliza o Firebase Firestore com a seguinte estrutura:

### Coleção `users`

```
{
  cpf: string,
  name: string,
  password: string,
  balance: number,
  pixKeys: [
    {
      id: string,
      type: 'CPF' | 'PHONE',
      value: string
    }
  ],
  transactions: [
    {
      id: string,
      date: string,
      amount: number,
      type: 'SENT' | 'RECEIVED',
      description: string,
      fromUser: string,
      toUser: string
    }
  ]
}
```

## Observações

- Este é um projeto de demonstração e não deve ser utilizado em produção sem implementar medidas adequadas de segurança.
- A senha é armazenada em texto puro no Firestore, o que não é recomendado para aplicações reais.
- Para um ambiente de produção, seria necessário implementar autenticação segura, criptografia de dados sensíveis e validações adicionais.
