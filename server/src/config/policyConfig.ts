export interface IRecoveryPolicyConfig {
  automaticRecoveryEnabled: boolean;
  autoRecoveryLimit: number;
  maxRetries: number;
  allowedMethods: string[];
  blockedFailureTypes: string[];
  minimumRecoveryProbability: number;
}

export const RECOVERY_POLICY: IRecoveryPolicyConfig = {
  automaticRecoveryEnabled: true,
  autoRecoveryLimit: 10000,
  maxRetries: 2,
  allowedMethods: ['UPI', 'CARD'],
  blockedFailureTypes: [
    'fraud blocked',
    'authentication failure',
    'invalid card',
    'expired card',
    'account inactive / stolen card flag'
  ],
  minimumRecoveryProbability: 0.60
};
