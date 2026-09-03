import { createFileRoute } from '@tanstack/react-router'
import { FcGoogle } from "react-icons/fc";
import { AiFillApple } from "react-icons/ai";

export const Route = createFileRoute('/signup')({
  component: RouteComponent,
})

export default function Separator() {
  return (
    <div className="flex items-center my-6 sm:col-span-2">
      <div className="flex-grow border-t border-green-300"></div>
      <span className="flex-shrink mx-4 text-gray-400">OR</span>
      <div className="flex-grow border-t border-green-300"></div>
    </div>
  );
}


function RouteComponent() {
  return <div className="px-6 py-24 sm:py-32 lg:px-8">
            <form action="#" method="POST" className="mx-auto mt-16 max-w-xl sm:mt-20">
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label htmlFor="first-name" className="block text-sm/6 font-semibold text-white">Email</label>
                        <div className="mt-2.5">
                        <input id="email" type="text" name="email" autoComplete="email" placeholder="youremail@emailprovider.com" className="block w-full rounded-md bg-white/5 px-3.5 py-2 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500" />
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="last-name" className="block text-sm/6 font-semibold text-white">Password</label>
                        <div className="mt-2.5">
                        <input id="password" type="password" name="password" autoComplete="password" className="block w-full rounded-md bg-white/5 px-3.5 py-2 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500" />
                        </div>
                    </div>
                </div>
                <div className="mt-10">
                    <button type="submit" className="block w-full rounded-md bg-green-500 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-xs hover:bg-green-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500">Sign Up</button>
                </div>
            </form>
            <Separator />

            <div className="mx-auto mt-10 max-w-xl sm:mt-20 flex flex-col gap-10">
                <button className="border rounded-lg border-gray-400 flex justify-center items-center gap-1 sm:col-span-2 px-3.5 py-2.5 text-center hover:bg-gray-300" > <FcGoogle /> Sign up with Google </button>
                <button className="border rounded-lg border-gray-400 flex justify-center items-center gap-1 px-3.5 py-2.5 hover:bg-gray-300" > <AiFillApple /> Sign up with Apple</button>
            </div>
        </div>
}
