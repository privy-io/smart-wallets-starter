import type { PrivyEmbeddedWalletProvider } from "@privy-io/js-sdk-core";
import type { PrivyEthereumEmbeddedWalletAccount } from "@privy-io/public-api";

export type CreateOrRecoverEmbeddedWalletProps =
  // Support previous interface (Default to `privy` recovery).
  | string
  | undefined
  | { recoveryMethod: "privy" }
  | { recoveryMethod: "user-passcode"; password: string }
  | { recoveryMethod: "google-drive" }
  | { recoveryMethod: "icloud" };

export type SetRecoveryProps =
  | {
      /** @internal */
      recoveryMethod: "privy";
    }
  | { recoveryMethod: "user-passcode"; password: string }
  | { recoveryMethod: "google-drive" | "icloud" };

type IEmbeddedWalletConnectedState = {
  status: "connected";

  // TODO: deprecate
  provider: PrivyEmbeddedWalletProvider;
  account: PrivyEthereumEmbeddedWalletAccount;
};

type IEmbeddedWalletConnectingState = {
  status: "connecting";
  account: PrivyEthereumEmbeddedWalletAccount;
};

type IEmbeddedWalletReconnectingState = {
  status: "reconnecting";
  account: PrivyEthereumEmbeddedWalletAccount;
};

type IEmbeddedWalletDisconnectedState = {
  status: "disconnected";
  account: null;
};

type IEmbeddedWalletNeedsRecoveryState = {
  status: "needs-recovery";
  account: PrivyEthereumEmbeddedWalletAccount;
};

type IEmbeddedWalletNotCreatedState = {
  status: "not-created";
  account: null;
};

type IEmbeddedWalletCreatingState = {
  status: "creating";
  account: null;
};

type IEmbeddedWalletErrorState = {
  status: "error";
  account: PrivyEthereumEmbeddedWalletAccount | null;

  // TODO: deprecate
  error: string;
};

/**
 * @internal
 */
export type InternalEmbeddedWalletState =
  | IEmbeddedWalletConnectedState
  | IEmbeddedWalletConnectingState
  | IEmbeddedWalletReconnectingState
  | IEmbeddedWalletDisconnectedState
  | IEmbeddedWalletNeedsRecoveryState
  | IEmbeddedWalletCreatingState
  | IEmbeddedWalletNotCreatedState
  | IEmbeddedWalletErrorState;

export type EmbeddedWalletActions = {
  /**
   * @deprecated Use the `useRecoverEmbeddedWallet` hook instead.
   *
   * Recover the user's embedded wallet
   *
   * @param {{ recoveryMethod: 'user-passcode'; password: string }} User password: Preferred version with 'user-passcode' recovery method. Password is user-defined.
   * @param {{ recoveryMethod: 'google-drive' | 'icloud' }} Recovery provider: 'google-drive' or 'icloud' recovery method. Password is generated and stored on the cloud provider.
   * @returns {Promise<PrivyEmbeddedWalletProvider | null>} The EIP-1193 provider. If using google-drive recovery on Android, this will return null due to an Android bug with AuthSession. Use the `recoverWalletCallbacks` to handle wallet creation success in such cases.

   */
  recover: (
    args?: CreateOrRecoverEmbeddedWalletProps
  ) => Promise<PrivyEmbeddedWalletProvider | null>;

  /**
   * Create an embedded wallet for this user.
   *
   * @param {{ recoveryMethod: 'user-passcode'; password: string }} User password: Preferred version with 'user-passcode' recovery method. Password is user-defined.
   * @param {{ recoveryMethod: 'google-drive' | 'icloud' }} Recovery provider: 'google-drive' or 'icloud' recovery method. Password is generated and stored on the cloud provider.
   * @returns {Promise<PrivyEmbeddedWalletProvider | null>} The EIP-1193 provider. If using google-drive recovery on Android, this will return null due to an Android bug with AuthSession. Use the `createWalletCallbacks` to handle wallet creation success in such cases.
   */
  create: (
    args?: CreateOrRecoverEmbeddedWalletProps
  ) => Promise<PrivyEmbeddedWalletProvider | null>;

  /**
   * Return an EIP-1193 Provider for the Privy embedded wallet.
   *
   * @returns {@link PrivyEmbeddedWalletProvider} the EIP-1193 provider
   */
  getProvider: () => Promise<PrivyEmbeddedWalletProvider>;

  /**
   * @deprecated. Use `setRecovery` instead.
   * Set recovery password for a user's existing embedded wallet
   *
   * @param newPassword A user-defined password
   * @returns {Promise<PrivyEmbeddedWalletProvider>} The EIP-1193 provider.
   */
  setPassword: (password: string) => Promise<PrivyEmbeddedWalletProvider>;

  /**
   * @deprecated Use the `useSetEmbeddedWalletRecovery` hook instead.
   *
   * Sets recovery for a user's existing embedded wallet.
   *
   * @param {SetRecoveryProps} - An object containing the necessary properties for setting recovery.
   * @returns {Promise<PrivyEmbeddedWalletProvider | null>} - Returns a Promise that resolves to an EIP-1193 provider. If using Google Drive recovery on Android, this will return null due to an Android bug with AuthSession. Use the `setWalletRecoveryCallbacks` to handle wallet recovery setting success in such cases.
   */
  setRecovery: (
    args: SetRecoveryProps
  ) => Promise<PrivyEmbeddedWalletProvider | null>;
};

export type EmbeddedWalletConnectedState = EmbeddedWalletActions &
  IEmbeddedWalletConnectedState;

export type EmbeddedWalletConnectingState = EmbeddedWalletActions &
  IEmbeddedWalletConnectingState;

export type EmbeddedWalletReconnectingState = EmbeddedWalletActions &
  IEmbeddedWalletReconnectingState;

export type EmbeddedWalletDisconnectedState = EmbeddedWalletActions &
  IEmbeddedWalletDisconnectedState;

export type EmbeddedWalletNeedsRecoveryState = EmbeddedWalletActions &
  IEmbeddedWalletNeedsRecoveryState;

export type EmbeddedWalletNotCreatedState = EmbeddedWalletActions &
  IEmbeddedWalletNotCreatedState;

export type EmbeddedWalletCreatingState = EmbeddedWalletActions &
  IEmbeddedWalletCreatingState;

export type EmbeddedWalletErrorState = EmbeddedWalletActions &
  IEmbeddedWalletErrorState;

export type EmbeddedWalletState =
  | EmbeddedWalletConnectedState
  | EmbeddedWalletConnectingState
  | EmbeddedWalletReconnectingState
  | EmbeddedWalletDisconnectedState
  | EmbeddedWalletNeedsRecoveryState
  | EmbeddedWalletCreatingState
  | EmbeddedWalletNotCreatedState
  | EmbeddedWalletErrorState;

export type EmbeddedWalletStatus = EmbeddedWalletState["status"];
