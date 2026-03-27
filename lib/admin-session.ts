/** お知らせAPI等で使う管理PIN。sessionStorage に保持（タブを閉じるまで）。 */
export const ADMIN_API_PIN_SESSION_KEY = "cashew-shop-admin-api-pin";

export const ADMIN_PIN_HEADER_NAME = "x-admin-pin";

export function adminApiPinHeaders(pin: string): Record<string, string> {
  return { [ADMIN_PIN_HEADER_NAME]: pin.trim() };
}
