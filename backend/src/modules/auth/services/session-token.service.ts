import { createHash, randomBytes } from "node:crypto";

export interface GeneratedSessionToken {
  token: string;
  tokenHash: string;
}

export class SessionTokenService {
  generate(): GeneratedSessionToken {
    const token = randomBytes(32).toString("hex");

    return {
      token,
      tokenHash: this.hash(token),
    };
  }

  hash(token: string): string {
    return createHash("sha256")
      .update(token, "utf8")
      .digest("hex");
  }
}
