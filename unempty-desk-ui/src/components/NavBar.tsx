import { LampDesk } from "lucide-react";
import User from "./User";
import Link from "next/link";

interface Props {
  title?: string;
}

const NavBar = ({ title }: Props) => {
  return (
    <div className="mx-auto min-w-full max-w-7x">
      <div className="flex shrink-0 text-3xl items-center justify-between w-full bg-slate-700 py-4 px-8 rounded-b-md shadow-md gap-2">
        <div className="flex items-center gap-2">
          <Link href="/">
            <h2 className="font-semibold">EyeOnDesk</h2>
          </Link>
          <LampDesk size={36} className="text-indigo-400 -scale-x-100" />
        </div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <User />
      </div>
    </div>
  );
};
export default NavBar;
