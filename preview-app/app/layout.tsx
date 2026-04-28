export const metadata = { title: "Authoring Tool v3" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html><body style={{margin:0,padding:0,overflow:'hidden'}}>{children}</body></html>;
}
