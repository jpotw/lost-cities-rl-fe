import { GameState, Card, CardColor } from '@/types/game';

const calculateExpeditionScore = (expedition: Card[]): number => {
    if (expedition.length === 0) return 0;
    
    let score = 0;
    let multiplier = 1;
    let numCards = 0;
    
    for (const card of expedition) {
        numCards++;
        if (card.value === 'HS') {
            multiplier++;
        } else if (typeof card.value === 'number') {
            score += card.value;
        }
    }
    
    score = (score - 20) * multiplier;
    if (numCards >= 8) score += 20;
    
    return score;
};

const calculatePotentialExpeditionValue = (expedition: Card[], remainingCards: Card[], isLateGame: boolean): number => {
    if (expedition.length === 0) return 0;
    
    let score = 0;
    const multiplier = expedition.filter(c => c.value === 'HS').length + 1;
    let numCards = expedition.length;
    let highestValue = 0;
    
    // Calculate current score
    for (const card of expedition) {
        if (typeof card.value === 'number') {
            score += card.value;
            highestValue = Math.max(highestValue, card.value);
        }
    }
    
    // Estimate potential from remaining cards
    const playableCards = remainingCards.filter(c => 
        typeof c.value === 'number' && 
        c.value > highestValue
    ).sort((a, b) => {
        if (typeof a.value === 'number' && typeof b.value === 'number') {
            return a.value - b.value;
        }
        return 0;
    });
    
    // Add potential from top 3 playable cards (or less if late game)
    const potentialPlays = isLateGame ? 1 : 3;
    playableCards.slice(0, potentialPlays).forEach(card => {
        if (typeof card.value === 'number') {
            score += card.value;
            numCards++;
        }
    });
    
    score = (score - 20) * multiplier;
    if (numCards >= 8) score += 20;
    
    return score;
};

const analyzeGameState = (state: GameState) => {
    const remainingCards = state.deck.length;
    const isEarlyGame = remainingCards > 35;
    const isMidGame = remainingCards >= 20 && remainingCards <= 35;
    const isLateGame = remainingCards < 20;
    const isVeryLateGame = remainingCards < 10;
    
    // Count cards played in each color
    const colorCounts = new Map<CardColor, number>();
    for (const color of Object.keys(state.discardPiles) as CardColor[]) {
        const discardCount = state.discardPiles[color].length;
        const playerExpCount = state.players[0].expeditions[color].length;
        const aiExpCount = state.players[1].expeditions[color].length;
        colorCounts.set(color, discardCount + playerExpCount + aiExpCount);
    }
    
    return {
        isEarlyGame,
        isMidGame,
        isLateGame,
        isVeryLateGame,
        colorCounts,
        remainingCards
    };
};

const findSmallestPlayableNumber = (hand: Card[], expedition: Card[]): number | null => {
    const lastCard = expedition[expedition.length - 1];
    const minValue = typeof lastCard?.value === 'number' ? lastCard.value : 0;
    
    return hand.reduce((smallest: number | null, card) => {
        if (typeof card.value === 'number' && card.value > minValue) {
            if (smallest === null || card.value < smallest) {
                return card.value;
            }
        }
        return smallest;
    }, null);
};

