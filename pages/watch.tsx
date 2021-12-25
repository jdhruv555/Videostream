import Head from 'next/head';
import type { NextPage } from 'next';
import { useEffect, useState, useContext, useRef } from 'react';
import { useRouter } from 'next/router';
import ReactPlayer from 'react-player';
import crypto from 'crypto';
import { WsContext } from '../context/websocket';
import * as Icons from 'react-bootstrap-icons';
import Spinner from '../components/Spinner';

const decrypt = (text: string) => {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string), iv);
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
}

interface videoState {
    isMute: boolean;
    loaded: number;
    jump: number;
    played: number;
};

interface dataInterface {
    videoLink: string;
    roomId: string;
    userName: string;
    names: string[];
};

const Watch: NextPage = () => {
    const [video, setVideo] = useState<videoState>({
        isMute: false,
        loaded: 0,
        jump: 0,
        played: 0
    });
    const [isPlaying, setPlaying] = useState<boolean>(false);
    const ref = useRef(null);
    const router = useRouter();
    const [data, setData] = useState<dataInterface>({ roomId: null, userName: null, videoLink: null, names: null });
    const { ws } = useContext(WsContext);

    const sendMessage = (message: string) => {
        if (typeof window !== "undefined") {
            try {
                ws.send(message)
            } catch {
                window.location.replace(window.location.origin);
            }
        };
    };

    if (typeof window !== "undefined") {
        try {
            ws.onopen = () => console.log('connected')
        } catch {
            window.location.replace(window.location.origin);
        }
    }

    useEffect(() => {
        const queryData = JSON.parse(decrypt(router.query.q.toString()));

        if (router.query.q === undefined) router.replace('/');
        else setData(queryData);

        ws.onmessage = message => {
            if (message.data) {
                const res = JSON.parse(message.data);

                switch (res.action) {
                    case "isPlaying":
                        setPlaying(res.isPlaying);
                        break;

                    case "jump":
                        ref.current.seekTo(res['time-frame']);
                        setPlaying(true);
                        break;

                    case "usersConnected":
                        setData({ ...queryData, names: res.names });
                        break;

                    default:
                        break;
                }
            }
        };
    }, []);

    return (
        <main className='h-screen w-screen flex justify-between items-center flex-col bg-transparent'>
            <Head>
                <title>Stream Concurrently</title>
                <link rel="icon" href="/favicon.png" />
            </Head>

            {
                data.roomId !== null ?
                    <section className='h-full w-full flex justify-start items-center flex-col xl:flex-row'>
                        <section className='h-fit w-full flex justify-start items-center flex-col xl:h-full xl:w-2/3'>
                            <header className='flex h-20 w-full justify-between items-center px-10 xl:px-12'>
                                <span className='text-2xl font-bold text-slate-50 cursor-pointer' onClick={() => router.push('/')}>Stream Concurrently</span>
                                <span className='text-2xl font-bold text-slate-50'>{data.userName}</span>
                            </header>
                            <section className='flex aspect-video max-w-3xl w-full p-3 justify-center items-center xl:mb-5 xl:max-w-none xl:p-12 pointer-events-none'>
                                <section className='h-full w-full rounded-md xl:rounded-xl overflow-hidden'>
                                    <ReactPlayer
                                        url={data.videoLink}
                                        muted={video.isMute}
                                        playing={isPlaying}
                                        onProgress={e => setVideo({ ...video, played: e.played, loaded: e.loaded })}
                                        onEnded={() => setVideo({ ...video, played: 1, loaded: 1 })}
                                        ref={ref}
                                        controls={false}
                                        width={"100%"}
                                        height={"100%"}
                                    />
                                </section>
                            </section>
                            <section className='flex h-16 w-full max-w-3xl p-3 xl:px-12 justify-center items-center xl:max-w-none xl:h-24'>
                                <section className='h-full w-full border-2 border-slate-50 backdrop-blur-[2px] flex justify-between items-center rounded-md xl:rounded-xl overflow-hidden'>
                                    <div className='h-full w-fit'>
                                        <div className='h-full w-11 xl:w-20 flex justify-center items-center'>
                                            {
                                                isPlaying ?
                                                    <Icons.PlayFill className='text-slate-50 text-3xl xl:text-4xl font-bold cursor-pointer' onClick={() => sendMessage(JSON.stringify({ "action": "isPlaying", "isPlaying": false, "room-id": data.roomId }))} /> :
                                                    <Icons.StopFill className='text-slate-50 text-3xl xl:text-4xl font-bold cursor-pointer' onClick={() => sendMessage(JSON.stringify({ "action": "isPlaying", "isPlaying": true, "room-id": data.roomId }))} />
                                            }
                                        </div>
                                    </div>
                                    <div className='h-full w-full'>
                                        <div className="h-full w-full flex justify-center items-center">
                                            <div className='h-[14px] md:h-5 w-full bg-zinc-50 bg-opacity-5 rounded-sm flex justify-start items-center relative'>
                                                <div className='h-full absolute top-0 left-0 bg-zinc-50 bg-opacity-75 z-20' style={{ width: `${video.played * 100}%` }}></div>
                                                <div className='h-full absolute top-0 left-0 bg-zinc-50 bg-opacity-10 z-10' style={{ width: `${video.loaded * 100}%` }}></div>
                                                <input type='range' min={0} max={1} step='any' onChange={e => sendMessage(JSON.stringify({ "action": "jump", "room-id": data.roomId, "time-frame": e.target.value }))} className='w-full top-0 left-0 appearance-none absolute h-full bg-transparent z-30' />
                                            </div>
                                        </div>
                                    </div>
                                    <div className='h-full w-fit'>
                                        <div className="w-20 flex justify-center items-center">

                                        </div>
                                    </div>
                                    <div className='h-full w-fit'>
                                        <div className='h-full w-11 xl:w-20 flex justify-center items-center'>
                                            {
                                                video.isMute ?
                                                    <Icons.VolumeMuteFill className='text-slate-50 text-3xl xl:text-4xl font-bold cursor-pointer' onClick={() => setVideo({ ...video, isMute: false })} /> :
                                                    <Icons.VolumeDownFill className='text-slate-50 text-3xl xl:text-4xl font-bold cursor-pointer' onClick={() => setVideo({ ...video, isMute: true })} />
                                            }
                                        </div>
                                    </div>
                                </section>
                            </section>
                        </section>

                        <section className='h-full w-full flex max-w-3xl md:p-3 xl:p-0 justify-start items-center flex-col md:flex-row-reverse xl:h-full xl:w-1/3 xl:flex-col'>
                            <section className='hidden w-full md:w-1/3 md:h-full md:flex md:ml-3 xl:ml-0 justify-center items-center xl:h-2/6 xl:w-full xl:mt-8 xl:pr-12 xl:pb-6'>
                                <div className='h-full w-full border-2 border-slate-50 backdrop-blur-[2px] rounded-md xl:rounded-xl md:flex-col-reverse  xl:flex-row flex justify-center items-center overflow-hidden'>
                                    <div className='h-full w-full xl:max-h-full xl:w-full flex p-5 pt-4 flex-col'>
                                        <h1 className='text-2xl text-slate-50 font-bold underline underline-offset-4'>ROOM CODE : {data.roomId}</h1>
                                        <div className='h-full w-full xl:max-h-full xl:w-full pt-3 flex flex-col overflow-scroll overflow-x-hidden relative'>
                                            {data.names ? data.names.map((name, index) => <h1 key={index} className='text-2xl text-slate-50 font-bold'>{(index + 1) + " . " + name}</h1>) : null}
                                        </div>
                                    </div>
                                    <div className='h-10 w-full xl:h-full xl:w-12 flex justify-center items-center'>
                                        <h1 className='text-2xl text-slate-50 underline underline-offset-4 font-bold xl:rotate-90'>Watching</h1>
                                    </div>
                                </div>
                            </section>
                            <section className='h-full w-full md:w-2/3 flex justify-center md:mr-3 xl:mr-0 items-center p-3 md:p-0 xl:h-4/6 xl:w-full xl:mb-16 xl:pr-12 xl:pt-6'>
                                <div className='h-full w-full border-2 backdrop-blur-[2px] border-slate-50 rounded-md xl:rounded-xl flex justify-center items-center flex-col'>
                                    <div className='h-full w-full rounded-md xl:rounded-xl'></div>
                                    <div className='h-12 md:h-16 xl:h-16 w-11/12 m-5 border-2 border-slate-50 rounded-md xl:rounded-lg'></div>
                                </div>
                            </section>
                        </section>
                    </section> : <Spinner />
            }
        </main>
    );
};

export default Watch;