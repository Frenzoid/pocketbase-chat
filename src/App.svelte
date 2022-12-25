<script lang="ts">
  import Login from "./components/Login.svelte";
  import Messages from "./components/Messages.svelte";
  import { currentUser } from "./lib/pocketbase";
</script>

<main class="container">
  <Login />
  {#if $currentUser}
    <Messages />
  {/if}
</main>
