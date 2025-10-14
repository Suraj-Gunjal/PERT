export function validateActivities(activities) {
  // Check for empty activities
  const validIds = new Set();
  for (const activity of activities) {
    if (!activity.id || !activity.id.trim()) {
      return { valid: false, error: "All activities must have an ID" };
    }
    validIds.add(activity.id);
  }

  // Check for missing predecessors
  for (const activity of activities) {
    for (const pred of activity.predecessors) {
      if (!validIds.has(pred)) {
        return {
          valid: false,
          error: `Activity ${activity.id} has undefined predecessor: ${pred}`,
        };
      }
    }
  }

  // Check for circular dependencies using DFS
  const visited = new Set();
  const recursionStack = new Set();

  function hasCycle(actId) {
    visited.add(actId);
    recursionStack.add(actId);

    const activity = activities.find((a) => a.id === actId);
    if (activity) {
      for (const pred of activity.predecessors) {
        if (!visited.has(pred)) {
          if (hasCycle(pred)) return true;
        } else if (recursionStack.has(pred)) {
          return true;
        }
      }
    }

    recursionStack.delete(actId);
    return false;
  }

  for (const activity of activities) {
    if (!visited.has(activity.id)) {
      if (hasCycle(activity.id)) {
        return {
          valid: false,
          error: "Circular dependency detected in activities",
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Forward Pass: Calculate ES (Earliest Start) and EF (Earliest Finish)
 * ES[activity] = MAX(EF[all predecessors])
 * EF[activity] = ES[activity] + duration
 */
function forwardPass(activities) {
  activities.forEach((activity) => {
    if (activity.predecessors.length === 0) {
      activity.es = 0;
    } else {
      const predecessorEFs = activity.predecessors
        .map((predId) => {
          const pred = activities.find((a) => a.id === predId);
          return pred ? pred.ef : 0;
        })
        .filter((ef) => ef !== undefined);
      activity.es = predecessorEFs.length > 0 ? Math.max(...predecessorEFs) : 0;
    }
    activity.ef = activity.es + activity.duration;
  });
}

/**
 * Backward Pass: Calculate LS (Latest Start) and LF (Latest Finish)
 * LF[activity] = MIN(LS[all successors])
 * LS[activity] = LF[activity] - duration
 */
function backwardPass(activities, projectDuration) {
  // Process in reverse order for efficiency
  const sorted = [...activities].reverse();

  sorted.forEach((activity) => {
    // Find all successor activities
    const successors = activities.filter((a) =>
      a.predecessors.includes(activity.id)
    );

    if (successors.length === 0) {
      // End activities must finish by project completion
      activity.lf = projectDuration;
    } else {
      // LF = minimum LS of successors
      const successorLSs = successors
        .map((s) => s.ls)
        .filter((ls) => ls !== undefined);
      activity.lf =
        successorLSs.length > 0 ? Math.min(...successorLSs) : projectDuration;
    }
    activity.ls = activity.lf - activity.duration;
  });
}

/**
 * Calculate slack and identify critical activities
 * Slack = LF - EF (or LS - ES)
 * Critical activity has slack ≈ 0
 */
function calculateSlackAndCritical(activities) {
  activities.forEach((activity) => {
    activity.slack = activity.lf - activity.ef;
    activity.critical = activity.slack < 0.01; // floating point tolerance
  });
}

/**
 * Trace the critical path through the network
 * Returns activities sorted by ES along the critical path
 */
function traceCriticalPath(activities) {
  const criticalActivities = activities
    .filter((a) => a.critical)
    .sort((a, b) => a.es - b.es);
  return criticalActivities.map((a) => a.id);
}

/**
 * Main CPM/PERT calculation function
 * @param {Array} activities - Activity array with id, name, duration, predecessors
 * @param {Boolean} usePERT - If true, calculate duration using PERT formula
 * @returns {Object} Results containing activities, projectDuration, and criticalPath
 */
export function calculateCPM(activities, usePERT = false) {
  // Deep clone to avoid mutation
  const processedActivities = JSON.parse(JSON.stringify(activities));

  // Calculate expected durations (PERT if enabled)
  processedActivities.forEach((activity) => {
    if (usePERT && activity.o && activity.p) {
      // PERT Formula: Expected Time = (Optimistic + 4×MostLikely + Pessimistic) / 6
      // Standard Deviation = (Pessimistic - Optimistic) / 6
      activity.duration = (activity.o + 4 * activity.m + activity.p) / 6;
      activity.stdDev = (activity.p - activity.o) / 6;
    } else {
      activity.duration = parseFloat(activity.duration) || 0;
      activity.stdDev = 0;
    }
  });

  // Step 1: Forward pass (calculate ES and EF)
  forwardPass(processedActivities);

  // Step 2: Calculate project duration
  const projectDuration = Math.max(...processedActivities.map((a) => a.ef));

  // Step 3: Backward pass (calculate LS and LF)
  backwardPass(processedActivities, projectDuration);

  // Step 4: Calculate slack and identify critical activities
  calculateSlackAndCritical(processedActivities);

  // Step 5: Trace the critical path
  const criticalPath = traceCriticalPath(processedActivities);

  return {
    activities: processedActivities,
    projectDuration,
    criticalPath,
  };
}
