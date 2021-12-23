import type { NextPage } from 'next';
import styles from '../styles/components/Footer.module.css';
import { useRouter } from 'next/router';

const Footer: NextPage = () => {
    const router = useRouter();

    return (
        <footer className='h-20 z-10 w-screen bg-transparent flex justify-center items-center px-10'>
            <nav className='flex justify-between items-start w-full h-full'>
                <span className='text-2xl md:text-3xl font-bold text-slate-600 border-b border-slate-600 hover:text-gray-500 hover:border-gray-500 cursor-pointer'>TANISHQ SINGH</span>
                <span className='text-2xl md:text-3xl font-bold text-slate-600 border-b border-slate-600 hover:text-gray-500 hover:border-gray-500 cursor-pointer'>CONTACT US</span>
            </nav>
        </footer>
    );
};

export default Footer;