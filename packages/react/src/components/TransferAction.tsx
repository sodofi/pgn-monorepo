import { parseEther, parseUnits } from "viem";
import { Chain, useAccount, useNetwork } from "wagmi";
import { useFormContext } from "react-hook-form";

import { Button, PrimaryButton } from "./ui/Button";
import { useTokenBalance } from "../hooks/useTokenBalance";
import { ErrorMessage } from "./ErrorMessage";
import { ConnectWallet } from "./ConnectButton";
import { useSelectedToken } from "../hooks/useSelectedToken";

export function TransferAction({
  action,
  chain,
  isLoading,
}: {
  action: string;
  chain: Chain;
  isLoading?: boolean;
}) {
  const { watch } = useFormContext();
  const { address } = useAccount();
  const network = useNetwork();

  const token = watch("token");
  const { decimals = 18 } = useSelectedToken()(token) || {};

  const { data: balance } = useTokenBalance({ chain, token });
  if (!address || network.chain?.unsupported) {
    return (
      <div>
        {network.chain?.unsupported ? (
          <ErrorMessage
            className="text-center mb-2"
            error={{ message: `Please switch to a supported network.` }}
          />
        ) : null}
        <ConnectWallet chain={chain} />
      </div>
    );
  }

  const amount = watch("amount");
  if (!amount || Number.isNaN(amount)) {
    return (
      <Button className="w-full" disabled>
        Enter an amount
      </Button>
    );
  }
  const balanceOverAmount =
    amount &&
    balance?.value >= parseUnits(String(parseFloat(amount)), decimals);

  if (balanceOverAmount) {
    return (
      <PrimaryButton
        className="w-full"
        color="primary"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : action}
      </PrimaryButton>
    );
  }
  return (
    <Button className="w-full" disabled>
      Insufficient balance
    </Button>
  );
}
