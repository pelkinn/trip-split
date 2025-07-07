import { defineNuxtModule } from "@nuxt/kit";

export default defineNuxtModule({
  meta: {
    name: "yandexMetrika",
  },
  setup(_, nuxt) {
    if (nuxt.options.dev) {
      return;
    }
    nuxt.options.app.head.script ??= [];
    nuxt.options.app.head.script.push({
      innerHTML: `
(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
   m[i].l=1*new Date();
   for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
   k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
   (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

window.ym?.(${nuxt.options.runtimeConfig.public.yandexMetrika.id}, 'init', {
  clickmap: true,
  trackLinks: true,
  accurateTrackBounce: true,
  webvisor: true
});
`,
    });

    nuxt.options.app.head.noscript ??= [];
    nuxt.options.app.head.noscript.push({
      innerHTML: `
<div><img src="https://mc.yandex.ru/watch/${nuxt.options.runtimeConfig.public.yandexMetrika.id}" style="position:absolute; left:-9999px;" alt="" /></div>
`,
    });
  },
});