const evaluateCard = (card: Card, state: GameState, playerIndex: number): number => {
    const player = state.players[playerIndex];
    const expedition = player.expeditions[card.color];
    const gamePhase = analyzeGameState(state);
    
    let value = 0;
    
    // Count active expeditions and their quality
    const activeExpeditions = Object.entries(player.expeditions).reduce((acc, [, exp]) => {
        if (exp.length === 0) return acc;
        const quality = calculatePotentialExpeditionValue(exp as Card[], player.hand, gamePhase.isLateGame);
        return acc + (quality > 0 ? 1 : 0.5); // Count struggling expeditions as half
    }, 0);

    // Find smallest playable number for this color
    const smallestPlayable = findSmallestPlayableNumber(player.hand, expedition);
    
    // Strong preference for playing smallest numbers
    if (typeof card.value === 'number' && smallestPlayable !== null) {
        if (card.value > smallestPlayable) {
            value -= (card.value - smallestPlayable) * 8; // Significant penalty for not playing smallest
        }
    }

    // Calculate sequence information
    const lowerCardsInHand = player.hand.filter(c => 
        c.color === card.color && 
        typeof c.value === 'number' && 
        typeof card.value === 'number' && 
        c.value < card.value
    ).length;

    const higherCardsInHand = player.hand.filter(c => 
        c.color === card.color && 
        typeof c.value === 'number' && 
        typeof card.value === 'number' &&
        c.value > card.value
    ).length;

    // Early game strategy adjustments
    if (gamePhase.isEarlyGame) {
        // Favor flexibility and information gathering
        if (typeof card.value === 'number' && card.value >= 4 && card.value <= 7) {
            value += 5; // Mid-value cards are good for probing
        }
        
        // Deception strategy
        if (expedition.length === 0 && typeof card.value === 'number' && card.value <= 3) {
            value += 3; // Low cards can be used for fake-outs
        }
    }

    // Handshake evaluation
    if (card.value === 'HS') {
        const highValueCardsInHand = player.hand.filter(c => 
            c.color === card.color && 
            typeof c.value === 'number' && 
            c.value >= 7
        );

        const potentialValue = calculatePotentialExpeditionValue(
            [...expedition, card],
            player.hand,
            gamePhase.isLateGame
        );

        if (!expedition.length) {
            // Starting new expedition with handshake
            if (highValueCardsInHand.length >= 2) {
                value = 35; // Increased bonus to promote handshake usage
                if (gamePhase.isEarlyGame) value += 5;
            } else if (highValueCardsInHand.length === 1 && activeExpeditions < 3) {
                value = 20; // Increased bonus when paired with one high card
            } else if (gamePhase.isLateGame) {
                value = -15;
            } else if (activeExpeditions >= 3) {
                value = -12;
            } else {
                value = potentialValue > 25 ? 15 : 0;
            }
        } else if (expedition.every(c => c.value === 'HS')) {
            value = potentialValue > 35 ? 15 : -8;
            if (gamePhase.isLateGame) value -= 15;
        } else {
            value = -25;
        }
    }

    // Number card evaluation
    else if (typeof card.value === 'number') {
        value = card.value;

        if (expedition.length > 0) {
            const lastCard = expedition[expedition.length - 1];
            if (lastCard.value === 'HS') {
                const multiplier = expedition.filter(c => c.value === 'HS').length + 1;
                let bonus = card.value >= 7 ? 10 : 8; // reduced bonus for high numbers
                const opponentExp = state.players[(playerIndex + 1) % 2].expeditions[card.color];
                if (opponentExp.some(c => c.value === 'HS')) {
                    bonus -= 2; // further reduce bonus if opponent has handshake in this color
                }
                value += bonus * multiplier;
                if (smallestPlayable !== null && card.value > smallestPlayable) {
                    value -= (card.value - smallestPlayable) * 4;
                }
            } else if (typeof lastCard.value === 'number') {
                if (card.value > lastCard.value) {
                    const gap = card.value - lastCard.value;
                    value += (10 - gap) * 3;
                    
                    if (smallestPlayable !== null && card.value > smallestPlayable) {
                        value -= (card.value - smallestPlayable) * 5;
                    }
                    
                    if (expedition.length >= 7) {
                        value += 20;
                    }
                } else {
                    value = -30;
                }
            }
        } else {
            // Starting new expedition
            if (gamePhase.isVeryLateGame && card.value < 8) {
                value = -25;
            } else if (activeExpeditions >= 3) {
                value = card.value >= 8 ? 8 : -20;
            } else {
                // Early game adjustments for starting new expedition
                if (gamePhase.isEarlyGame && typeof card.value === 'number') {
                    if (card.value >= 4 && card.value <= 7) {
                        value -= 5; // Encourage probing/discarding mid-range cards instead of committing
                    }
                    if (card.value <= 3) {
                        const investmentCount = player.hand.filter(c => c.color === card.color && c.value === 'HS').length;
                        if (investmentCount > 0) {
                            value -= 10; // Promote fake-out discard when holding investment cards
                        }
                    }
                }
                if (card.value >= 6) {
                    const lowerCardSupport = player.hand.filter(c => 
                        c.color === card.color && 
                        typeof c.value === 'number' && 
                        typeof card.value === 'number' &&
                        c.value < card.value && 
                        c.value > 2
                    ).length;

                    const blockedCards = typeof card.value === 'number' ? 6 - card.value : 0;
                    
                    value -= (typeof card.value === 'number' ? card.value * 2 : 0);
                    
                    if (lowerCardSupport === 0) {
                        value -= 25;
                        if (card.value >= 8) value -= 15;
                    } else if (lowerCardSupport === 1) {
                        value -= 15;
                    } else if (lowerCardSupport === 2) {
                        value -= 8;
                    }
                    
                    value -= blockedCards * 3;
                    
                    if (gamePhase.isEarlyGame) {
                        value -= 10;
                    }

                    if (smallestPlayable !== null && card.value > smallestPlayable) {
                        value -= (card.value - smallestPlayable) * 10;
                    }
                } else if (card.value <= 4) {
                    value += (5 - card.value) * 3;
                    
                    if (smallestPlayable === card.value) {
                        value += 15;
                    }
                    
                    if (higherCardsInHand >= 2) {
                        value += 10;
                    }
                }

                const potentialCards = player.hand.filter(c => 
                    c.color === card.color && 
                    typeof c.value === 'number' &&
                    typeof card.value === 'number' &&
                    c.value > card.value
                );
                
                const potentialValue = calculatePotentialExpeditionValue(
                    [card],
                    [...potentialCards, ...state.discardPiles[card.color]],
                    gamePhase.isLateGame
                );

                value += Math.max(0, potentialValue / 2);
                
                if (card.value >= 7) {
                    value += (lowerCardsInHand * 6);
                } else {
                    value += (higherCardsInHand * 5);
                }
            }
        }
    }

    return value;
};

