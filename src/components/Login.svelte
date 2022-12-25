<script lang="ts">
  import { currentUser, pb } from "../lib/pocketbase";

  let username = "";
  let password = "";

  let errorMessage = "";
  let loading = false;

  function clearForm() {
    username = "";
    password = "";
  }

  async function login() {
    try {
      errorMessage = "";
      loading = true;

      await pb.collection("users").authWithPassword(username, password);
      console.log("User succesfully logged in:", $currentUser);

      clearForm();
    } catch (error) {
      errorMessage = error.message;
      console.error("Error logging in user:", error);
    } finally {
      loading = false;
    }
  }

  async function register() {
    try {
      errorMessage = "";
      loading = true;

      if (username.length < 4)
        throw new Error("Username must be at least 4 characters long");

      if (password.length < 8)
        throw new Error("Password must be at least 8 characters long");

      const data = {
        username,
        password,
        passwordConfirm: password,
        name: username,
      };

      await pb.collection("users").create(data);
      console.log("User succesfully registered:", $currentUser);
      await login();
    } catch (error) {
      errorMessage = error.message;
      console.error("Error registering user:", error);
    } finally {
      loading = false;
    }
  }

  function logoff() {
    pb.authStore.clear();
    console.log("User succesfully logged off:", $currentUser);
    clearForm();
  }
</script>

{#if $currentUser}
  <h1 class="text-center mt-5">
    Welcome to Chatopolis, <span class="text-success"
      >{$currentUser.username}</span
    >!
  </h1>
  <div class="mb-4 d-flex flex-row justify-content-center flex-nowrap">
    <button class="btn btn-danger col-3" on:click={logoff}>Logoff</button>
  </div>
{:else}
  <form class="form-signin my-5" on:submit|preventDefault>
    <h1 class="h3 mb-3 font-weight-normal text-center">
      Welcome to <span class="text-success">Chatopolis</span>, please login.
    </h1>
    <label for="inputUsername" class="sr-only">Username</label>
    <input
      type="username"
      class="form-control"
      placeholder="Username"
      disabled={loading}
      bind:value={username}
    />
    <label for="inputPassword" class="sr-only">Password</label>
    <input
      type="password"
      class="form-control"
      placeholder="Password"
      disabled={loading}
      bind:value={password}
    />
    {#if loading}
      <div class="d-flex flex-row justify-content-center">
        <div class="spinner-border text-primary mt-3" role="status">
          <span class="sr-only" />
        </div>
      </div>
    {:else}
      <button class="btn btn-primary mt-3" on:click={login}>Login</button>
      <button class="btn btn-primary mt-3" on:click={register}>Register</button>
    {/if}

    {#if errorMessage}
      <div class="alert alert-danger my-3" role="alert">
        Error: {errorMessage}
      </div>
    {/if}
  </form>
{/if}
