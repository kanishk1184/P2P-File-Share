
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Room | P2P File Drop",
  description: "Peer-to-peer file transfer over WebRTC",
};

export default function RoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}