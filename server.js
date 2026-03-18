const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;
const { saveLetter, getLetter } = require('./routes/letters');
 
app.use(express.json());

app.post('/api/letter', async (req, res) => {
  const { title, subtitle, content, signature, signatureName, password } = req.body || {};

  
  if (typeof title === 'undefined' || typeof content === 'undefined' || typeof signature === 'undefined' || typeof password === 'undefined') {
    return res.status(400).json({ success: false, error: 'Missing required fields: title, content, signature, password' });
  }

  try {
    const letter = await saveLetter({ title, subtitle, content, signature, signatureName, password });
    const id = letter.id;
    res.json({ success: true, id });
  } catch (err) {
    res.status(400).json({ success: false, error: err && err.message ? err.message : 'Failed to create letter' });
  }
});

// Get letter metadata (without password)
app.get('/api/letter/:id', async (req, res) => {
  try {
    const letter = await getLetter(req.params.id);
    if (!letter) {
      return res.status(404).json({ success: false, error: 'Letter not found' });
    }
    const { password, content, ...safeLetter } = letter;
    const hasPassword = !!password;
    if (hasPassword) {
      res.json({ success: true, letter: { ...safeLetter, hasPassword } });
    } else {
      res.json({ success: true, letter: { ...safeLetter, content, hasPassword: false } });
    }
  } catch (err) {
    res.status(400).json({ success: false, error: err && err.message ? err.message : 'Failed to get letter' });
  }
});

// Verify password and get full letter content
app.post('/api/letter/:id/verify', async (req, res) => {
  const { password } = req.body || {};
  
  if (typeof password !== 'string') {
    return res.status(400).json({ success: false, error: 'Password required' });
  }

  try {
    const letter = await getLetter(req.params.id);
    if (!letter) {
      return res.status(404).json({ success: false, error: 'Letter not found' });
    }
    
    if (letter.password && password === letter.password) {
      res.json({ success: true, letter });
    } else {
      res.status(401).json({ success: false, error: '密码错误' });
    }
  } catch (err) {
    res.status(400).json({ success: false, error: err && err.message ? err.message : 'Failed to verify' });
  }
});

// Serve static files from public directory
app.use(express.static('public'));

app.listen(port, () => {
  console.log("Server listening on port " + port);
});
