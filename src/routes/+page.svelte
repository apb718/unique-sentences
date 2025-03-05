<script>
	let sentence = "";
	let name = "";
	let error = null;
	let result = null;

	async function checkSentence(event) {
		event.preventDefault(); // Prevent page reload

		error = null;
		result = null;

		try {
			const response = await fetch('/api/v1/check_sentence', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sentence, name })
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Error checking sentence");
			} else {
				result = data; // Store result for display
			}
		} catch (err) {
			error = err;
			console.error("Error checking sentence:", err);
		}
	}
</script>

<div class="flex flex-col items-center justify-center bg-gradient-to-b from-green-500 to-green-900 w-full min-h-screen p-4">
	<div class="bg-gray-800 rounded-2xl p-10">
		<div class="text-white text-lg mb-4 content-center">
			Is my sentence unique???
		</div>
		<form on:submit={checkSentence} class="flex flex-col items-center space-y-4 w-full max-w-md">
			<input
				type="text"
				bind:value={sentence}
				placeholder="Enter your sentence..."
				class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-black bg-white"
				minlength="2"
				maxlength="256"
				pattern="^[a-zA-Z0-9\s+.,!?;:()'\&quot;-]+[!?.].$"
				required
			>
			<input
				type="text"
				bind:value={name}
				placeholder="*Optional* Your name"
				class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-black bg-white"
			>
			<button
				type="submit"
				class="bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-4 rounded-lg">
				Submit
			</button>
		</form>

		<!-- Display Result -->
		{#if result}
			<div class="text-white mt-4">
				{#if result.unique}
					✅ This sentence is unique! (First time submitted)
				{:else}
					❌ This sentence has been submitted {result.count} times. (First uploaded by: {result.og_uploader_name})
				{/if}
			</div>
		{/if}

		<!-- Display Error -->
		{#if error}
			<div class="text-red-500 mt-4">{error}</div>
		{/if}
	</div>
</div>