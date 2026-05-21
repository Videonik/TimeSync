import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';

export interface TimeInterval {
  start: Date;
  end: Date;
}

export interface UserIntervals {
  userId: string;
  busyIntervals: TimeInterval[];
}

@Injectable()
export class SchedulerService {
  /**
   * Step 1 & 2: Mock fetching busy intervals from external APIs and convert to UTC.
   * In a real implementation, this would fetch from Google Calendar or Yandex Calendar via OAuth tokens.
   */
  async fetchBusyIntervals(users: User[], searchStart: Date, searchEnd: Date): Promise<UserIntervals[]> {
    return users.map(user => {
      // Mocking busy intervals. Real implementation uses user.encryptedTokens to fetch from external API.
      // All intervals should be returned in UTC.
      
      // Let's create some dummy busy intervals for demonstration.
      const busyIntervals: TimeInterval[] = [];
      
      // Convert everything to Date objects ensuring it's in UTC
      return {
        userId: user.id,
        busyIntervals: busyIntervals
      };
    });
  }

  /**
   * Step 3: Merge overlapping busy intervals into single continuous blocks.
   */
  mergeIntervals(intervals: TimeInterval[]): TimeInterval[] {
    if (intervals.length === 0) return [];

    // Sort intervals by start time
    intervals.sort((a, b) => a.start.getTime() - b.start.getTime());

    const merged: TimeInterval[] = [intervals[0]];

    for (let i = 1; i < intervals.length; i++) {
      const current = intervals[i];
      const lastMerged = merged[merged.length - 1];

      if (current.start.getTime() <= lastMerged.end.getTime()) {
        // Overlapping intervals, merge them
        lastMerged.end = new Date(Math.max(lastMerged.end.getTime(), current.end.getTime()));
      } else {
        // No overlap, add to merged list
        merged.push(current);
      }
    }

    return merged;
  }

  /**
   * Step 4: Invert merged busy blocks to calculate free time windows for each participant within the search range.
   */
  invertIntervals(busyIntervals: TimeInterval[], searchStart: Date, searchEnd: Date): TimeInterval[] {
    const freeIntervals: TimeInterval[] = [];
    let currentStart = searchStart.getTime();

    for (const busy of busyIntervals) {
      if (busy.start.getTime() > currentStart && currentStart < searchEnd.getTime()) {
        freeIntervals.push({
          start: new Date(currentStart),
          end: new Date(Math.min(busy.start.getTime(), searchEnd.getTime()))
        });
      }
      currentStart = Math.max(currentStart, busy.end.getTime());
    }

    if (currentStart < searchEnd.getTime()) {
      freeIntervals.push({
        start: new Date(currentStart),
        end: searchEnd
      });
    }

    return freeIntervals;
  }

  /**
   * Step 5: Intersect lists of free windows using two pointers (O(n+m))
   */
  intersectIntervals(list1: TimeInterval[], list2: TimeInterval[]): TimeInterval[] {
    const intersections: TimeInterval[] = [];
    let i = 0;
    let j = 0;

    while (i < list1.length && j < list2.length) {
      const a = list1[i];
      const b = list2[j];

      // Find overlap start and end
      const start = new Date(Math.max(a.start.getTime(), b.start.getTime()));
      const end = new Date(Math.min(a.end.getTime(), b.end.getTime()));

      // If there's an overlap
      if (start.getTime() < end.getTime()) {
        intersections.push({ start, end });
      }

      // Move pointer for the interval that ends earlier
      if (a.end.getTime() < b.end.getTime()) {
        i++;
      } else {
        j++;
      }
    }

    return intersections;
  }

  /**
   * Filter intervals by required duration + buffer
   */
  filterByDuration(intervals: TimeInterval[], durationMinutes: number, bufferMinutes: number = 0): TimeInterval[] {
    const requiredMs = (durationMinutes + bufferMinutes) * 60 * 1000;
    return intervals.filter(slot => slot.end.getTime() - slot.start.getTime() >= requiredMs);
  }

  /**
   * Helper to generate all combinations of a specific size
   */
  getCombinations<T>(array: T[], size: number): T[][] {
    const result: T[][] = [];
    const helper = (start: number, combo: T[]) => {
      if (combo.length === size) {
        result.push([...combo]);
        return;
      }
      for (let i = start; i < array.length; i++) {
        combo.push(array[i]);
        helper(i + 1, combo);
        combo.pop();
      }
    };
    helper(0, []);
    return result;
  }

  /**
   * Orchestrator for steps 1-8
   */
  async findIntersections(
    users: User[],
    searchStart: Date,
    searchEnd: Date,
    durationMinutes: number
  ): Promise<(TimeInterval & { score: number, unavailableUsers: string[] })[]> {
    if (users.length === 0) return [];

    // 1 & 2: Fetch and UTC format
    const usersBusy = await this.fetchBusyIntervals(users, searchStart, searchEnd);

    // Get free intervals for each user
    const usersFree = usersBusy.map(ub => {
      // 3: Merge
      const mergedBusy = this.mergeIntervals(ub.busyIntervals);
      // 4: Invert
      return {
        userId: ub.userId,
        freeIntervals: this.invertIntervals(mergedBusy, searchStart, searchEnd)
      };
    });

    const allUserIds = usersFree.map(u => u.userId);
    const results: (TimeInterval & { score: number, unavailableUsers: string[], availableIds: string[] })[] = [];

    // Steps 5, 6, 7, 8: Iterate from full matches down to partial matches
    for (let k = usersFree.length; k > 0; k--) {
      const combinations = this.getCombinations(usersFree, k);

      for (const combo of combinations) {
        let commonFree = combo[0].freeIntervals;
        // Step 5: Pairwise intersect using two pointers
        for (let i = 1; i < combo.length; i++) {
          commonFree = this.intersectIntervals(commonFree, combo[i].freeIntervals);
        }

        // Step 6: Filter by duration
        const filtered = this.filterByDuration(commonFree, durationMinutes);
        const comboUserIds = combo.map(u => u.userId);
        const unavailableUsers = allUserIds.filter(id => !comboUserIds.includes(id));
        const score = Math.round((k / usersFree.length) * 100);

        for (const slot of filtered) {
          // Ensure we don't add subsets of already found full matches
          const isCovered = results.some(existing => 
            existing.start.getTime() <= slot.start.getTime() && 
            existing.end.getTime() >= slot.end.getTime() &&
            comboUserIds.every(id => existing.availableIds.includes(id))
          );

          if (!isCovered) {
            results.push({ ...slot, score, unavailableUsers, availableIds: comboUserIds });
          }
        }
      }
    }

    // Step 7: Rank by score (participants available), then chronological
    results.sort((a, b) => b.score - a.score || a.start.getTime() - b.start.getTime());

    return results.map(({ availableIds, ...rest }) => rest);
  }
}
