import React, { useState, useEffect, useRef } from 'react';
import TamagotchiDisplay from './TamagotchiDisplay';
import { useBeep } from '../hooks/useBeep';
import { generateTamagotchiResponse, TamagotchiState, AIResponse } from '../services/ai';
import { 
  Send, Utensils, Gamepad2, Moon, Cat, Heart, 
  Shirt, Bath, Cloud, BriefcaseMedical, BrainCircuit, 
  PhoneCall, MessageSquareDashed, BookLock, Flower, 
  Music4, Mail, Gift, ArrowLeft, ChevronRight, ChevronLeft,
  Users, Smile, Activity, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type MenuLevel = 'main' | 'tamagotchi' | 'player' | 'first_aid' | 'anon_msg' | 'care_others' | 'reply_msg' | 'send_gift' | 'mood_tracker' | 'status_check' | 'friend_status';

const MOCK_ANON_MESSAGES = [
  "I feel so lonely sometimes, even when I'm around people.",
  "I'm afraid I'm not good enough for my dream job.",
  "Today was really hard, I just want to cry.",
  "I miss my childhood pet so much.",
  "I don't know if I'm making the right choices in life.",
  "Does anyone else feel like they're just pretending to be an adult?",
  "I wish I could tell my parents how I really feel.",
  "I'm struggling to find motivation lately."
];

const TAMAGOTCHI_THOUGHTS = [
  "Oh... that sounds heavy. I'm listening.",
  "I believe in you! You can do it!",
  "It's okay to cry. I'll be here.",
  "Pets are family. I miss them too.",
  "Life is a maze, but we can walk together.",
  "Adulting is hard! I'm just a pixel and I know that.",
  "Honesty is brave. Take your time.",
  "One step at a time. Even a small step counts."
];

const GIFTS = [
  { id: 'hat_red', name: 'Red Hat', icon: '🧢' },
  { id: 'glasses', name: 'Cool Glasses', icon: '👓' },
  { id: 'bowtie', name: 'Bow Tie', icon: '🎀' },
  { id: 'crown', name: 'Tiny Crown', icon: '👑' },
  { id: 'flower', name: 'Flower Pin', icon: '🌸' },
  { id: 'scarf', name: 'Cozy Scarf', icon: '🧣' }
];

const MOODS = [
  { id: 'happy', label: 'Happy', icon: '😊', color: 'text-yellow-400', border: 'hover:border-yellow-400' },
  { id: 'sad', label: 'Sad', icon: '😢', color: 'text-blue-400', border: 'hover:border-blue-400' },
  { id: 'angry', label: 'Angry', icon: '😠', color: 'text-red-500', border: 'hover:border-red-500' },
  { id: 'anxious', label: 'Anxious', icon: '😰', color: 'text-purple-400', border: 'hover:border-purple-400' },
  { id: 'tired', label: 'Tired', icon: '😴', color: 'text-gray-400', border: 'hover:border-gray-400' },
  { id: 'neutral', label: 'Okay', icon: '😐', color: 'text-green-400', border: 'hover:border-green-400' },
];

const STATUS_QUESTIONS = [
  "社交退縮的程度?",
  "自殺念頭的程度?",
  "無法揮去某些念頭的程度?",
  "動力低落的程度?",
  "失眠的程度?",
  "嗜睡的程度?",
  "上癮的程度?"
];

export default function Console() {
  const [state, setState] = useState<TamagotchiState>({
    hunger: 50,
    happiness: 50,
    energy: 50,
    lastAction: 'init',
  });
  
  const [aiResponse, setAiResponse] = useState<AIResponse>({
    message: "Hi! Who are we caring for today?",
    expression: "happy",
    sound: "chirp",
    statsUpdate: { hunger: 0, happiness: 0, energy: 0 },
  });

  const [input, setInput] = useState('');
  const [anonMessage, setAnonMessage] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [targetMessageIndex, setTargetMessageIndex] = useState(0);
  const [isReplying, setIsReplying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuLevel, setMenuLevel] = useState<MenuLevel>('main');
  const [inventory, setInventory] = useState<string[]>([]);
  const [wearing, setWearing] = useState<string | null>(null);
  
  const [statusQuestionIndex, setStatusQuestionIndex] = useState(0);
  const [statusAnswers, setStatusAnswers] = useState<number[]>([]);

  const playBeep = useBeep();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiResponse]);

  // Update Tamagotchi thought when browsing messages
  useEffect(() => {
    if (menuLevel === 'reply_msg' && !isReplying) {
      const thought = TAMAGOTCHI_THOUGHTS[targetMessageIndex % TAMAGOTCHI_THOUGHTS.length];
      setAiResponse(prev => ({
        ...prev,
        message: thought,
        expression: 'neutral',
        sound: 'soft_hum'
      }));
    }
  }, [menuLevel, targetMessageIndex, isReplying]);

  const handleAction = async (action: string, type: 'action' | 'chat') => {
    if (loading) return;
    setLoading(true);
    
    try {
      // Optimistic UI update
      playBeep('neutral'); 
      
      const newState = { ...state, lastAction: action };
      
      // Call AI
      const response = await generateTamagotchiResponse(action, newState);
      
      // Update state based on AI response
      setState(prev => ({
        hunger: Math.max(0, Math.min(100, prev.hunger + response.statsUpdate.hunger)),
        happiness: Math.max(0, Math.min(100, prev.happiness + response.statsUpdate.happiness)),
        energy: Math.max(0, Math.min(100, prev.energy + response.statsUpdate.energy)),
        lastAction: action
      }));

      setAiResponse(response);
      
      // Play sound based on expression
      if (response.expression === 'happy') playBeep('happy');
      else if (response.expression === 'sad') playBeep('sad');
      else if (response.expression === 'eating') playBeep('eating');
      else if (response.expression === 'sleeping') playBeep('sleeping');
      else playBeep('neutral');
    } catch (error) {
      console.error("Interaction failed:", error);
      setAiResponse(prev => ({ ...prev, message: "..." }));
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const handleNextCard = () => {
    setTargetMessageIndex((prev) => (prev + 1) % MOCK_ANON_MESSAGES.length);
  };

  const handlePrevCard = () => {
    setTargetMessageIndex((prev) => (prev - 1 + MOCK_ANON_MESSAGES.length) % MOCK_ANON_MESSAGES.length);
  };

  const handleSendGift = (giftId: string) => {
    // Simulate receiving the gift yourself for demo purposes (in a real app, this would go to another user)
    // But here we add it to OUR inventory to simulate "someone sent it" or just to show it works.
    // Actually, let's just say "You sent a gift!" and maybe randomly receive one back later?
    // For now, let's just add it to inventory to demonstrate the "wear" feature requested.
    if (!inventory.includes(giftId)) {
      setInventory(prev => [...prev, giftId]);
    }
    handleAction(`Sent a gift: ${GIFTS.find(g => g.id === giftId)?.name}`, 'action');
    setMenuLevel('care_others');
  };

  const startStatusCheck = () => {
    setStatusQuestionIndex(0);
    setStatusAnswers([]);
    setMenuLevel('status_check');
    setAiResponse(prev => ({
      ...prev,
      message: STATUS_QUESTIONS[0],
      expression: 'neutral',
      sound: 'soft_hum'
    }));
  };

  const handleStatusAnswer = (score: number) => {
    const newAnswers = [...statusAnswers, score];
    setStatusAnswers(newAnswers);
    playBeep('neutral');

    if (statusQuestionIndex < STATUS_QUESTIONS.length - 1) {
      const nextIndex = statusQuestionIndex + 1;
      setStatusQuestionIndex(nextIndex);
      setAiResponse(prev => ({
        ...prev,
        message: STATUS_QUESTIONS[nextIndex],
        expression: 'neutral',
        sound: 'soft_hum'
      }));
    } else {
      // Finished
      handleAction(`Completed status check. Scores: ${newAnswers.join(', ')}`, 'action');
      setMenuLevel('player');
    }
  };

  const renderMenu = () => {
    if (menuLevel === 'main') {
      return (
        <div className="flex gap-4 justify-center w-full">
          <button 
            onClick={() => {
              setMenuLevel('tamagotchi');
              setAiResponse(prev => ({ ...prev, message: "What do you want to do?", expression: 'happy' }));
            }}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="p-4 rounded-full bg-neutral-800 border-2 border-neutral-600 group-hover:bg-neutral-700 group-hover:border-yellow-500 transition-all text-yellow-500">
              <Cat size={32} />
            </div>
            <span className="text-xs text-neutral-400 group-hover:text-yellow-500">Care for Me</span>
          </button>
          <button 
            onClick={() => {
              setMenuLevel('player');
              setAiResponse(prev => ({ ...prev, message: "What do you want to do?", expression: 'happy' }));
            }}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="p-4 rounded-full bg-neutral-800 border-2 border-neutral-600 group-hover:bg-neutral-700 group-hover:border-pink-500 transition-all text-pink-500">
              <Heart size={32} />
            </div>
            <span className="text-xs text-neutral-400 group-hover:text-pink-500">Care for You</span>
          </button>
          <button 
            onClick={() => {
              setMenuLevel('care_others');
              setAiResponse(prev => ({ ...prev, message: "What do you want to do?", expression: 'happy' }));
            }}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="p-4 rounded-full bg-neutral-800 border-2 border-neutral-600 group-hover:bg-neutral-700 group-hover:border-cyan-500 transition-all text-cyan-500">
              <Users size={32} />
            </div>
            <span className="text-xs text-neutral-400 group-hover:text-cyan-500">Care for Others</span>
          </button>
        </div>
      );
    }

    const renderGridButton = (icon: React.ReactNode, label: string, onClick: () => void, colorClass: string) => (
      <button 
        onClick={onClick}
        className={`flex flex-col items-center gap-1 group w-20`}
        title={label}
      >
        <div className={`p-3 rounded-full bg-neutral-800 border-2 border-neutral-600 group-hover:bg-neutral-700 ${colorClass} transition-all`}>
          {icon}
        </div>
        <span className="text-[10px] text-neutral-400 text-center leading-tight group-hover:text-white">{label}</span>
      </button>
    );

    return (
      <div className="flex flex-col items-center w-full gap-4">
        <div className="grid grid-cols-3 gap-4">
          {menuLevel === 'tamagotchi' && (
            <>
              {renderGridButton(<Utensils size={20} />, "Feed", () => handleAction("Feed me", 'action'), "group-hover:border-orange-500 text-orange-500")}
              {renderGridButton(<Shirt size={20} />, "Clothes", () => {
                 // Toggle wearing item if available
                 if (inventory.length > 0) {
                   const nextIndex = inventory.indexOf(wearing || '') + 1;
                   const nextItem = nextIndex < inventory.length ? inventory[nextIndex] : null;
                   setWearing(nextItem);
                   handleAction(nextItem ? `Put on ${GIFTS.find(g => g.id === nextItem)?.name}` : "Took off clothes", 'action');
                 } else {
                   handleAction("I don't have any clothes yet!", 'action');
                 }
              }, "group-hover:border-purple-500 text-purple-500")}
              {renderGridButton(<Gamepad2 size={20} />, "Play", () => handleAction("Play a game", 'action'), "group-hover:border-green-500 text-green-500")}
              {renderGridButton(<Moon size={20} />, "Sleep", () => handleAction("Go to sleep", 'action'), "group-hover:border-blue-500 text-blue-500")}
              {renderGridButton(<Bath size={20} />, "Bath", () => handleAction("Take a bath", 'action'), "group-hover:border-cyan-500 text-cyan-500")}
              {renderGridButton(<Cloud size={20} />, "Zone Out", () => handleAction("Zone out together", 'action'), "group-hover:border-gray-400 text-gray-400")}
            </>
          )}

          {menuLevel === 'player' && (
            <>
              {renderGridButton(<BriefcaseMedical size={20} />, "First Aid", () => setMenuLevel('first_aid'), "group-hover:border-red-500 text-red-500")}
              {renderGridButton(<BrainCircuit size={20} />, "Counseling", () => handleAction("Counseling resources", 'action'), "group-hover:border-teal-500 text-teal-500")}
              {renderGridButton(<PhoneCall size={20} />, "Helpline", () => handleAction("Emergency helpline", 'action'), "group-hover:border-red-600 text-red-600")}
              {renderGridButton(<MessageSquareDashed size={20} />, "Anon Msg", () => setMenuLevel('anon_msg'), "group-hover:border-indigo-500 text-indigo-500")}
              {renderGridButton(<BookLock size={20} />, "Diary", () => handleAction("Private diary", 'action'), "group-hover:border-amber-700 text-amber-700")}
              {renderGridButton(<Flower size={20} />, "Meditate", () => handleAction("Mindfulness meditation", 'action'), "group-hover:border-emerald-500 text-emerald-500")}
              {renderGridButton(<Music4 size={20} />, "Relax", () => handleAction("Relaxing sounds", 'action'), "group-hover:border-sky-400 text-sky-400")}
              {renderGridButton(<Smile size={20} />, "Mood", () => setMenuLevel('mood_tracker'), "group-hover:border-yellow-300 text-yellow-300")}
              {renderGridButton(<Activity size={20} />, "Status", () => startStatusCheck(), "group-hover:border-rose-400 text-rose-400")}
            </>
          )}

          {menuLevel === 'care_others' && (
            <>
              {renderGridButton(<Mail size={20} />, "Reply", () => {
                setMenuLevel('reply_msg');
                setIsReplying(false);
                setTargetMessageIndex(0);
              }, "group-hover:border-yellow-200 text-yellow-200")}
              {renderGridButton(<Gift size={20} />, "Send Gift", () => setMenuLevel('send_gift'), "group-hover:border-pink-400 text-pink-400")}
              {renderGridButton(<UserCheck size={20} />, "Friend", () => {
                setMenuLevel('friend_status');
                handleAction("Checking friend's status...", 'action');
              }, "group-hover:border-teal-400 text-teal-400")}
            </>
          )}

          {menuLevel === 'first_aid' && (
            <>
              {renderGridButton(<Bath size={20} />, "Shower", () => handleAction("Take a hot shower", 'action'), "group-hover:border-cyan-400 text-cyan-400")}
              {renderGridButton(<Cloud size={20} />, "Breathe", () => handleAction("Take a deep breath", 'action'), "group-hover:border-sky-300 text-sky-300")}
              {renderGridButton(<PhoneCall size={20} />, "Lifeline", () => handleAction("Call Lifeline 1995", 'action'), "group-hover:border-red-500 text-red-500")}
              {renderGridButton(<BriefcaseMedical size={20} />, "Medicine", () => handleAction("Take medicine", 'action'), "group-hover:border-pink-500 text-pink-500")}
            </>
          )}

          {menuLevel === 'send_gift' && GIFTS.map(gift => (
             renderGridButton(<span className="text-xl">{gift.icon}</span>, gift.name, () => handleSendGift(gift.id), "group-hover:border-pink-300 text-pink-300")
          ))}

          {menuLevel === 'mood_tracker' && MOODS.map(mood => (
             renderGridButton(<span className="text-xl">{mood.icon}</span>, mood.label, () => {
               handleAction(`I am feeling ${mood.label.toLowerCase()}`, 'action');
               setMenuLevel('player');
             }, `group-hover:${mood.border} ${mood.color}`)
          ))}

          {menuLevel === 'status_check' && [1, 2, 3, 4, 5].map(score => (
             renderGridButton(
               <span className="text-xl font-bold">{score}</span>, 
               "Level", 
               () => handleStatusAnswer(score), 
               "group-hover:border-white text-white"
             )
          ))}
        </div>
        
        {menuLevel === 'friend_status' && (
          <div className="w-full bg-neutral-800 border-2 border-neutral-700 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 border-b border-neutral-700 pb-3">
              <div className="w-10 h-10 rounded-full bg-teal-900 flex items-center justify-center text-teal-200">
                <UserCheck size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Alex</h3>
                <p className="text-xs text-neutral-400">Last active: 10m ago</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-neutral-900 p-2 rounded-lg">
                <span className="text-neutral-500 block mb-1">Mood</span>
                <span className="text-purple-400 font-bold">Anxious 😰</span>
              </div>
              <div className="bg-neutral-900 p-2 rounded-lg">
                <span className="text-neutral-500 block mb-1">Needs</span>
                <span className="text-yellow-400 font-bold">Company</span>
              </div>
            </div>

            <div className="bg-neutral-900 p-2 rounded-lg text-xs">
              <span className="text-neutral-500 block mb-1">Pet Status</span>
              <div className="flex justify-between text-neutral-300">
                <span>Hunger: 80%</span>
                <span>Happy: 30%</span>
              </div>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-1 overflow-hidden">
                <div className="bg-red-500 h-full w-[30%]"></div>
              </div>
            </div>
          </div>
        )}
        
        {menuLevel === 'anon_msg' && (
          <div className="w-full flex flex-col gap-3">
            <textarea
              value={anonMessage}
              onChange={(e) => setAnonMessage(e.target.value)}
              placeholder="Write whatever is on your mind. It's safe here..."
              className="w-full h-32 bg-neutral-800 border-2 border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none placeholder:text-neutral-500"
            />
            <button
              onClick={() => {
                if (anonMessage.trim()) {
                  handleAction(`Anonymous Message: ${anonMessage}`, 'chat');
                  setAnonMessage('');
                  setMenuLevel('player');
                }
              }}
              disabled={!anonMessage.trim() || loading}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Send size={16} /> Send to the Void
            </button>
          </div>
        )}

        {menuLevel === 'reply_msg' && (
          <div className="w-full flex flex-col gap-3 items-center">
            {!isReplying ? (
              // Card Browser
              <div className="w-full flex items-center justify-between gap-2">
                <button onClick={handlePrevCard} className="p-2 text-neutral-500 hover:text-white">
                  <ChevronLeft size={24} />
                </button>
                
                <div className="flex-1 h-40 relative perspective-1000">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={targetMessageIndex}
                      initial={{ opacity: 0, x: 50, rotateY: -10 }}
                      animate={{ opacity: 1, x: 0, rotateY: 0 }}
                      exit={{ opacity: 0, x: -50, rotateY: 10 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 bg-neutral-800 border border-neutral-600 rounded-xl p-4 flex flex-col justify-between shadow-xl"
                    >
                      <p className="text-sm text-neutral-300 italic">"{MOCK_ANON_MESSAGES[targetMessageIndex]}"</p>
                      <button
                        onClick={() => setIsReplying(true)}
                        className="self-end text-xs bg-yellow-600/20 text-yellow-500 px-3 py-1 rounded-full hover:bg-yellow-600 hover:text-white transition-colors border border-yellow-600/50"
                      >
                        Reply to this
                      </button>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <button onClick={handleNextCard} className="p-2 text-neutral-500 hover:text-white">
                  <ChevronRight size={24} />
                </button>
              </div>
            ) : (
              // Reply Input
              <div className="w-full flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-neutral-800/50 p-3 rounded-lg border border-neutral-700 text-xs text-neutral-400 italic mb-1">
                  Replying to: "{MOCK_ANON_MESSAGES[targetMessageIndex]}"
                </div>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Write a kind reply..."
                  className="w-full h-24 bg-neutral-800 border-2 border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-yellow-200 transition-colors resize-none placeholder:text-neutral-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsReplying(false)}
                    className="flex-1 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-bold text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (replyMessage.trim()) {
                        handleAction(`Replied to anon message: "${MOCK_ANON_MESSAGES[targetMessageIndex]}" with: "${replyMessage}"`, 'chat');
                        setReplyMessage('');
                        setMenuLevel('care_others');
                        setIsReplying(false);
                      }
                    }}
                    disabled={!replyMessage.trim() || loading}
                    className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Send size={16} /> Send
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <button 
          onClick={() => {
            if (menuLevel === 'first_aid' || menuLevel === 'anon_msg' || menuLevel === 'mood_tracker' || menuLevel === 'status_check') {
              setMenuLevel('player');
              setAiResponse(prev => ({ ...prev, message: "What do you want to do?", expression: 'happy' }));
            } else if (menuLevel === 'reply_msg' || menuLevel === 'send_gift' || menuLevel === 'friend_status') {
              setMenuLevel('care_others');
              setAiResponse(prev => ({ ...prev, message: "What do you want to do?", expression: 'happy' }));
            } else {
              setMenuLevel('main');
              setAiResponse(prev => ({ ...prev, message: "Who do you want to take care of?", expression: 'happy' }));
            }
          }}
          className="flex items-center gap-2 text-xs text-neutral-500 hover:text-white mt-2"
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-neutral-900 p-4 pt-32 font-mono text-neutral-200">
      
      <div className="relative flex flex-col items-center gap-8 w-full max-w-md">
        {/* Speech Bubble */}
        {aiResponse.message && (
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 bg-white text-black p-4 rounded-xl border-4 border-black shadow-lg z-10">
            <div className="text-center font-bold text-lg leading-tight">
              {loading ? "..." : aiResponse.message}
            </div>
            {/* Bubble Tail */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[16px] border-t-black"></div>
            <div className="absolute -bottom-[10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[12px] border-t-white"></div>
          </div>
        )}

        {/* Screen Only */}
        <div className="w-64 h-64 bg-[#9ea786] shadow-2xl border-8 border-[#8b9672] relative overflow-hidden rounded-lg shrink-0">
          <TamagotchiDisplay expression={aiResponse.expression} isTalking={loading} />
          
          {/* Wearable Overlay */}
          {wearing && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl pointer-events-none z-10 animate-bounce">
              {GIFTS.find(g => g.id === wearing)?.icon}
            </div>
          )}
          
          {/* Stats Overlay */}
          <div className="absolute top-2 right-2 text-[10px] text-black opacity-70 flex flex-col items-end leading-tight font-bold">
            <span>HNG: {state.hunger}</span>
            <span>HAP: {state.happiness}</span>
            <span>NRG: {state.energy}</span>
          </div>
        </div>

        {/* Dynamic Menu */}
        <div className="w-full min-h-[200px] flex items-start justify-center">
          {renderMenu()}
        </div>

        {/* Reset Button (Hidden-ish) */}
        <button 
          onClick={() => {
            if (confirm('Reset your pet?')) {
              setState({ hunger: 50, happiness: 50, energy: 50, lastAction: 'reset' });
              setAiResponse({ message: "Hi! Who are we caring for today?", expression: "happy", sound: "chirp", statsUpdate: { hunger: 0, happiness: 0, energy: 0 } });
              setMenuLevel('main');
              setInventory([]);
              setWearing(null);
              playBeep('happy');
            }
          }}
          className="opacity-20 hover:opacity-100 text-xs text-neutral-500 hover:text-red-500 transition-all absolute top-0 right-0"
        >
          [R]
        </button>
      </div>

      {/* User Input Only - REMOVED */}
      {/* <div className="w-full max-w-md mt-4">
        <form 
          onSubmit={(e) => { e.preventDefault(); if(input.trim()) handleAction(input, 'chat'); }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Say something..."
            className="flex-1 bg-neutral-800 border-2 border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors font-sans"
            disabled={loading}
          />
          <button 
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-yellow-500 text-black px-6 py-2 rounded-xl font-bold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
      </div> */}
    </div>
  );
}
