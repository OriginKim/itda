export const EASE_SIGNATURE = [0.16, 1, 0.3, 1] as const;

export const fadeInTransition = {
  duration: 0.5,
  ease: EASE_SIGNATURE,
};

export const cardHoverTransition = {
  duration: 0.2,
  ease: EASE_SIGNATURE,
};

export const pageTransition = {
  duration: 0.3,
  ease: EASE_SIGNATURE,
};

export const countUpTransition = {
  duration: 0.8,
  ease: EASE_SIGNATURE,
};
