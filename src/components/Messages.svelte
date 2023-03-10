<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { currentUser, pb } from "../lib/pocketbase";

  let messages = [];
  let newMessage = "";
  let unsubscribe: () => void;

  let errorMessage = "";
  let loading = false;

  async function sendMessage() {
    try {
      errorMessage = "";
      loading = true;

      if (newMessage.length < 2)
        throw new Error("Message must be at least 2 characters long");

      const data = { text: newMessage, author: $currentUser.id };
      await pb.collection("messages").create(data);

      console.log("Message succesfully sent:", data);
    } catch (error) {
      errorMessage = error.message;
      console.error("Error sending message:", error);
    } finally {
      loading = false;
    }
  }

  async function deleteMessage(message: Record<string, any>) {
    try {
      errorMessage = "";
      loading = true;

      // This actually deletes the message:
      // await pb.collection("messages").delete(message.id);

      // This is a soft delete, it will set the deleted field to true.
      await pb.collection("messages").update(message.id, { deleted: true });
      messages = messages.filter((msg) => msg.id !== message.id);

      console.log("Message succesfully deleted:", message);
    } catch (error) {
      errorMessage = error.message;
      console.error("Error deleting message:", error);
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    // Get Initial Messages
    try {
      loading = true;

      const { items } = await pb.collection("messages").getList(1, 50, {
        sort: "-created",
        expand: "author",
        filter: "deleted = false",
      });
      messages = items;

      // Subscribe to New Messages, this will update the messages array or delete a message from the array.
      unsubscribe = await pb
        .collection("messages")
        .subscribe("*", async ({ action, record }) => {
          errorMessage = "";

          if (action === "create") {
            const author = await pb.collection("users").getOne(record.author);
            record.expand = { author };
            messages = [record, ...messages];
          } else if (action === "delete") {
            // On delete event, remove deleted message from interface.
            // messages = messages.filter((message) => message.id !== record.id);
          }
        });
    } catch (error) {
      errorMessage = error.message;
      console.error("Error getting messages:", error);
    } finally {
      loading = false;
    }
  });

  onDestroy(() => {
    unsubscribe();
  });
</script>

<div>
  <hr />

  <form on:submit|preventDefault>
    <div class="form-group">
      <h4>New Message</h4>
      <textarea
        class="form-control"
        placeholder="Enter new message"
        bind:value={newMessage}
        disabled={loading}
      />
      {#if loading}
        <div class="d-flex flex-row justify-content-center">
          <div class="spinner-border text-primary mt-2" role="status">
            <span class="sr-only" />
          </div>
        </div>
      {:else}
        <button
          class="btn btn-primary btn-sm col-3 mt-2"
          on:click={sendMessage}
        >
          Send
        </button>
      {/if}
    </div>
  </form>

  {#if errorMessage}
    <div class="alert alert-danger my-3" role="alert">
      Error: {errorMessage}
    </div>
  {/if}

  {#each messages as message (message.id)}
    <div class="card my-3">
      <div
        class="card-body border border-{message.author == $currentUser.id
          ? 'success'
          : 'primary'}"
      >
        <div class="d-flex flex-row flex-nowrap">
          <div
            style="width:5%;"
            class="bg-{message.author == $currentUser.id
              ? 'success'
              : 'primary'}"
          >
            <img
              src="https://avatars.dicebear.com/api/adventurer/{message.author}.svg"
              alt="avatar of {message.expand.author.name}"
            />
          </div>
          <div class="d-flex flex-column justify-content-center">
            <h5 class="card-title mx-2 my-0">
              {message.expand.author.name}:
            </h5>
          </div>
          <p
            class="card-text mt-3 text-{message.author == $currentUser.id
              ? 'success'
              : 'primary'}"
          >
            {message.text}
          </p>
        </div>
        {#if message.author == $currentUser.id}
          <hr />
          <button
            class="btn btn-danger btn-sm col-3"
            on:click={() => deleteMessage(message)}
          >
            Delete this message
          </button>
        {/if}
      </div>
    </div>
  {/each}
</div>
