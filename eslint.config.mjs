// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  // Your custom configs here
  {
    rules: { "vue/component-name-in-template-casing": ["error", "PascalCase"] },
  }
);
