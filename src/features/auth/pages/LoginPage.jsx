import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react'
import Logo from '../../../assets/Logo.svg'
import useAuthMutations from '../hooks/useAuthMutations'
import { loginSchema } from '../schema/loginSchema'
import { applyServerErrors } from '../../../shared/utils/applyServerErrors'

export default function LoginPage() {
  // const exp = 1792758806;
  // "exp": 1790170086,
  //  "exp": 1792758806,
// const expirationDate = new Date(exp * 1000);

// console.log(expirationDate);
  const [showPassword, setShowPassword] = useState(false)

  const { login, isLoggingIn, serverErrors, clearServerErrors } =
    useAuthMutations()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '', rememberMe: false },
  })

  // Same wiring as ServiceFormModal/GovernorateFormModal/CityFormModal:
  // map backend field errors onto the form once useAuthMutations sets them.
  useEffect(() => {
    if (serverErrors && Object.keys(serverErrors).length) {
      applyServerErrors(serverErrors, setError)
    }
  }, [serverErrors, setError])

  const onSubmit = (values) => {
    clearServerErrors()
    // NOTE: adjust these field names to match the AuthAdmin/login contract
    // once confirmed (e.g. userName/email instead of identifier).
    login({
      identifier: values.identifier.trim(),
      password: values.password,
    }, values.rememberMe)
  }

  const identifierError = errors.identifier?.message
  const passwordError = errors.password?.message

  return (
    <main className="font relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#F1EEE6] px-5 py-10  text-[#12233F] antialiased sm:px-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.9), rgba(241,238,230,0) 55%)',
        }}
      />

      <div className="relative flex w-full max-w-[760px] flex-col items-center">
        <img
          src={Logo}
          alt="Medicard"
          className="mb-8 h-8 w-auto max-w-[150px] object-contain"
        />

        <div className="flex w-full flex-col overflow-hidden border border-[#DED8C8] bg-white shadow-[0_30px_60px_-35px_rgba(15,32,56,0.35)] md:flex-row">
          {/* Access rail */}
          <div className="flex items-center gap-3 bg-[#0F2038] px-6 py-4 text-[#EDEFF3] md:w-24 md:flex-col md:justify-between md:gap-0 md:py-8">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#2E8A79]/50 bg-[#14493F]/40 text-[#6FC7B5]">
              <ShieldCheck size={17} aria-hidden="true" />
            </div>

            <span
              className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-[#8FA0B8] md:block"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              Secure access
            </span>

            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8FA0B8] md:hidden">
              Secure access
            </span>

            <span className="ml-auto font-mono text-[10px] tracking-wide text-[#5C6B82] md:ml-0">
              REC-0482
            </span>
          </div>

          {/* Form area */}
          <div className="flex-1 px-6 py-8 sm:px-10 sm:py-10">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className=" text-[1.9rem] font-normal leading-tight text-[#12233F]">
                  Welcome back
                </h2>
                <p className="mt-2 text-[14px] leading-6 text-[#6B7280]">
                  Sign in to continue to your administration workspace.
                </p>
              </div>
              <span className="mt-1 shrink-0 whitespace-nowrap border border-[#CADED7] bg-[#E9F3EF] px-2.5 py-1 text-[11px] font-medium text-[#1F6F62]">
                Admin access
              </span>
            </div>

            <form noValidate onSubmit={handleSubmit(onSubmit)}>
              <div className="border-t border-[#E4DFD5]">
                <div className="group flex items-center gap-4 border-b border-[#E4DFD5] px-1 py-3.5 transition focus-within:bg-[#F7F9F8]">
                  <label
                    htmlFor="login-identifier"
                    className="w-20 shrink-0 text-[13px] font-medium text-[#42506B] sm:w-24"
                  >
                    Email
                  </label>
                  <input
                    id="login-identifier"
                    type="email"
                    autoComplete="email"
                    {...register('identifier')}
                    aria-invalid={Boolean(identifierError)}
                    aria-describedby={
                      identifierError ? 'login-identifier-error' : undefined
                    }
                    disabled={isLoggingIn}
                    className="w-full border-0 bg-transparent text-[15px] text-[#12233F] outline-none placeholder:text-[#AEB4C0] disabled:opacity-60"
                    placeholder="example@gmail.com"
                  />
                </div>
                {identifierError && (
                  <p
                    id="login-identifier-error"
                    className="pt-2 text-xs font-medium text-[#B4432B]"
                  >
                    {identifierError}
                  </p>
                )}

                <div className="group flex items-center gap-4 border-b border-[#E4DFD5] px-1 py-3.5 transition focus-within:bg-[#F7F9F8]">
                  <label
                    htmlFor="login-password"
                    className="w-20 shrink-0 text-[13px] font-medium text-[#42506B] sm:w-24"
                  >
                    Password
                  </label>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    {...register('password')}
                    aria-invalid={Boolean(passwordError)}
                    aria-describedby={
                      passwordError ? 'login-password-error' : undefined
                    }
                    disabled={isLoggingIn}
                    className="w-full border-0 bg-transparent text-[15px] text-[#12233F] outline-none placeholder:text-[#AEB4C0] disabled:opacity-60"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center text-[#9AA3B5] transition hover:text-[#1F6F62] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F6F62]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff size={16} aria-hidden="true" />
                    ) : (
                      <Eye size={16} aria-hidden="true" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p
                    id="login-password-error"
                    className="pt-2 text-xs font-medium text-[#B4432B]"
                  >
                    {passwordError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 pt-5">
                <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-[#5A6478]">
                  <input
                    type="checkbox"
                    {...register('rememberMe')}
                    className="h-4 w-4 border-[#D8D3C7] accent-[#1F6F62] focus:ring-[#1F6F62]"
                  />
                  Remember me
                </label>
                {/* <button
                  type="button"
                  className="text-[13px] font-medium text-[#1F6F62] transition hover:text-[#14493F] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F6F62]"
                >
                  Forgot password?
                </button> */}
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 bg-[#12233F] px-5 text-sm font-medium text-white transition hover:bg-[#1F6F62] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1F6F62]/25 disabled:cursor-not-allowed disabled:bg-[#9AA3B5]"
              >
                {isLoggingIn ? 'Signing in…' : 'Sign in'}
                {!isLoggingIn && <ArrowRight size={17} aria-hidden="true" />}
              </button>
            </form>
          </div>
        </div>

        <footer className="mt-7 flex w-full max-w-[760px] flex-col items-center gap-1.5 text-xs text-[#9AA3B5] sm:flex-row sm:justify-between">
          <span>&copy; {new Date().getFullYear()} Medicard. All rights reserved.</span>
          <span>
            Powered by <span className="font-medium text-[#1F6F62]">Khusm</span>
          </span>
        </footer>
      </div>
    </main>
  )
}








// import { useState } from 'react'
// import {
//   ArrowRight,
//   Eye,
//   EyeOff,
//   LockKeyhole,
//   Mail,
//   ShieldCheck,
// } from 'lucide-react'
// import Logo from '../../../assets/Logo.svg'

// const initialValues = {
//   identifier: '',
//   password: '',
//   rememberMe: false,
// }

// export default function LoginPage() {
//   const [values, setValues] = useState(initialValues)
//   const [errors, setErrors] = useState({})
//   const [showPassword, setShowPassword] = useState(false)
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   const updateValue = (field, value) => {
//     setValues((current) => ({ ...current, [field]: value }))
//     setErrors((current) => ({ ...current, [field]: '' }))
//   }

//   const handleSubmit = async (event) => {
//     event.preventDefault()

//     const nextErrors = {}
//     if (!values.identifier.trim()) {
//       nextErrors.identifier = 'Enter your email address or username.'
//     }
//     if (!values.password) {
//       nextErrors.password = 'Enter your password.'
//     }

//     if (Object.keys(nextErrors).length) {
//       setErrors(nextErrors)
//       return
//     }

//     setIsSubmitting(true)

//     // TODO: Replace this UI-only transition with the real authentication mutation.
//     await new Promise((resolve) => window.setTimeout(resolve, 500))
//     setIsSubmitting(false)
//   }

//   return (
//     <main className="min-h-screen w-full bg-[#f4f6f9]">
//       <div className="grid min-h-screen w-full lg:grid-cols-2">
//         <section className="relative hidden overflow-hidden bg-[#0a2d6e] px-12 py-12 text-white lg:flex lg:flex-col xl:px-16 xl:py-16">
//           <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:52px_52px]" />
//           <div className="absolute inset-y-0 right-0 w-px bg-white/15" />
//           <div className="absolute left-0 top-0 h-1 w-36 bg-[#2baba2]" />

//           <div className="relative flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
//             <span className="h-px w-8 bg-[#2baba2]" />
//             Medicard operations
//           </div>

//           <div className="relative my-auto max-w-xl py-20">
//             <div className="mb-7 flex h-12 w-12 items-center justify-center border border-white/20 bg-white/10 text-[#8bd9d3]">
//               <ShieldCheck size={23} aria-hidden="true" />
//             </div>
//             <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
//               Administration platform
//             </p>
//             <h1 className="mt-5 text-4xl font-semibold leading-[1.12] tracking-tight xl:text-5xl">
//               Built for the people behind better care.
//             </h1>
//             <p className="mt-6 max-w-md text-base leading-7 text-blue-100/85">
//               A secure workspace for managing Medicard members, providers, and
//               everyday operations with confidence.
//             </p>
//           </div>

//           <div className="relative max-w-xl border-l border-[#2baba2] pl-5">
//             <p className="text-sm font-medium text-white">Protected access</p>
//             <p className="mt-1 text-sm leading-6 text-blue-100/75">
//               Role-based administration designed for trusted healthcare teams.
//             </p>
//           </div>
//         </section>

//         <section className="flex min-h-screen flex-col bg-[#f4f6f9] px-5 py-7 sm:px-10 sm:py-10 lg:px-12 lg:py-12 xl:px-16 xl:py-16">
//           <header className="mx-auto flex w-full max-w-[430px] items-center justify-between gap-4">
//             <img
//               src={Logo}
//               alt="Medicard"
//               className="h-9 w-auto max-w-[175px] object-contain object-left sm:h-10"
//             />
//             <span className="border border-[#0056d2]/15 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0056d2] shadow-sm">
//               Admin Panel
//             </span>
//           </header>

//           <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col justify-center py-10 sm:py-14">
//             <div className="border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-32px_rgba(10,45,110,0.38)] sm:p-8">
//               <div className="mb-8">
//                 <div className="mb-5 h-1 w-11 bg-[#0056d2]" />
//                 <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
//                   Welcome back
//                 </h2>
//                 <p className="mt-3 text-sm leading-6 text-slate-500">
//                   Sign in to continue to your Medicard administration workspace.
//                 </p>
//               </div>

//               <form noValidate onSubmit={handleSubmit} className="space-y-5">
//                 <div>
//                   <label
//                     htmlFor="login-identifier"
//                     className="mb-2 block text-sm font-medium text-slate-700"
//                   >
//                     Email or username
//                   </label>
//                   <div className="relative">
//                     <Mail
//                       size={18}
//                       aria-hidden="true"
//                       className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//                     />
//                     <input
//                       id="login-identifier"
//                       type="text"
//                       autoComplete="username"
//                       value={values.identifier}
//                       onChange={(event) =>
//                         updateValue('identifier', event.target.value)
//                       }
//                       aria-invalid={Boolean(errors.identifier)}
//                       aria-describedby={
//                         errors.identifier ? 'login-identifier-error' : undefined
//                       }
//                       className={`h-12 w-full border bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0056d2] focus:ring-4 focus:ring-blue-50 ${
//                         errors.identifier
//                           ? 'border-red-400 focus:border-red-500 focus:ring-red-50'
//                           : 'border-slate-300'
//                       }`}
//                       placeholder="name@company.com"
//                     />
//                   </div>
//                   {errors.identifier && (
//                     <p
//                       id="login-identifier-error"
//                       className="mt-1.5 text-xs font-medium text-red-600"
//                     >
//                       {errors.identifier}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="login-password"
//                     className="mb-2 block text-sm font-medium text-slate-700"
//                   >
//                     Password
//                   </label>
//                   <div className="relative">
//                     <LockKeyhole
//                       size={18}
//                       aria-hidden="true"
//                       className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//                     />
//                     <input
//                       id="login-password"
//                       type={showPassword ? 'text' : 'password'}
//                       autoComplete="current-password"
//                       value={values.password}
//                       onChange={(event) =>
//                         updateValue('password', event.target.value)
//                       }
//                       aria-invalid={Boolean(errors.password)}
//                       aria-describedby={
//                         errors.password ? 'login-password-error' : undefined
//                       }
//                       className={`h-12 w-full border bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0056d2] focus:ring-4 focus:ring-blue-50 ${
//                         errors.password
//                           ? 'border-red-400 focus:border-red-500 focus:ring-red-50'
//                           : 'border-slate-300'
//                       }`}
//                       placeholder="Enter your password"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword((visible) => !visible)}
//                       className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-slate-400 transition hover:text-[#0056d2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0056d2]"
//                       aria-label={showPassword ? 'Hide password' : 'Show password'}
//                     >
//                       {showPassword ? (
//                         <EyeOff size={18} aria-hidden="true" />
//                       ) : (
//                         <Eye size={18} aria-hidden="true" />
//                       )}
//                     </button>
//                   </div>
//                   {errors.password && (
//                     <p
//                       id="login-password-error"
//                       className="mt-1.5 text-xs font-medium text-red-600"
//                     >
//                       {errors.password}
//                     </p>
//                   )}
//                 </div>

//                 <div className="flex items-center justify-between gap-4 pt-0.5">
//                   <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
//                     <input
//                       type="checkbox"
//                       checked={values.rememberMe}
//                       onChange={(event) =>
//                         updateValue('rememberMe', event.target.checked)
//                       }
//                       className="h-4 w-4 rounded border-slate-300 accent-[#0056d2] focus:ring-[#0056d2]"
//                     />
//                     Remember me
//                   </label>
//                   <button
//                     type="button"
//                     className="text-sm font-semibold text-[#0056d2] transition hover:text-[#0a2d6e] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0056d2]"
//                   >
//                     Forgot password?
//                   </button>
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={isSubmitting}
//                   className="flex h-12 w-full items-center justify-center gap-2 bg-[#0056d2] px-5 text-sm font-semibold text-white transition hover:bg-[#0a2d6e] focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:bg-blue-300"
//                 >
//                   {isSubmitting ? 'Signing in...' : 'Sign in'}
//                   {!isSubmitting && <ArrowRight size={18} aria-hidden="true" />}
//                 </button>
//               </form>
//             </div>

//             <p className="mt-5 flex items-center gap-2 text-xs leading-5 text-slate-500">
//               <LockKeyhole size={14} aria-hidden="true" className="text-[#0056d2]" />
//               Your access is protected with secure administration controls.
//             </p>
//           </div>

//           <footer className="mx-auto flex w-full max-w-[430px] flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
//             <span>&copy; {new Date().getFullYear()} Medicard. All rights reserved.</span>
//             <span>
//               Powered by{' '}
//               <span className="font-semibold text-[#2baba2]">Khusm</span>
//             </span>
//           </footer>
//         </section>
//       </div>
//     </main>
//   )
// }
