import PocketNetProxyApi from 'pocketnet-proxy-api'

let pocketNetProxyInstance: PocketNetProxyApi = null

/**
 * Returns the initialized instance of PocketNetProxyApi.
 *
 * This function returns a promise that resolves to an instance of PocketNetProxyApi.
 * If the instance is already initialized, it returns the cached instance.
 *
 * @returns {Promise<PocketNetProxyApi>} A promise that resolves to the initialized instance.
 */
export async function getPocketNetProxyInstance() {
  if (!pocketNetProxyInstance) {
    pocketNetProxyInstance = await PocketNetProxyApi.create()
  }
  return pocketNetProxyInstance
}
