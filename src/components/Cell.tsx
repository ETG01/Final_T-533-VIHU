import React from "react";
import styles from "../styles/Cell.module.css";
import { EMOJI, Sign } from "../utils/constants";

type Props = {
  onClick: () => void;
  number: number;
  value: Sign | string;
  readOnly?: boolean;
  "data-testid"?: string;
};

export default function Cell({
  onClick,
  number,
  value,
  readOnly,
  "data-testid": testId,
}: Props) {
  return (
    <div data-testid={testId} className={readOnly ? styles.miniCell : styles.cell} onClick={onClick}>
      {value === Sign.X && EMOJI[Sign.X]}
      {value === Sign.O && EMOJI[Sign.O]}
    </div>
  );
}
