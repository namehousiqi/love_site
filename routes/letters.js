const fs = require('fs').promises;
const path = require('path');

// Directory for storing letters
const LETTERS_DIR = path.resolve(__dirname, '..', 'data', 'letters');

/**
 * Generate a random 6-character ID
 */
function generateId(length = 6) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

/**
 * Ensure directory exists
 */
async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

/**
 * Save a letter to disk as a JSON file
 */
async function saveLetter(letter) {
  if (!letter || typeof letter !== 'object') {
    throw new Error('Letter data must be an object');
  }

  await ensureDir(LETTERS_DIR);

  // Generate ID if not provided or invalid
  const id = (letter.id && typeof letter.id === 'string' && letter.id.length === 6) 
    ? letter.id 
    : generateId(6);
  
  const createdAt = letter.createdAt || new Date().toISOString();

  const record = {
    id,
    title: letter.title || '',
    subtitle: letter.subtitle || '',
    content: letter.content || '',
    signature: letter.signature || '',
    signatureName: letter.signatureName || '',
    password: letter.password || '',
    createdAt
  };

  const filePath = path.join(LETTERS_DIR, `${id}.json`);
  await fs.writeFile(filePath, JSON.stringify(record, null, 2), 'utf8');
  return record;
}

/**
 * Retrieve a letter by its ID from disk
 */
async function getLetter(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('Letter id must be a string');
  }
  
  const filePath = path.join(LETTERS_DIR, `${id}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      return null;
    }
    throw err;
  }
}

module.exports = {
  saveLetter,
  getLetter
};
