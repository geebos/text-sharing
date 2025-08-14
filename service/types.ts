export interface TextData {
  text: string;
  userName: string;
  displayType: 'text' | 'qrcode';
  createdAt: string;
  expiresAt: string;
}

export interface ShareHistory {
  id: string;
  title: string;
  userName: string;
  createdAt: string;
  expiresAt: string;
}