const { YoutubeTranscript } = require('youtube-transcript');
const fs = require('fs');

async function fetchTranscripts() {
  const ids = ['-lmPThONhhA', 'vY5IoRVTnJs', 'Vq6BWNryp5I'];
  for (const id of ids) {
    try {
      console.log(`Fetching ${id}...`);
      const transcript = await YoutubeTranscript.fetchTranscript(id);
      const text = transcript.map(t => t.text).join(' ');
      fs.writeFileSync(`tmp/${id}.txt`, text);
      console.log(`Saved ${id}.txt (${text.length} chars)`);
    } catch (e) {
      console.error(`Failed ${id}: ${e.message}`);
    }
  }
}

fetchTranscripts();
