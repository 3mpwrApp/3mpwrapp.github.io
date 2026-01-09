/**
 * Type declarations for crypto-js module
 * This file provides type information for the crypto-js library
 */

declare module 'crypto-js' {
  namespace CryptoJS {
    namespace lib {
      interface WordArray {
        toString(): string;
      }
      function WordArray(toWords?: number[], sigBytes?: number): WordArray;
      namespace WordArray {
        function random(nBytes: number): WordArray;
      }
    }

    namespace AES {
      function encrypt(plaintext: string, key: string | lib.WordArray, options?: any): any;
      function decrypt(ciphertext: string, key: string | lib.WordArray, options?: any): lib.WordArray;
    }

    const PBKDF2: (password: string, salt: string | lib.WordArray, options?: any) => lib.WordArray;

    namespace enc {
      const Base64: {
        stringify(wordArray: lib.WordArray): string;
        parse(str: string): lib.WordArray;
      };
      const Base64url: {
        stringify(wordArray: lib.WordArray): string;
        parse(str: string): lib.WordArray;
      };
      const Base32: {
        stringify(wordArray: lib.WordArray): string;
        parse(str: string): lib.WordArray;
      };
      const Hex: {
        stringify(wordArray: lib.WordArray): string;
        parse(str: string): lib.WordArray;
      };
      const Latin1: {
        stringify(wordArray: lib.WordArray): string;
        parse(str: string): lib.WordArray;
      };
      const Utf8: {
        stringify(wordArray: lib.WordArray): string;
        parse(str: string): lib.WordArray;
      };
      const Utf8url: {
        stringify(wordArray: lib.WordArray): string;
        parse(str: string): lib.WordArray;
      };
    }

    namespace mode {
      const CBC: any;
    }

    namespace pad {
      const Pkcs7: any;
    }
  }

  export = CryptoJS;
}

