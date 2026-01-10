import { ForgotPasswordForm } from "./components/ForgotPasswordForm";

const ForgotPassword = () => {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm border-2 rounded-2xl bg-gray-50">
        <ForgotPasswordForm />
      </div>
    </div>
  );
};

export default ForgotPassword;