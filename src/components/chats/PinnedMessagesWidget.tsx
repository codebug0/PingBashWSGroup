import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageUnit } from '@/interface/chatInterface';

type Props = {
  messages: MessageUnit[];
  bgColor: string;
  titleColor: string;
  msgColor: string;
  fontSize: number;
  onMessageClick : (id: number) => void;
};

export default function PinnedMessagesWidget({ 
    messages, 
    bgColor,
    titleColor,
    msgColor,
    fontSize,
    onMessageClick 
}: Props) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down'>('down');

  const handleNext = () => {
    const nextIndex = (index + 1) % messages.length;
    setDirection(nextIndex > index ? 'down' : 'up');
    setIndex(nextIndex);
    onMessageClick?.(messages[nextIndex].Id ?? -1);
  };

  const variants = {
    enter: (dir: 'up' | 'down') => ({
      y: dir === 'down' ? 20 : -20,
      opacity: 0,
      position: 'absolute' as const,
    }),
    center: {
      y: 0,
      opacity: 1,
      position: 'relative' as const,
    },
    exit: (dir: 'up' | 'down') => ({
      y: dir === 'down' ? -20 : 20,
      opacity: 0,
      position: 'absolute' as const,
    }),
  };

  return (
    <div
      className="pl-2 flex gap-2 items-start cursor-pointer select-none z-[1]"
      style={{background: bgColor}}
      onClick={handleNext}
    >
      {/* Vertical blue dots */}
      <div className="flex flex-col justify-center gap-[3px] pt-[5px]"
        style={{minHeight: fontSize * 3 + 10, height: fontSize * 3 + 10, maxHeight: fontSize * 3 + 10}}
      >
        {messages.map((_, i) => (
          <div
            key={i}
            className={`w-1 rounded-sm ${
              i === index ? 'bg-blue-500' : 'bg-blue-200'
            } transition-all duration-300`}
            style={i === index ? {background: titleColor, height: (fontSize * 3 + 10 - (messages.length - 1) * 3) / messages.length } : {background: titleColor + "55", height: (fontSize * 3 + 10 - (messages.length - 1) * 3) / messages.length}}
          />
        ))}
      </div>

      {/* Message container */}
      <div className="bg-white px-3 py-2 shadow-sm w-[calc(100%-60px)] overflow-hidden"
        style={{background: bgColor, minHeight: fontSize * 3 + 20}}
      >
        {/* Header row: Fixed label + Animated index */}
        <div className="flex items-center gap-1 mb-1">
          <span className="text-blue-600 font-bold"
            style={{fontSize: fontSize, color: titleColor}}
          >{messages[index]?.sender_name}</span>
          <div className="relative overflow-hidden flex">
            {/* <AnimatePresence mode="wait" custom={direction}>
              <motion.span
                key={messages[index]?.Id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="absolute font-semibold left-0 text-gray-500 flex items-center"
                style={{fontSize, color: titleColor}}
              >
                #{index + 1}
              </motion.span>
            </AnimatePresence> */}
          </div>
        </div>

        {/* Animated message content */}
        <div className="relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={messages[index]?.Id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="absolute w-[calc(100%-60px)]"
            >
              <div className="text-gray-800 truncate"
                style={{fontSize, color: msgColor}}
              >
                {messages[index]?.Content}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
