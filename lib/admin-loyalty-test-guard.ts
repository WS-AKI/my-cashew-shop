/**
 * VIP 検証用の管理 API（/api/admin/loyalty/test, test-users）の有効化。
 *
 * 本番では **未設定のまま**（無効）にしてください。開発・ステージングのみ
 * `ENABLE_ADMIN_LOYALTY_TEST_TOOLS=true` を付与します。
 *
 * フロントの `/admin/vip` 表示制御は `NEXT_PUBLIC_ENABLE_ADMIN_LOYALTY_TEST_TOOLS`
 * を同じポリシーで揃えてください。
 */
export function isAdminLoyaltyTestApiEnabled(): boolean {
  return process.env.ENABLE_ADMIN_LOYALTY_TEST_TOOLS === "true";
}
