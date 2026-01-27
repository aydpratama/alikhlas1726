import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePassword(password: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(password, hashed);
}

/**
 * Check if a string is likely a bcrypt hash
 */
export function isHashed(password: string): boolean {
    // Bcrypt hashes start with $2a$, $2b$, or $2y$ and are 60 characters long
    return /^\$2[ayb]\$.{56}$/.test(password);
}
