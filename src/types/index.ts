export interface User {
  id: string;
  cpf: string;
  name: string;
  password: string;
  balance: number;
  pixKeys: PixKey[];
  transactions: Transaction[];
}

export interface PixKey {
  id: string;
  type: 'CPF' | 'PHONE';
  value: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'SENT' | 'RECEIVED';
  description: string;
  fromUser: string;
  toUser: string;
}
