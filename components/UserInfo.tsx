"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, getCurrentUser } from "@/lib/actions/auth.action";
import { FaSignOutAlt } from "react-icons/fa";
import Image from "next/image";

const UserInfo = () => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    router.push("/sign-in");
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      <Image
        src={user.photoURL || "/default-avatar.png"}
        alt="User Avatar"
        width={40}
        height={40}
        className="rounded-full object-cover"
      />
      <div className="flex gap-4">
        <span className="font-medium text-lg text-gray-900 dark:text-white">
          {user.name}
        </span>
        <button
          onClick={handleLogout}
          className="text-lg text-red-500 hover:text-red-800 cursor-pointer transition-all"
        >
          <FaSignOutAlt />
        </button>
      </div>
    </div>
  );
};

export default UserInfo;
