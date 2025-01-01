interface GameDescriptionProps {
  onClick: () => void;
}

const description = [
  "WipeIt is a game where you have to clean by wiping the dust off the screen.",
  "You need to enable the camera of your computer💻",
  "You can use your hand 👋 to wipe the dust off the screen.",
]

export const GameDescription = ({ onClick }: GameDescriptionProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <h1 className="text-2xl font-bold">
      <span className="bg-black/[.6] rounded-md px-2 py-1">
        Welcome to the game WipeIt
      </span>
      </h1>
      <div>
        {description.map((desc, index) => (
          <p key={index} className="text-center text-lg">
            <span className="bg-black/[.6] rounded-md px-2 py-1">
            {desc}
            </span>
          </p>
        ))}
      </div>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-md capitalize"
        onClick={onClick}
      >
        start the game
      </button>
    </div>
  );
};
