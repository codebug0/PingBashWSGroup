"use client"

import React, { useState } from "react"
import Picker from "@emoji-mart/react"
import data from "@emoji-mart/data"
import { GiphyFetch } from "@giphy/js-fetch-api"
import { Grid } from "@giphy/react-components"
import Lottie from "lottie-react"
import "../../app/globals.css"
import {stickers} from "./LottiesStickers";

const gf = new GiphyFetch("vQ77WZQBRInPIWvlRBuWQlUE09On0luD")

const TABS = ["Emoji", "Sticker", "GIF"] as const
type TabType = typeof TABS[number]

interface Props {
  onSelect: (value: { type: "emoji" | "gif" | "sticker"; content: string | object }) => void
}

const EmojiPicker: React.FC<Props> = ({ onSelect }) => {
  const [tab, setTab] = useState<TabType>("Emoji")

  async function fetchJsonData(url: string): Promise<any> {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error("Error fetching JSON:", error);
      throw error;
    }
  }
  const renderTab = () => {
    switch (tab) {
      case "Emoji":
        return (
          <Picker
            data={data}
            theme="light"
            onEmojiSelect={(emoji: any) =>
              onSelect({ type: "emoji", content: emoji.native })
            }
          />
        )

      case "Sticker":
        return (
          <div className="grid grid-cols-3 gap-2 p-2">
            {stickers.map((sticker, i) => (
              <div
                key={i}
                className="cursor-pointer border rounded-xl p-2 hover:bg-gray-100"
                onClick={() => onSelect({ type: "sticker", content: sticker.name })}
              >
                <Lottie animationData={sticker.content} style={{ width: 80, height: 80 }} />
                {/* <img src={sticker.link} alt="Sticker" width={80} height={80} /> */}
              </div>
            ))}
          </div>
        )

      case "GIF":
        const fetchGifs = (offset: number) => gf.trending({ offset, limit: 9 })
        return (
          <div style={{ width: 348 }}>
            <Grid
              fetchGifs={fetchGifs}
              width={348}
              columns={3}
              onGifClick={(gif, e) => {
                e.preventDefault()
                onSelect({ type: "gif", content: gif.images.original.url })
              }}
            />
          </div>
        )
    }
  }

  return (
    <div className="bg-white border rounded-xl shadow-md p-2">
      <div className="flex border-b border-gray-300">
        {TABS.map((t) => (
          <button
            key={t}
            className={`relative px-4 py-2 text-sm font-medium text-gray-600 hover:text-black
              ${t === tab ? "text-black after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-blue-500" : ""}
            `}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="max-h-[360px] h-[360px] overflow-y-auto picker-emoji">{renderTab()}</div>
    </div>
  )
}

export default EmojiPicker