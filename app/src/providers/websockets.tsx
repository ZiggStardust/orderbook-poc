// create a websockets component which will render and connect to the websockets server
import { useWebsocketConnection } from "@/api/websockets/websocket-hooks";

export default function Websockets({ children }: { children: React.ReactNode }) {
  useWebsocketConnection();
  return <>{children}</>;
}
