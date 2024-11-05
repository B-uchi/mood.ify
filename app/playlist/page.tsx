"use client"
import MusicalNotes from "@/components/loading";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Page = () => {
  const router = useRouter();
  useEffect(() => {
    const checkStorage = () => {
      const tracks = sessionStorage.getItem("tracks");

    //   if (!tracks) {
    //     router.push("/");
    //   }
    };
    checkStorage();
  }, []);
  return <div className=""><MusicalNotes/></div>;
};

export default Page;
