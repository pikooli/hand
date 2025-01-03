interface GameDescriptionProps {
  onClick: () => void;
}

const description = [
  'Welcome to WipeIt - an interactive cleaning game! 🎮',
  'Your mission is to keep your screen spotless by wiping away dirt as it appears.',
  "To play, you'll need to enable your computer's camera 📸",
  'Make a paper/open hand gesture ✋ to control your virtual cleaning rag',
  'Progress through levels by cleaning quickly and efficiently! 🏆',
  'Are you ready to become the ultimate cleaning champion? 💪',
];

export const GameDescription = ({ onClick }: GameDescriptionProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <h1 className="text-4xl font-bold bg-gray-800 p-4 rounded-md">WipeIt</h1>
      <div className="flex flex-col bg-gray-800 rounded-md p-4">
        {description.map((desc, index) => (
          <p key={index} className="text-center text-lg">
            {desc}
          </p>
        ))}
      </div>
      <button
        className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg text-xl font-bold transition-colors"
        onClick={onClick}
      >
        Start Game
      </button>
    </div>
  );
};