const chooseDrawSource = (state: GameState, playerIndex: number): { type: 'deck' } | { type: 'discard', color: CardColor } => {
    const player = state.players[playerIndex];
    let bestDiscard: { color: CardColor; value: number } | null = null;
    const gamePhase = analyzeGameState(state);
    let currentScore = 0;
    for (const color of Object.keys(player.expeditions) as CardColor[]) {
        currentScore += calculateExpeditionScore(player.expeditions[color]);
    }
    if (gamePhase.isVeryLateGame && currentScore > 0) {
        return { type: 'deck' };
    }

    // Analyze each discard pile
    for (const [color, pile] of Object.entries(state.discardPiles) as [CardColor, Card[]][]) {
        if (pile.length > 0) {
            const topCard = pile[pile.length - 1];
            
            // Skip if this was our last discarded card
            if (state.lastDiscarded && 
                state.lastDiscarded.color === color && 
                state.lastDiscarded.cardId === topCard.id) {
                continue;
            }

            const expedition = player.expeditions[color];

            // Don't pick up cards we can't use
            if (expedition.length > 0) {
                const lastExpCard = expedition[expedition.length - 1];
                if (typeof lastExpCard.value === 'number' && 
                    typeof topCard.value === 'number' && 
                    topCard.value <= lastExpCard.value) {
                    continue;
                }
            }

            let value = evaluateCard(topCard, state, playerIndex);

            // Only consider cards that have a clear purpose
            let hasValidPurpose = false;

            // Purpose 1: Card is immediately playable and valuable
            if (expedition.length === 0) {
                if (typeof topCard.value === 'number') {
                    const supportingCards = player.hand.filter(c => 
                        c.color === color && 
                        typeof c.value === 'number' && 
                        typeof topCard.value === 'number' &&
                        c.value > topCard.value
                    ).length;
                    
                    hasValidPurpose = topCard.value <= 4 || supportingCards >= 2;
                } else if (topCard.value === 'HS') {
                    const highCards = player.hand.filter(c => 
                        c.color === color && 
                        typeof c.value === 'number' && 
                        c.value >= 7
                    ).length;
                    hasValidPurpose = highCards >= 1;
                }
            } else {
                const lastCard = expedition[expedition.length - 1];
                if (typeof lastCard.value === 'number' && 
                    typeof topCard.value === 'number' && 
                    topCard.value > lastCard.value) {
                    const gap = topCard.value - lastCard.value;
                    hasValidPurpose = gap <= 3;
                }
            }

            // Purpose 2: Denying opponent a valuable card
            const opponentValue = evaluateCard(topCard, state, (playerIndex + 1) % 2);
            if (opponentValue > 15 && expedition.length > 0) {
                hasValidPurpose = true;
                value += 20;  // increased bonus for denying opponent
            }

            // Enhanced expedition completion consideration
            if (expedition.length >= 6) {
                hasValidPurpose = true;
                value += 15;
            }

            if (hasValidPurpose && value > 12) {
                if (!bestDiscard || value > bestDiscard.value) {
                    bestDiscard = { color, value };
                }
            }
        }
    }

    const shouldDrawDeck = !bestDiscard || 
        (bestDiscard.value < 15 && gamePhase.remainingCards > 30) || 
        (bestDiscard.value < 18 && Math.random() < 0.3);

    return shouldDrawDeck ? { type: 'deck' } : { type: 'discard', color: bestDiscard!.color };
};

