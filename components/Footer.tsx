import type { NextPage } from 'next';
import { useRouter } from 'next/router';

const Footer: NextPage = () => {
    const router = useRouter();

    return (
        <footer className='h-20 z-10 w-screen bg-transparent flex justify-center items-center px-10'>
            <nav className='flex justify-between items-start w-full h-full'>
                <span className='text-2xl md:text-3xl font-bold text-slate-50 hover:text-neutral-300 cursor-pointer'>Dhruv Jha </span>
                <span className='text-2xl md:text-3xl font-bold text-slate-50 hover:text-neutral-300 cursor-pointer'></span>
            </nav>
        </footer>
    );
};

export default Footer;