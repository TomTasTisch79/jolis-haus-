export type FairnessPoolTask = {
  id: string;
  points: number;
};

export type FairnessInput = {
  profileIds: [string, string];
  fixedPointsByProfile: Record<string, number>;
  fixedCountByProfile: Record<string, number>;
  poolTasks: FairnessPoolTask[];
};

/**
 * Greedy fairness assignment: largest task first, always going to whoever
 * currently has the lower score (points, then task count, then a coin flip
 * only when truly tied) — not a uniform random draw.
 */
export function assignPoolTasks(input: FairnessInput): Record<string, string> {
  const [a, b] = input.profileIds;

  const points: Record<string, number> = {
    [a]: input.fixedPointsByProfile[a] ?? 0,
    [b]: input.fixedPointsByProfile[b] ?? 0,
  };
  const count: Record<string, number> = {
    [a]: input.fixedCountByProfile[a] ?? 0,
    [b]: input.fixedCountByProfile[b] ?? 0,
  };

  const sortedTasks = [...input.poolTasks].sort((t1, t2) => t2.points - t1.points);
  const assignment: Record<string, string> = {};

  for (const task of sortedTasks) {
    let chosen: string;
    if (points[a] !== points[b]) {
      chosen = points[a] < points[b] ? a : b;
    } else if (count[a] !== count[b]) {
      chosen = count[a] < count[b] ? a : b;
    } else {
      chosen = Math.random() < 0.5 ? a : b;
    }

    assignment[task.id] = chosen;
    points[chosen] += task.points;
    count[chosen] += 1;
  }

  return assignment;
}
