export interface TextData {
  text: string;
  userName: string;
  displayType: 'text' | 'qrcode';
  createdAt: string;
  expiresAt: string;
}