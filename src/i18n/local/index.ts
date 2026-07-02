const modules = import.meta.glob('./*/*.ts', { eager: true });

const messages: Record<string, { common: Record<string, string> }> = {};

Object.keys(modules).forEach((path) => {
  const match = path.match(/\.\/([^/]+)\/([^/]+)\.ts$/);
  if (match) {
    const [, lang] = match;
    const module = modules[path] as { translation?: Record<string, string>; default?: Record<string, string> };

    if (!messages[lang]) {
      messages[lang] = { common: {} };
    }

    const data = module.translation || module.default;
    if (data) {
      messages[lang].common = {
        ...messages[lang].common,
        ...data
      };
    }
  }
});

export default messages;