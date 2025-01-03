'use client';
export const Footer = () => {
  return (
    <footer className="absolute bottom-0 w-full py-4 text-center">
      <p className="text-sm">
        <span className="bg-gray-800 px-2 py-1 rounded">
              Made with ❤️ by{' '}
              <a
                href="https://github.com/pikooli"
                className="underline hover:no-underline"
              >
                Pikooli
              </a>
        </span>
      </p>
    </footer>
  );
};
