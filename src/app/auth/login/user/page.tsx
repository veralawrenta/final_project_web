import { LoginFormUser } from "../../../../components/auth/LoginFormUser"

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="container mx-auto flex w-full max-w-sm flex-col">
        <LoginFormUser />
      </div>
    </div>
  )
}
