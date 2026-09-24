import { moment as obsidianMoment } from 'obsidian';
import type momentType from 'moment';

// Obsidian exposes the callable Moment factory, but its declaration uses a namespace import.
export const moment = obsidianMoment as unknown as typeof momentType;
