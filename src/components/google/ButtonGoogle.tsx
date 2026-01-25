"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { FC } from "react";

const ButtonGoogle: FC = () => {
  return (
    <>
      <Button
        variant={"outline"}
        className="font-semibold text-black flex items-center justify-center gap-2 shadow-md cursor-pointer bg-gray-100"
        onClick={() => signIn("google", { callbackUrl: "/" })}
        type="button"
      >
        <Image
          src="/google.svg"
          alt="Google Icon"
          width={30}
          height={30}
          />
        Continue with Google
      </Button>
    </>
  );
};

export default ButtonGoogle;
