import React from 'react'

export default function RickRoll() {
  return (
    <>
      <style>{`
        @keyframes jumpAround {
          0%, 100% { transform: translate(5vw, 5vh); }
          12% { transform: translate(75vw, 65vh); }
          25% { transform: translate(30vw, 30vh); }
          37% { transform: translate(80vw, 10vh); }
          50% { transform: translate(15vw, 75vh); }
          62% { transform: translate(60vw, 20vh); }
          75% { transform: translate(20vw, 45vh); }
          87% { transform: translate(70vw, 75vh); }
        }
        .animate-jump-random {
          animation: jumpAround 50s infinite ease-in-out;
        }
      `}</style>
      <div className="animate-jump-random pointer-events-none absolute left-0 top-0 h-26 w-32 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 p-1 shadow-2xl z-[1000]">
        <img
          src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzV4YnVubHNzcXJkMDN5ZGc1ajFhaTZpYW1xNWxzb3gxcHljcmV6YyZlcD12MV9naWZzX3NlYXJjaCZjdD1g/g7GKcSzwQfugw/giphy.gif"
          alt="Rick Roll"
          className="h-full w-full object-cover"
        />
      </div>
    </>
  )
}
