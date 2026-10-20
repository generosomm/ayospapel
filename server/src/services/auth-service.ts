import { randomBytes } from "node:crypto";
import type { Repository } from "../repositories/repository.js";
import { hashSessionToken, verifyPassword } from "../utils/password.js";
import { HttpError } from "../utils/http-error.js";

export class AuthService {
  constructor(
    private readonly repository: Repository,
    private readonly sessionTtlHours: number
  ) {}

  signIn(email: string, password: string) {
    const user = this.repository.findUserByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new HttpError(401, "Email or password is incorrect.", "INVALID_CREDENTIALS");
    }
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(
      Date.now() + this.sessionTtlHours * 60 * 60 * 1000
    ).toISOString();
    this.repository.createSession(user.id, hashSessionToken(token), expiresAt);
    const { passwordHash: _passwordHash, ...principal } = user;
    return { token, expiresAt, principal };
  }

  signOut(token: string | undefined): void {
    if (token) this.repository.deleteSession(hashSessionToken(token));
  }

  authenticate(token: string | undefined) {
    if (!token) return null;
    return this.repository.findPrincipalBySession(
      hashSessionToken(token),
      new Date().toISOString()
    );
  }
}
