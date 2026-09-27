"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import Link from "next/link";

import { FcGoogle } from "react-icons/fc";
import { MdOutlineMailOutline } from 'react-icons/md';
import { RiLockPasswordLine } from 'react-icons/ri';
import { LiaFishSolid } from "react-icons/lia";
import { FaUserSecret } from "react-icons/fa6";

function IconButton({ children, text, iconColor }) {
  return (
    <button
      className='text-lg border flex justify-center items-center gap-x-2 w-1/2 rounded-lg 
    shadow-2xl drop-shadow py-3 my-3'
    >
      {children}
      <div className='font-semibold text-base text-gray-500'>
        {text}
      </div>
    </button>
  )
}

function IconInput({children,placeholder,type,value,onChange,autoComplete,  }) {
  return (
    <div className="flex justify-left items-center w-full relative h-12 border mt-3 rounded">
      <div className="icon-wrapper w-14 absolute flex justify-center items-center">
        <span className="text-xl opacity-80 text-gray-500">
          {children}
        </span>
      </div>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required
        className="w-full h-full pl-14 pr-4 outline-none rounded"
      />
    </div>
  );
}

export default function LoginPage() {

  async function handleLogin(event) {
  event.preventDefault();

  setError("");
  setLoading(true);

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setError("Invalid email or password.");
    setLoading(false);
    return;
  }

  router.replace("/dashboard");
}

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return <>
    <div className='flex 
    justify-center items-center
    w-full h-screen bg-slate-50'>

      {/*CONTAINER*/}
      <div className='form-container overflow-hidden rounded-2xl flex flex-col lg:flex-row shadow-2xl justify-between w-10/12 max-w-screen-xl'>

        {/*Left Side*/}
        <div className='form-section w-full lg:w-1/2 px-8 sm:px-12 lg:px-16 py-10 sm:py-14'>

          {/* MAIN FORM CONTAIN IS HERE */}

          <div className='logo flex justify-left gap-x-1 items-center'>
            <LiaFishSolid className="text-red-600 text-4xl" />
            <span className="text-2xl font-semibold">PhisSafe</span>
          </div>

          <h1 className='text-3xl font-semibold mt-6 opacity-80 text-black pb-6'>
            Log in to your Account
          </h1>
          


          {/*LOGIN BUTTONS*/}
          {/*}
          <div className='oath-button flex justify-between gap-x-5 mt-8'>
            <IconButton text='Google' iconColor='#fff'>
              <FcGoogle />
            </IconButton>
            <IconButton text='' iconColor='#fff'>

            </IconButton>
          </div>

          <span className='block text-center opacity-70 mt-4 mb-10 text-gray-800'>or continue with email</span> */}

          <form onSubmit={handleLogin}>

            <IconInput placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email">
              <MdOutlineMailOutline />
            </IconInput>

            <IconInput placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}  autoComplete="current-password">
              <RiLockPasswordLine />
            </IconInput>
          

          <div className='flex justify-between items-center mt-5'>
            <div className='item text-blue-600'>
              <Link href="/forgot-password">
                Forgot Password?
              </Link>
            </div>
          </div>



          <p className="text-center mt-4 text-sm text-gray-500">
            Don't have an account?{" "}
            <Link href="/register" className="text-red-600 font-semibold hover:underline">
              Create an account
            </Link>
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mt-3">
              {error}
            </div>
          )}

          <div className="mt-5">
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold w-full py-3.5 rounded-lg text-lg transition shadow-md"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          {/* DIVIDER */}
          <div className="flex items-center my-5">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="px-3 text-xs text-gray-400 font-semibold tracking-wider uppercase">Or</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* GUEST BUTTON */}
          <button
            type="button"
            onClick={() => router.push("/guest")}
            className="w-full py-3 border border-gray-300 hover:border-red-600 hover:text-red-600 text-gray-700 font-semibold rounded-lg flex items-center justify-center gap-2 transition bg-white shadow-sm"
          >
            <FaUserSecret className="text-gray-500 text-lg" />
            Continue as Guest
          </button>

        </form>
        
        </div>

        {/*Rigth Side*/}
        <div className='illustration-section hidden lg:block lg:w-1/2 bg-red-700'>
          {/*Illustration part wrap*/}
          <div className='illu-wrap'>
            <img src="/assets/illu-main.png" alt='' />
          </div>
          <div className='bottom-sec-wrap text-center'>
            <h2 className='text-white text-2xl font-bold mb-1'>Protecting everyone from Phishing</h2>
            <p className='text-white mb-8'>All you need for being safe online</p>
          </div>
          {/*Dots*/}
          <div className='dots flex justify-center items-center gap-x-3 mb-8'>
            <div className='dot w-2 h-2 bg-white rounded-2xl block'></div>
            <div className='dot w-2 h-2 bg-white rounded-2xl block'></div>
            <div className='dot w-2 h-2 bg-white rounded-2xl block'></div>
          </div>
        </div>
      </div>
    </div>
  </>;

}



