import Image from "next/image";
import { LoginTenantForm } from "../../../../components/auth/LoginFormTenant";
import Link from "next/link";

const LoginTenantPage = () => {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium px-4">
            <div className="bg-primary-foreground flex items-center justify-center rounded-md">
              <Image
                src={"/images/logos.png"}
                width={22}
                height={22}
                alt="Website Logo"
              ></Image>
              <h1 className="px-1 font-extrabold text-primary text-5xl">
                {" "}
                Staynuit.
              </h1>
            </div>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginTenantForm />
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block w-full h-screen">
        <Image
          src="/images/register-user.jpg"
          alt="Image"
          fill
          className="object-cover brightness-70"
          sizes="(max-width: 1024px) 100vw, 50vw"
          loading="eager"
        />
      </div>
    </div>
  );
};

export default LoginTenantPage;
