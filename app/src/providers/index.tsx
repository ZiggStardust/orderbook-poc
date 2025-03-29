"use client";

import Websockets from "./websockets";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <Websockets>{children}</Websockets>;
}
