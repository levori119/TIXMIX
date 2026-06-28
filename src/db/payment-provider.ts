import "server-only";
import { randomBytes } from "node:crypto";

/**
 * Payment provider abstraction.
 *
 * ⚠️ The implementation below is a DEV SANDBOX ONLY. It does NOT move real money
 * and is NOT a real payment integration. Before production, replace it with a
 * real PCI-DSS compliant gateway / Israeli card clearer using tokenized cards
 * (and evaluate Bit/PayBox availability — see CLAUDE.md §8). Keep this same
 * interface so the escrow logic doesn't change.
 */
export interface PaymentProvider {
  /** Place an authorization hold for `amountAgorot`; returns a hold reference. */
  authorizeHold(amountAgorot: number, ref: string): Promise<{ holdId: string }>;
  /** Capture a previously authorized hold (funds actually taken). */
  capture(holdId: string): Promise<void>;
  /** Release/refund a hold back to the payer. */
  refund(holdId: string): Promise<void>;
}

class SandboxPaymentProvider implements PaymentProvider {
  async authorizeHold(_amountAgorot: number, _ref: string) {
    return { holdId: `sbx_${randomBytes(8).toString("hex")}` };
  }
  async capture(_holdId: string) {
    /* no-op in sandbox */
  }
  async refund(_holdId: string) {
    /* no-op in sandbox */
  }
}

export const paymentProvider: PaymentProvider = new SandboxPaymentProvider();
