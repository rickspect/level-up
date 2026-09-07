export const MAX_LEARNING_POINTS = 5;
export const MAX_POINT_LENGTH = 300;

function normalizeParsedPoints(result: string[]): string[] {
  if (result.length === 1 && result[0].trim().startsWith("[")) {
    try {
      const nested = JSON.parse(result[0]) as unknown;
      if (Array.isArray(nested)) {
        const nestedResult = nested
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean);
        if (nestedResult.length > 0) {
          return nestedResult;
        }
      }
    } catch {
      // Keep the original single item.
    }
  }

  return result;
}

export function toLearningPoints(
  reflection?: string[] | string | null
): string[] {
  if (Array.isArray(reflection)) {
    return reflection.map((point) => point.trim()).filter(Boolean);
  }

  return parseLearningPoints(reflection ?? null);
}

export function parseLearningPoints(value: string | null): string[] {
  if (!value?.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      const result = normalizeParsedPoints(
        parsed
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
      );
      return result;
    }
  } catch {
    // Legacy plain-text reflection.
  }

  const trimmed = value.trim();
  return trimmed ? [trimmed] : [];
}

export function serializeLearningPoints(points: string[]): string {
  const cleaned = points.map((point) => point.trim()).filter(Boolean);
  return JSON.stringify(cleaned);
}

export function getValidLearningPoints(points: string[]): string[] {
  return points.map((point) => point.trim()).filter(Boolean);
}

type ValidateLearningPointsOptions = {
  min?: number;
  max?: number;
};

export function validateLearningPoints(
  points: string[],
  options: ValidateLearningPointsOptions = {}
): { valid: true; points: string[] } | { valid: false; error: string } {
  const min = options.min ?? 1;
  const max = options.max ?? MAX_LEARNING_POINTS;
  const cleaned = getValidLearningPoints(points);

  if (cleaned.length < min) {
    return {
      valid: false,
      error:
        min === 1
          ? "At least one learning point is required"
          : `At least ${min} learning points are required`,
    };
  }

  if (cleaned.length > max) {
    return {
      valid: false,
      error: `Maximum ${max} learning points allowed`,
    };
  }

  for (const point of cleaned) {
    if (point.length > MAX_POINT_LENGTH) {
      return {
        valid: false,
        error: `Each point must be ${MAX_POINT_LENGTH} characters or less`,
      };
    }
  }

  return { valid: true, points: cleaned };
}
