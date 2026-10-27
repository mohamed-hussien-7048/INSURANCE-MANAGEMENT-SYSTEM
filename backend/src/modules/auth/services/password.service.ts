import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;
const MAX_BCRYPT_BYTES = 72;

export class PasswordService {
  async hash(password: string): Promise<string> {
    this.assertSupportedLength(password);
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  async verify(password: string, passwordHash: string): Promise<boolean> {
    if (Buffer.byteLength(password, "utf8") > MAX_BCRYPT_BYTES) {
      return false;
    }

    return bcrypt.compare(password, passwordHash);
  }

  private assertSupportedLength(password: string): void {
    if (Buffer.byteLength(password, "utf8") > MAX_BCRYPT_BYTES) {
      throw new Error("Password exceeds the supported byte length.");
    }
  }
}