const chooseCardPlay = (state: GameState, playerIndex: number): { card: Card, action: 'play' | 'discard', color?: CardColor } => {
    const player = state.players[playerIndex];
    let bestPlay: { value: number, card: Card, action: 'play' | 'discard' } = { value: -Infinity, card: player.hand[0], action: 'discard' };
    const committedExpeditions = Object.keys(player.expeditions).filter(color => player.expeditions[color as CardColor].length > 0);
    const gamePhase = analyzeGameState(state);

    for (const card of player.hand) {
        const expedition = player.expeditions[card.color];
        const lastExpeditionCard = expedition.length > 0 ? expedition[expedition.length - 1] : null;
        
        const canPlay = !expedition.length ||
            (card.value === 'HS' && expedition.every(c => c.value === 'HS')) ||
            (typeof card.value === 'number' && lastExpeditionCard && (
                lastExpeditionCard.value === 'HS' ||
                (typeof lastExpeditionCard.value === 'number' && card.value > lastExpeditionCard.value)
            ));
        
        const basePlayValue = evaluateCard(card, state, playerIndex);
        const playValue = gamePhase.isVeryLateGame ? basePlayValue + 5 : basePlayValue;
        
        if (canPlay) {
            if (card.value === 'HS') {
                if (playValue > bestPlay.value) {
                    bestPlay = { value: playValue, card, action: 'play' };
                }
            } else if (expedition.length === 0 && committedExpeditions.length < 3) {
                if (playValue > bestPlay.value) {
                    bestPlay = { value: playValue, card, action: 'play' };
                }
            } else if (playValue > bestPlay.value) {
                bestPlay = { value: playValue, card, action: 'play' };
            }
        }
        
        // Consider discarding
        let discardValue = -basePlayValue;
        if ((gamePhase.isMidGame || gamePhase.isLateGame) && expedition.length > 0) {
            // Extra denial incentive when opponent may benefit from this color
            discardValue -= 10;
        }
        
        const opponentIndex = (playerIndex + 1) % 2;
        const opponentValue = evaluateCard(card, state, opponentIndex);
        const opponentExpedition = state.players[opponentIndex].expeditions[card.color];
        
        if (opponentExpedition.length > 0) {
            const lastOpponentCard = opponentExpedition[opponentExpedition.length - 1];
            if (typeof lastOpponentCard?.value === 'number' && 
                typeof card.value === 'number' && 
                card.value > lastOpponentCard.value) {
                discardValue -= opponentValue * 1.5;
            }
        }
        if (opponentExpedition.some(c => c.value === 'HS')) {
            discardValue -= 10; // further penalize discarding when opponent has a handshake
        }

        if (expedition.length > 0 && typeof card.value === 'number' && card.value >= 7) {
            discardValue -= 20; // heavy penalty for discarding high number cards when expedition is active
        }

        // Consider keeping good starter cards
        if (expedition.length === 0 && typeof card.value === 'number' && card.value <= 4) {
            const higherCardsInHand = player.hand.filter(c => 
                c.color === card.color && 
                typeof c.value === 'number' && 
                typeof card.value === 'number' &&
                c.value > card.value
            ).length;
            
            if (higherCardsInHand >= 2) {
                discardValue -= 15;
            }
        }

        // Consider card scarcity
        const allVisibleCards = [
            ...Object.values(state.discardPiles).flatMap(pile => pile),
            ...player.hand,
            ...Object.values(player.expeditions).flatMap(exp => exp),
            ...Object.values(state.players[(playerIndex + 1) % 2].expeditions).flatMap(exp => exp)
        ];
        const visibleCardsOfColor = allVisibleCards.filter(c => c.color === card.color).length;
        const remainingCardsOfColor = 12 - visibleCardsOfColor;
        if (remainingCardsOfColor < 5 && typeof card.value === 'number' && card.value >= 6) {
            discardValue -= 10;
        }

        // Consider potential for future expeditions
        if (typeof card.value === 'number' && card.value >= 5) {
            const potentialExpeditionValue = calculatePotentialExpeditionValue(
                [card],
                player.hand,
                gamePhase.isLateGame
            );
            if (potentialExpeditionValue > 20) {
                discardValue -= 12;
            }
        }

        if (discardValue > bestPlay.value) {
            bestPlay = { value: discardValue, card, action: 'discard' };
        }
    }

    return {
        card: bestPlay.card,
        action: bestPlay.action,
        color: bestPlay.action === 'play' ? bestPlay.card.color : undefined
    };
};

