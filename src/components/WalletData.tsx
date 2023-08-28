import {useAccount, useIsMounted} from "@/hooks";
import {ConnectButton} from "./ConnectButton.tsx";

export const WalletData = () => {
    const mounted = useIsMounted()
    const account = useAccount()

    return (
        <>
            {!(mounted && account) && <ConnectButton label="Connect Wallet"/>}
        </>
    )
};
