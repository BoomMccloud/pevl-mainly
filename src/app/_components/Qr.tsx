"use client";

import React from "react";

import { useQRCode } from "next-qrcode";

function Qr(props: { text?: string; [prop: string]: unknown }) {
  const { Canvas } = useQRCode();
  return (
    <Canvas
      text={`${window?.location?.origin}?referral=${props.text}`}
      options={{
        errorCorrectionLevel: "M",
        margin: 3,
        scale: 4,
        width: 200,
        color: {
          dark: "#000",
          light: "#FFF",
        },
      }}
    />
  );
}

export default Qr;
