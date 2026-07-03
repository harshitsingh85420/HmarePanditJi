const express = require('express');

const app = express();
const port = process.env.PORT || 3004;

app.get('/', (req, res) => {
  res.send('Booking service is running');
});

app.listen(port, () => {
  console.log(`Booking service listening at http://localhost:${port}`);
});
