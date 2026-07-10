import { cookies } from "next/headers";
import { verifyToken, TokenPayload } from "./jwt";
import { db } from "./db";

export async function getSessionUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch (error) {
    return null;
  }
}

export async function isAdmin(): Promise<boolean> {
  const user = await getSessionUser();
  return user?.role === "ADMIN";
}

export async function getFullSessionUser() {
  const payload = await getSessionUser();
  if (!payload) return null;
  
  return db.user.findUnique({
    where: { id: payload.userId },
  });
}
