import type { NextPage } from 'next';
import { useRouter } from 'next/router';

const Header: NextPage = () => {
    const router = useRouter();

    return (
        <header className='h-20 z-10 w-screen bg-transparent flex justify-center items-center px-10'>
            <nav className='flex justify-center md:justify-start items-center w-full'>
                <span className='md:text-3xl font-bold text-slate-600 text-2xl hover:text-gray-500 cursor-pointer' onClick={() => router.replace('/')}>STREAM CONCURRENTLY</span>
            </nav>
        </header>
    );
};

export default Header;