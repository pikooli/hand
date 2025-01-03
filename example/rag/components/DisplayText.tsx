import { motion } from 'motion/react';

const dropIn = {
  hidden: {
    y: '100vh',
    transition: {
      delay: 0.1,
      type: 'spring',
      damping: 10,
      stiffness: 100,
    },
  },
  visible: {
    y: '0',
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 10,
      stiffness: 100,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      type: 'spring',
      damping: 10,
      stiffness: 100,
    },
  },
};

export const DisplayElement = ({ text }: { text: string }) => {
  return (
    <motion.div
      initial="hidden"
      animate={'visible'}
      variants={dropIn}
      exit="exit"
      className="pointer-events-none absolute w-full h-full flex justify-center items-center"
    >
      <h1
        className="text-5xl md:text-7xl capitalize"
      >
        {text}
      </h1>
    </motion.div>
  );
};