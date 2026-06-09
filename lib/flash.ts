import { cookies } from "next/headers";

const FLASH_COOKIE = "__flash";

export type FlashMessage = {
  type: "success" | "error" | "info";
  message: string;
};

export async function setFlash(type: FlashMessage["type"], message: string) {
  try {
    const c = await cookies();
    c.set(FLASH_COOKIE, JSON.stringify({ type, message }), {
      maxAge: 10,
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    });
  } catch {
    // Ignore cookie errors during build or if cookies() is not available
  }
}

export async function getFlash(): Promise<FlashMessage | null> {
  try {
    const c = await cookies();
    const flash = c.get(FLASH_COOKIE);
    if (flash?.value) {
      c.delete(FLASH_COOKIE);
      const parsed = JSON.parse(flash.value) as FlashMessage;
      return parsed;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}
