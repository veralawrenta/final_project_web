import React, { Suspense } from 'react'
import VerifyAndSetPasswordForm from '../../../components/auth/VerifySetPassword'

const VerifyandSetPassword = () => {
  return (
    <Suspense fallback={<p className="text-center p-6">Loading…</p>}>
      <VerifyAndSetPasswordForm />
    </Suspense>
  )
}

export default VerifyandSetPassword;