import Head from 'next/head';
import type { NextPage } from 'next';
import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import crypto from 'crypto';
import { WsContext } from '../context/websocket';
const validator = require('validator');

const encrypt = (text: string) => {
  let iv = crypto.randomBytes(16);
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const uuid = (set: number): string => {
  var id = '';
  for (var i = 0; i < (set * 4); i++) {
    if ((i % 4 === 0) && (i !== 0) && (i !== set * 4)) id += '-';

    id += Math.floor(Math.random() * 10).toString();
  };

  return id.toLowerCase();
};

const Home: NextPage = () => {
  const [method, setMethod] = useState<{ action: 'url' | 'code' }>({ action: 'url' });
  const [form, setForm] = useState<number>(1);
  const [url, setUrl] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const router = useRouter();

  const { ws, isConnected, reconnect } = useContext(WsContext);

  useEffect(() => {
    if (!isConnected) {
      console.log('WebSocket not connected, attempting to reconnect...');
      reconnect();
    }
  }, [isConnected, reconnect]);

  const validateForm = async (status: string) => {
    switch (status) {
      case "name":
        if (name.length <= 3) {
          alert('Name must be at least 4 characters long');
          return;
        }
        setForm(state => state + 1);
        break;

      case "joinGroup":
        if ((code.length !== 9) || (code.indexOf('-') !== 4)) {
          alert('Invalid room code format');
          return;
        }

        try {
          const response = await fetch(process.env.NEXT_PUBLIC_API_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              action: 'groups_exists',
              uuid: code
            })
          });

          const res = await response.json();
          const data = JSON.parse(res.body).data.Item;

          if (!data) {
            alert("Group doesn't exist.");
            return;
          }

          if (!ws || !isConnected) {
            alert('Connection not ready. Please wait or refresh the page.');
            return;
          }

          ws.send(JSON.stringify({
            action: "join",
            "room-id": code,
            name: name
          }));

          ws.onmessage = (res) => {
            try {
              const { status, names } = JSON.parse(res.data);
              if (status === 200) {
                router.push({
                  pathname: '/watch',
                  query: {
                    q: encrypt(
                      JSON.stringify({
                        videoLink: data.link,
                        roomId: code,
                        userName: name,
                      })
                    )
                  }
                });
              } else {
                alert('Failed to join room. Please try again.');
              }
            } catch (error) {
              console.error('Error parsing WebSocket message:', error);
              alert('Error joining room. Please try again.');
            }
          };
        } catch (error) {
          console.error('Error joining group:', error);
          alert('Failed to join group. Please try again.');
        }
        break;

      case "createGroup":
        if (!validator.isURL(url)) {
          alert("Please enter a valid URL");
          return;
        }

        if (!ws || !isConnected) {
          alert('Connection not ready. Please wait or refresh the page.');
          return;
        }

        if (isCreating) {
          alert('Room creation in progress. Please wait.');
          return;
        }

        setIsCreating(true);
        const roomId = uuid(2);
        console.log("Creating room with ID:", roomId);

        try {
          const message = JSON.stringify({
            action: "create-group",
            "room-id": roomId,
            link: url,
            name: name
          });

          ws.send(message);

          ws.onmessage = (res) => {
            try {
              const parsedData = JSON.parse(res.data);
              console.log("Received response:", parsedData);

              if (parsedData.status === 200) {
                router.push({
                  pathname: '/watch',
                  query: {
                    q: encrypt(
                      JSON.stringify({
                        videoLink: url,
                        roomId: roomId,
                        userName: name,
                      })
                    )
                  }
                });
              } else {
                alert(parsedData.message || 'Failed to create room. Please try again.');
              }
            } catch (error) {
              console.error("Error parsing response:", error);
              alert("Error processing server response");
            } finally {
              setIsCreating(false);
            }
          };
        } catch (error) {
          console.error("WebSocket error:", error);
          alert("Failed to create room. Please try again.");
          setIsCreating(false);
        }
        break;

      default:
        break;
    }
  };

  return (
    <main className='h-screen w-screen flex justify-between items-center flex-col bg-transparent'>
      <Head>
        <title>Stream Concurrently</title>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <Header />
      <section className='h-5/6 w-screen z-10 flex justify-center items-center'>
        {
          form === 1 ?
            <section className='h-32 w-5/6 sm:h-20 md:max-w-2xl flex justify-center items-center flex-col'>
              <section className='h-full w-full flex justify-center items-center flex-col sm:flex-row border-2 rounded-lg border-slate-50 p-2'>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className='h-1/2 w-full text-center sm:text-left sm:h-full sm:w-9/12 text-slate-50 text-2xl bg-transparent outline-none border-0 sm:mr-1 placeholder:text-slate-50 font-bold tracking-wider p-3' placeholder="Enter your name." />
                <button type="submit" onClick={() => validateForm('name')} className='h-1/2 w-full sm:h-full sm:w-3/12 sm:ml-1 rounded-lg bg-slate-50 text-slate-900 text-xl sm:text-2xl font-bold tracking-wider'>NEXT</button>
              </section>
            </section> :
            form === 2 ?
              <section className='h-40 w-5/6 sm:h-20 md:max-w-2xl flex justify-center items-center flex-col'>
                <section className='h-full w-full flex justify-center items-center flex-col sm:flex-row border-2 rounded-lg border-slate-50 p-2'>
                  <input type="text" value={method.action === "url" ? url : code} onChange={e => method.action === "url" ? setUrl(e.target.value) : setCode(e.target.value.toLowerCase())} className='h-1/2 w-full text-center sm:text-left sm:h-full sm:w-9/12 text-slate-50 text-2xl bg-transparent outline-none border-0 sm:mr-1 placeholder:text-slate-50 font-bold tracking-wider p-3' placeholder={method.action === "url" ? "Enter video link." : "Enter room code."} />
                  <button type="submit" onClick={() => method.action === "url" ? validateForm('createGroup') : validateForm('joinGroup')} className='h-1/2 w-full sm:h-full sm:w-3/12 sm:ml-1 rounded-lg bg-slate-50 text-slate-900 text-xl sm:text-2xl font-bold tracking-wider flex justify-center items-center'>{method.action === "url" ? "CREATE ROOM" : "ENTER ROOM"}</button>
                </section>
                <section className='mt-2 w-full flex justify-center items-center'>
                  <button className='text-slate-50 tracking-wider font-bold text-lg md:text-xl' onClick={() => setMethod({ action: method.action === 'code' ? 'url' : 'code' })}> {method.action === "url" ? "already have a code? enter code" : "don't have a code? create group"} </button>
                </section>
              </section> : null
        }
      </section>
      <Footer />
    </main>
  );
};

export default Home;