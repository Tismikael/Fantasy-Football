import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { FcGoogle } from "react-icons/fc";
import { AiFillApple } from "react-icons/ai";
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';


export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

export default function Separator() {
  return (
    <div className="mx-auto max-w-xl flex items-center my-6">
      <div className="flex-grow border-t border-green-300"></div>
      <span className="mx-4 text-gray-400">OR</span>
      <div className="flex-grow border-t border-green-300"></div>
    </div>
  );
}


function RouteComponent() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData({
      ...formData, [name]: value
    });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })

    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate({ to: '/profile' });
  }

  return <div className="px-6 py-24 sm:py-20 lg:px-8 bg-[#0f1014]">
            <div className="text-center">
              <h1 className="text-white text-4xl font-bold">Sign In</h1>
            </div>
            <form onSubmit={handleSubmit} className="mx-auto mt-16 max-w-xl sm:mt-20">
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label htmlFor="email" className="block text-sm/6 font-semibold text-white">Email</label>
                        <div className="mt-2.5">
                          <input
                              id="email"
                              type="text"
                              name="email"
                              autoComplete="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="youremail@emailprovider.com"
                              className="block w-full rounded-md bg-white/5 px-3.5 py-2 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-green-500"
                            />
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="password" className="block text-sm/6 font-semibold text-white">Password</label>
                        <div className="mt-2.5 relative">
                          <input
                              id="password"
                              type={visible ? 'text' : 'password'}
                              name="password" autoComplete="current-password"
                              value={formData.password}
                              onChange={handleChange}
                              className="block w-full rounded-md bg-white/5 px-3.5 py-2 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-green-500"
                            />
                            <button
                              type="button"
                              onClick={() => setVisible((v) => !v)}
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                              tabIndex={-1}
                            >
                                {visible ? <IoMdEye className="h-5 w-5" /> : <IoMdEyeOff className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>
                {error && (
                  <p className="mt-4 text-sm text-red-400">{error}</p>
                )}
                <div className="mt-10">
                    <button type="submit" disabled={submitting} className="block w-full rounded-md bg-green-500 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-xs hover:bg-green-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 disabled:opacity-50">{submitting ? 'Signing in...' : 'Sign In'}</button>
                </div>
            </form>
            <Separator />

            <div className="mx-auto mt-10 max-w-xl sm:mt-20 flex flex-col gap-10">
                <button className="border rounded-lg border-gray-400 flex justify-center items-center gap-1 px-3.5 py-2.5 text-center text-white hover:bg-gray-800 " > <FcGoogle /> Sign in with Google </button>
                <button className="border rounded-lg border-gray-400 flex justify-center items-center gap-1 px-3.5 py-2.5 text-white hover:bg-gray-800" > <AiFillApple /> Sign in with Apple</button>
            </div>
        </div>
}
