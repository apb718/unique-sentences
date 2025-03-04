let sentence = $state('');
let name = $state('');
let error: string | null = $state(null);
let result = $state(null);

async function checkSentence(): Promise<void> {
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
			result = data; // Store the result for display
		}
	} catch (err) {
		error = "Failed to check sentence. Please try again.";
		console.log("Error checking sentence:", err);
	}
}