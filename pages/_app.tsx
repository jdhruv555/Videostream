import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { WsState } from '../context/websocket';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WsState>
      <Component {...pageProps} />
    </WsState>
  );
};

export default MyApp;