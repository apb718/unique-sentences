import { json } from '@sveltejs/kit';
import { pool } from '$lib/db/db.js';

export const POST = async ({ request }) => {
	console.log(`INFO: POST request received for sentence check`);

	try {
		// Parse request body
		let { sentence, name } = await request.json();

		if (!sentence) {
			return json({ error: 'Sentence is required' }, { status: 400 });
		}

		if (!name) {
			name = "Unknown";
		}

		// Sentence validation regex
		const sentencePattern = /^[a-zA-Z0-9\s+.,!?;:()'"-]+[!?.]$/;

		if (!sentencePattern.test(sentence)) {
			return json({ error: "Invalid sentence format. Sentences must end with a single punctuation mark (!, ?, or .)", valid: false }, { status: 400 });
		}

		// Check if the sentence exists in the database
		const [results] = await pool.query(
			'SELECT sentenceid, count, og_uploader_name FROM sentences WHERE sentence = ?',
			[sentence]
		);

		if (results.length === 0) {
			// Sentence is unique, insert it into the database
			await pool.query(
				'INSERT INTO sentences (sentence, count, og_uploader_name) VALUES (?, ?, ?)',
				[sentence, 1, name]
			);
			return json({ unique: true, count: 1, og_uploader_name: name, valid: true });
		} else {
			// Sentence already exists, update the count
			const { sentenceid, count, og_uploader_name } = results[0];
			const newCount = count + 1;

			await pool.query(
				'UPDATE sentences SET count = ? WHERE sentenceid = ?',
				[newCount, sentenceid]
			);

			return json({ unique: false, count: newCount, og_uploader_name, valid: true });
		}
	} catch (error) {
		console.error(`ERROR: ${error.message}`);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};