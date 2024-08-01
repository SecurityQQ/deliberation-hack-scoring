import { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import { Toaster } from "@/components/ui/toaster"
// import Footer from './Footer';

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div>
      <Navbar />
      <main>{children}</main>

      <Toaster />
    </div>
  );
};

export default Layout;