export const makeAIMove = async (state: GameState, playerIndex: number): Promise<GameState> => {
    // Use a consistent delay instead of random
    await new Promise(resolve => setTimeout(resolve, 750));
    
    const newState = JSON.parse(JSON.stringify(state)); // Deep copy for safety
    const player = newState.players[playerIndex];
    
    // Play phase
    if (newState.gamePhase === 'PLAY' && player.hand.length > 0) {
        const move = chooseCardPlay(newState, playerIndex);
        
        // Set the selected card
        newState.selectedCard = move.card;
        
        if (move.action === 'play' && move.color) {
            // Play card to expedition
            const cardIndex = player.hand.findIndex((c: Card) => c.id === move.card.id);
            player.hand.splice(cardIndex, 1);
            player.expeditions[move.card.color].push(move.card);
            newState.gamePhase = 'DRAW';
        } else {
            // Discard card
            const cardIndex = player.hand.findIndex((c: Card) => c.id === move.card.id);
            player.hand.splice(cardIndex, 1);
            newState.discardPiles[move.card.color].push(move.card);
            newState.gamePhase = 'DRAW';
        }
        return newState;
    }
    
    // Draw phase
    if (newState.gamePhase === 'DRAW') {
        const drawChoice = chooseDrawSource(newState, playerIndex);
        if (drawChoice.type === 'deck') {
            const drawnCard = newState.deck.pop();
            if (drawnCard) {
                player.hand.push(drawnCard);
            }
        } else {
            const drawnCard = newState.discardPiles[drawChoice.color].pop();
            if (drawnCard) {
                player.hand.push(drawnCard);
            }
        }
        
        newState.gamePhase = 'PLAY';
        newState.currentPlayerIndex = (playerIndex + 1) % 2;
        return newState;
    }
    
    return newState;
}; 