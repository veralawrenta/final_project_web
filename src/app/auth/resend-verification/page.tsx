import { ResendVerificationForm } from "../../../components/auth/ResendVerificationForm";

const ResendVerification = () => {
  return (
    <div className="container mx-auto min-h-screen flex flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <ResendVerificationForm />
      </div>
    </div>
  );
};

export default ResendVerification;
