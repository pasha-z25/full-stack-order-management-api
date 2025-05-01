import dotenvFlow from 'dotenv-flow';
import { app } from './app';

dotenvFlow.config();
const PORT = process.env.PORT || 8888;

app.listen(PORT, () => {
  const localURL = `http://localhost:${PORT}`;

  console.log(
    '\x1b[36m%s\x1b[0m',
    '   Express.js 🚀 Server running successfully'
  );
  console.log(`   - Local:        ${localURL}`);
  console.log('   ');
});
