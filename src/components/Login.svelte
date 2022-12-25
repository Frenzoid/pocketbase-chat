<script lang="ts">
  import { currentUser, pb } from "../lib/pocketbase";

  let username: string;
  let password: string;

  let errorMessage = "";

  function clearForm() {
    username = "";
    password = "";
  }

  async function login() {
    try {
      await pb.collection("users").authWithPassword(username, password);
      console.log("User succesfully logged in:", $currentUser);
      clearForm();
    } catch (error) {
      errorMessage = error.message;
      console.error("Error logging in user:", error);
    }
  }

  async function register() {
    try {
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
    <button class="btn btn-danger col-12" on:click={logoff}>Log Off</button>
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
      bind:value={username}
    />
    <label for="inputPassword" class="sr-only">Password</label>
    <input
      type="password"
      class="form-control"
      placeholder="Password"
      bind:value={password}
    />
    <button class="btn btn-primary mt-3" on:click={login}> Login </button>
    <button class="btn btn-primary mt-3" on:click={register}>Register</button>

    {#if errorMessage}
      <div class="alert alert-danger my-3" role="alert">
        Error: {errorMessage}
      </div>
    {/if}

    <p class="mt-5 mb-3 text-muted">© 2022 - 2023</p>
  </form>
{/if}
