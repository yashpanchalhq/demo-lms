"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

import "react-quill-new/dist/quill.bubble.css";

interface PreviewProps {
  onChange: (value: string) => void;
  value: string;
}

export const Preview = ({ onChange, value }: PreviewProps) => {
  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill-new"), { ssr: false }),
    []
  );
  return (
    <>
      <ReactQuill theme="bubble" value={value} readOnly />
    </>
  );
};
