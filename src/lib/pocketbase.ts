// Imports
import PocketBase from "pocketbase";
import { writable } from "svelte/store";

// Create a new PocketBase instance, and a writable store for the current user.
export const pb = new PocketBase("https://pocketbase.storage.frenzoid.dev");
export const currentUser = writable(pb.authStore.model);

// Listen for changes to the current user, and update the store variable.
pb.authStore.onChange(() => {
  currentUser.set(pb.authStore.model);
});