"use client";

import { Play, MoreVertical } from "lucide-react";

const playlists = [
  { title: "Workout at the gym", tracks: "29 tracks", duration: "2h 15m", date: "23 June, 2023" },
  { title: "Tracks without lyrics", tracks: "35 tracks", duration: "2h 15m", date: "27 April, 2023" },
  { title: "Funny stuff", tracks: "108 tracks", duration: "6h 48m", date: "12 February, 2023" },
  { title: "Careful driving vibes", tracks: "84 tracks", duration: "5h 09m", date: "18 May, 2023" },
  { title: "Philosophy during walking", tracks: "52 tracks", duration: "3h 59m", date: "21 December, 2022" },
];

export default function PlaylistTabs() {
  return (
    <div className="mt-8">
      <div className="flex gap-6 mb-6 border-b border-gray-800 overflow-x-auto pb-2 md:pb-0">
        <button className="text-orange-500 border-b-2 border-orange-500 pb-2 -mb-[2px] whitespace-nowrap">Playlists</button>
        <button className="text-gray-400 pb-2 whitespace-nowrap">Artists</button>
        <button className="text-gray-400 pb-2 whitespace-nowrap">Albums</button>
        <button className="text-gray-400 pb-2 whitespace-nowrap">Streams</button>
        <button className="text-gray-400 pb-2 whitespace-nowrap">Friends&apos; playlists</button>
      </div>

      <div className="space-y-2">
        {playlists.map((playlist) => (
          <div key={playlist.title} className="flex items-center justify-between p-4 hover:bg-gray-800/50 rounded-lg group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-700/50 rounded flex-shrink-0"></div>
              <div className="min-w-0">
                <h3 className="font-medium truncate">{playlist.title}</h3>
                <p className="text-sm text-gray-400">{playlist.tracks} • {playlist.duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 hidden sm:inline">{playlist.date}</span>
              <Play size={20} className="text-gray-400 opacity-0 group-hover:opacity-100" />
              <MoreVertical size={20} className="text-gray-400 opacity-0 group-hover:opacity-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}