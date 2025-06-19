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
  });
  app.vueApp.use(vuetify);
});
