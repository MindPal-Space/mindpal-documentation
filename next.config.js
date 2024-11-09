import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async () => {
  const fs = await import('fs/promises');
  const { default: nextra } = await import('nextra');
  const nextraConfig = JSON.parse(
    await fs.readFile(path.join(__dirname, 'nextra.config.js'), 'utf8')
  );

  return {
    ...nextra(),
    ...nextraConfig
  };
};
