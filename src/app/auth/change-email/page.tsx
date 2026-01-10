import React from "react";
import { ChangeEmailForm } from "./components/ChangeEmailForm";
import Link from "next/link";
import Image from "next/image";

const ChangeEmail = () => {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Image
            src="/images/staynuit-name.png"
            width={150}
            height={50}
            alt="Website Logo"
          ></Image>
        </Link>
        <ChangeEmailForm />
      </div>
    </div>
  );
};

export default ChangeEmail;
