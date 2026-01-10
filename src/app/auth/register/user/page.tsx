import { SignupFormUser } from "@/components/auth/RegisterFormUser";

const Register = () => {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupFormUser />
      </div>
    </div>
  );
};

export default Register;
