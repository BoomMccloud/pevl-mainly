import parser from "cron-parser";
import { AES, enc } from "crypto-js";

const nextTime = (cronExpression: string) => {
  const interval = parser.parseExpression(cronExpression);
  return interval.next().toDate();
};

// 加密函数
function encrypt(plaintext: string, key: string): string {
  const encrypted = AES.encrypt(plaintext, key).toString();
  return encrypted;
}

// 解密函数
function decrypt(ciphertext: string, key: string): string {
  const decrypted = AES.decrypt(ciphertext, key).toString(enc.Utf8);
  return decrypted;
}

export { nextTime, encrypt, decrypt };
