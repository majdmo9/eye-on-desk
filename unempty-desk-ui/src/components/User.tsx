import React, { useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { auth } from "@unempty-desk-ui/lib/firebase";
import Image from "next/image";
import { Home, LogOut, Settings, User as UserIcon } from "lucide-react";
import { Button } from "./Button";
import { usePathname } from "next/navigation";
import { stopVideoStream } from "@unempty-desk-ui/api/stopVideoStream";
import PopUp from "./PopUp";

const User = () => {
  const [logoutOpen, setLogoutOpen] = useState(false);
  const user = auth?.currentUser;
  const pathName = usePathname();

  if (!user) {
    return (
      <Button
        className="text-lg font-extrabold px-4 py-2 uppercase"
        onClick={async () => {
          await stopVideoStream();
          window.location.href = "/login";
        }}
      >
        Login
      </Button>
    );
  }

  return (
    <Menu as="div" className="relative ml-3">
      <PopUp
        title="Logout"
        description="Are you sure you want to logout?"
        submitBtnTitle="Logout"
        submitBtn={() => {
          auth.signOut();
          window.location.href = "/";
        }}
        open={logoutOpen}
        setOpen={setLogoutOpen}
      />
      <div>
        <MenuButton className="relative flex rounded-full text-sm ring-indigo-400 ring-2 transition-transform duration-300 ease-in-out hover:scale-105 shadow-md">
          <span className="absolute -inset-1.5" />
          <span className="sr-only">Open user menu</span>
          {user?.photoURL ? (
            <Image loader={({ src }) => src} alt="" src={user?.photoURL} className="size-12 rounded-full" width={48} height={48} />
          ) : (
            <UserIcon size={54} className="text-slate-300 bg-slate-800 rounded-full p-1" />
          )}
        </MenuButton>
      </div>
      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 w-52 origin-top-right rounded-md bg-slate-800 text-slate-300 py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        {pathName !== "/config" ? (
          <MenuItem>
            <a
              href="/config"
              className="hover:bg-slate-700 flex gap-2 items-center px-4 py-2 text-sm data-focus:bg-gray-100 data-focus:outline-hidden border-b-2 border-slate-300"
            >
              Configure Desk Space
              <Settings size={16} />
            </a>
          </MenuItem>
        ) : (
          <MenuItem>
            <a
              href="/camera"
              className="hover:bg-slate-700 flex gap-2 items-center px-4 py-2 text-sm data-focus:bg-gray-100 data-focus:outline-hidden border-b-2 border-slate-300"
            >
              Home
              <Home size={16} />
            </a>
          </MenuItem>
        )}
        <MenuItem>
          <a
            onClick={() => {
              setLogoutOpen(true);
            }}
            className="hover:bg-slate-700 hover:text-red-500 flex items-center gap-2 px-4 py-2 text-sm data-focus:bg-gray-100 data-focus:outline-hidden cursor-pointer"
          >
            Logout
            <LogOut size={16} />
          </a>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
};

export default User;
