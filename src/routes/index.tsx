import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="flex flex-col ">
        <div className="flex flex-row justify-between px-2 sm:px-5 bg-[#0f1014] items-center py-2">
            <span className="font-bold sm:text-xl">Fantasy
                <span className="text-green-300 sm:text-xl"> Premier League</span>
            </span>
            <div className="space-x-2 sm:space-x-5">
                <Link to='/login'>
                    <button className="border px-2 py-1 text-white border-gray-500 rounded-md hover:bg-gray-800 hover:cursor-pointer">Login</button>
                </Link>  

                <Link to='/signup'>
                    <button className="bg-green-300 px-2 py-1 rounded-md hover:bg-green-400 hover:cursor-pointer">Sign Up</button>
                </Link>
            </div>
        </div>
        <div className= "w-full h-screen bg-[url('/fepl-landing-page.jpg')] clip-path:polygon(0% 0%, 100% 0%, 100% 100%, 00% 100%) bg-cover bg-center">
            <div className="flex flex-col text-center space-y-4 pt-25">
                <h1 className="text-4xl sm:text-8xl font-bold text-gray-100">Build Your Dream Team</h1>
                <p className="text-xl font-medium text-gray-300">Compete with friends in the most exciting and competitive league in the world! </p>
            </div>
        </div>
    </div>
  )
}
