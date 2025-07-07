import "vuetify/styles";
import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi-svg";
import { ru } from "vuetify/locale";
import colors from "vuetify/util/colors";

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    locale: {
      locale: "ru",
      messages: { ru },
    },

    icons: {
      defaultSet: "mdi",
      aliases: {
        ...aliases,
      },
      sets: { mdi },
    },

    theme: {
      defaultTheme: "default",
      themes: {
        default: {
          dark: false,
          colors: {
            primary: colors.cyan.base,
            secondary: colors.deepOrange.darken1,
            success: colors.green.lighten2,
            error: colors.red.lighten2,
          },
        },
      },
    },

    defaults: {
      VBtn: {
        color: "primary",
        flat: true,
        variant: "flat",
        size: "large",
        rounded: "xl",
        class: "font-weight-bold",
      },
      VTextField: {
        variant: "solo",
        flat: true,
        hideDetails: true,
      },
      VSelect: {
        variant: "solo",
        flat: true,
        hideDetails: true,
      },
    },
  });
  app.vueApp.use(vuetify);
});
