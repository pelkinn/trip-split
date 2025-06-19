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
            primary: colors.teal.base,
            secondary: colors.grey.darken4,
            success: colors.green.base,
            error: colors.red.base,
            "success-lighten-5": colors.green.lighten5,
          },
        },
      },
    },

    defaults: {
      VBtn: {
        color: "primary",
        flat: true,
        variant: "flat",
      },
      VTextField: {
        variant: "outlined",
        density: "comfortable",
      },
      VSelect: {
        variant: "outlined",
        density: "comfortable",
      },
    },
  });
  app.vueApp.use(vuetify);
});
