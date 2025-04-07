import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-2 text-indigo-600">
          Outfit Planner Chatbot
        </h1>
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
          Get personalized outfit recommendations based on weather and your activities. 
          Our AI-powered chatbot helps you plan your outfits for any occasion.
        </p>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-indigo-100">
          <ChatInterface />
        </div>
      </div>
    </main>
  );
}
