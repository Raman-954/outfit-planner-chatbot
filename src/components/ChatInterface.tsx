'use client';

import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { getWeatherForecast, getCurrentWeather } from '@/services/weatherService';
import { getOutfitRecommendations, getUserPreferences } from '@/services/outfitService';
import { OutfitRecommendation } from '@/types/outfit';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  recommendations?: OutfitRecommendation[];
};

type Gender = 'male' | 'female' | null;

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [gender, setGender] = useState<Gender>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const placeholders = [
    "What should I wear today?",
    "Help me plan an outfit for a business meeting"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Change placeholder text every 3 seconds
    const interval = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get user preferences and include the last message
      const preferences = await getUserPreferences();
      preferences.lastMessage = input;
      preferences.gender = gender;
      
      // Get current weather
      const weather = await getCurrentWeather();
      
      // Get outfit recommendations
      const recommendations = await getOutfitRecommendations(weather, preferences);
      
      // Add assistant message with recommendations
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Based on today's weather (${weather.temperature}°C, ${weather.description}), here are some outfit recommendations:`,
        sender: 'assistant',
        recommendations,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error while getting outfit recommendations. Please try again.',
        sender: 'assistant',
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenderSelect = (selectedGender: Gender) => {
    setGender(selectedGender);
    
    // Add a message about gender selection
    const genderMessage: Message = {
      id: Date.now().toString(),
      text: `Thank you for selecting ${selectedGender}. Now I can provide more personalized outfit recommendations. What would you like to wear today?`,
      sender: 'assistant',
    };
    
    setMessages((prev) => [...prev, genderMessage]);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-indigo-50 to-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-indigo-100">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">Welcome to Outfit Planner</h2>
            <p className="text-gray-600 mb-6">I can help you plan the perfect outfit based on weather and occasion.</p>
            
            {gender === null ? (
              <div className="space-y-4">
                <p className="text-gray-700 font-medium">Please select your gender for personalized recommendations:</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => handleGenderSelect('male')}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Male
                  </button>
                  <button
                    onClick={() => handleGenderSelect('female')}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Female
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <h3 className="text-lg font-semibold text-indigo-700 mb-2">Weather-Based</h3>
                  <p className="text-gray-600">Get recommendations based on current weather conditions.</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <h3 className="text-lg font-semibold text-indigo-700 mb-2">Activity-Based</h3>
                  <p className="text-gray-600">Get recommendations for specific occasions or activities.</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white border border-gray-200 shadow-sm text-gray-800'
                }`}
              >
                <p>{message.text}</p>
                
                {message.recommendations && message.recommendations.map((rec, index) => (
                  <div key={index} className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <p className="font-medium text-indigo-700 capitalize">{rec.outfit.occasion} Outfit</p>
                    <p className="text-sm text-gray-600 mt-1">{rec.reasoning}</p>
                    
                    {rec.outfit.items.length > 0 && (
                      <div className="mt-3">
                        <p className="font-medium text-gray-700">Items:</p>
                        <ul className="list-disc list-inside text-gray-600 mt-1">
                          {rec.outfit.items.map((item) => (
                            <li key={item.id}>{item.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder=""
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400 text-gray-800"
            />
            {input === '' && (
              <div className="absolute inset-0 flex items-center pl-3 pointer-events-none">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={placeholderIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-gray-400"
                  >
                    {placeholders[placeholderIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || input.trim() === ''}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
} 