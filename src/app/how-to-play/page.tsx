"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const HowToPlay = () => {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <button
        onClick={() => router.push('/')}
        className="fixed top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg z-50"
      >
        Back to Game
      </button>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl w-full rounded-3xl shadow-2xl p-10"
      >
        <motion.h1 
          className="text-4xl md:text-5xl font-bold text-yellow-500 mb-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          How to Play Lost Cities
        </motion.h1>
        <p className="text-lg text-gray-300 mb-6">
         citation: <a href="https://boardgamegeek.com/boardgame/50/lost-cities" className="text-blue-500 hover:text-blue-700">https://boardgamegeek.com/boardgame/50/lost-cities</a>
        </p>
        <motion.p 
          className="text-lg text-gray-300 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Lost Cities is a card game in the Kosmos two-player series. The game originally consisted of a single deck of cards of rank 2&ndash;10 in five different colors with three special &ldquo;handshakes&rdquo; (&ldquo;HS&rdquo; in scoring examples below) in each suit, but as of 2019 the game now includes six colored suits, with the sixth color being optional for gameplay. A game board is included to organize discarded cards and help players organize their card collections.
        </motion.p>

        <motion.h2 
          className="text-2xl font-semibold text-yellow-500 mt-8 mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          Objective
        </motion.h2>
        <motion.p 
          className="text-lg text-gray-300 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          The object of the game is to gain points by mounting profitable archaeological expeditions to the different sites represented by the colored suits of cards. On a player&apos;s turn, they must first play one card, either to an expedition or by discarding it to the color-appropriate discard pile, then draw one card, either from the deck or from the top of a discard pile. Cards played to expeditions must be in ascending order, but they need not be consecutive. Handshakes are considered lower than a 2 and represent investments in an expedition. Thus, if you play a red 4, you may play any other red card higher than a 4 on a future turn but may no longer play a handshake, the 2, or the 3.
        </motion.p>

        <motion.h2 
          className="text-2xl font-semibold text-yellow-500 mt-8 mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0, duration: 0.5 }}
        >
          Game Progression
        </motion.h2>
        <motion.p 
          className="text-lg text-gray-300 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          The game continues in this fashion with players alternating turns until the final card is taken from the deck. The rest of the cards in hand are then discarded and players score their expeditions. Each expedition that has at least one card played into it must be scored. Cards played into an expedition are worth their rank in points, and handshakes count as a multiplier against your final total; one handshake doubles an expedition&apos;s value, while two handshakes triples that value and three handshakes quadruple it. Expeditions start at a value of -20, so you must play at least 20 points of cards into an expedition in order to make a profit. If you are left with a negative value and have a handshake, the multiplier still applies. A 20-point bonus is awarded to every expedition with at least eight cards played into it. A complete game of Lost Cities lasts three matches, with scores for each match being added together.
        </motion.p>

        <motion.h2 
          className="text-2xl font-semibold text-yellow-500 mt-8 mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          Scoring Examples
        </motion.h2>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.6 }}>
          <p className="text-lg text-gray-300 mb-4">
            <strong>Example 1:</strong> An expedition has a 2,3,7,8,10 for a total of 30. This expedition is worth 10 total points: 30 plus the initial -20.
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            <strong>Example 2:</strong> An expedition has 2 HS, and 4,5,6,7,8,10 for a total of 40. This expedition is worth 80 total points: 40 points for cards, plus the initial -20, ×3 for the two multipliers, plus the 20-pt bonus for playing 8+ cards.
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            <strong>Example 3:</strong> An expedition has 1 HS, and 4,6,7 for a total of 17. This expedition is worth -6 total points: 17 plus the initial -20, ×2 for the multiplier.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HowToPlay;