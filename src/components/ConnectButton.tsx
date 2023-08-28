import { setAllowed } from '@stellar/freighter-api'
import {Button} from "@chakra-ui/react";

export interface ConnectButtonProps {
  label: string
  isHigher?: boolean
}

export const ConnectButton = ({ label, isHigher }: ConnectButtonProps) => (
    <Button
        style={{height: isHigher ? 50 : 38}}
        onClick={setAllowed}
    >
      {label}
    </Button>
);
