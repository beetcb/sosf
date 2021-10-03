/**
 * Set Key with Value to KVDataBase
 */
export async function set(
  key: string,
  value: string,
  access_token: string
): Promise<true | null>
/**
 * Get Key from KVDataBase
 */
export async function get(
  key: string,
  access_token: string
): Promise<string | null>
