/**
 * Transport interface for protocol-specific network communication
 * Each transport handles the actual sending of data over a specific protocol
 */
export interface Transport<Payload = unknown> {
  /**
   * Send data using the transport's protocol
   * @param payload Protocol-specific payload to send
   */
  send: (payload: Payload) => Promise<void>
}
