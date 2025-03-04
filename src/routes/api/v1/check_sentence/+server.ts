import { json } from '@sveltejs/kit';
import { pool } from '$lib/db/db.js';
import { v4 as uuidv4 } from 'uuid';

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
			return json({ unique: true, count: 1, og_uploader_name: name });
		} else {
			// Sentence already exists, update the count
			const { sentenceid, count, og_uploader_name } = results[0];
			const newCount = count + 1;

			await pool.query(
				'UPDATE sentences SET count = ? WHERE sentenceid = ?',
				[newCount, sentenceid]
			);

			return json({ unique: false, count: newCount, og_uploader_name });
		}
	} catch (error) {
		// @ts-ignore
		console.error(`ERROR: ${error.message}`);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};