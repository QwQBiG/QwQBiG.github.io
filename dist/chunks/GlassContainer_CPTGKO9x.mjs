import { b as createAstro, c as createComponent, m as maybeRenderHead, d as addAttribute, f as renderSlot, a as renderTemplate } from './astro/server_BR9bRUNn.mjs';
import 'piccolore';
import 'clsx';
/* empty css                          */

const $$Astro = createAstro("https://iqwqi.win");
const $$GlassContainer = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$GlassContainer;
  const {
    class: className = "",
    padding = "large"
  } = Astro2.props;
  const paddingClasses = {
    none: "",
    small: "p-4 md:p-5",
    medium: "p-6 md:p-8",
    large: "p-8 md:p-12"
  };
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(`
    glass-container
    relative overflow-hidden
    bg-white/40 
    backdrop-blur-xl 
    border border-white/60 
    rounded-[2rem]
    ${paddingClasses[padding]}
    ${className}
  `, "class")} style="
    box-shadow: 
      0 20px 40px -15px rgba(0, 0, 0, 0.1),
      0 40px 60px -20px rgba(0, 0, 0, 0.08),
      inset 0 1px 1px 0 rgba(255, 255, 255, 0.8),
      inset 0 -1px 1px 0 rgba(255, 255, 255, 0.4);
  " data-astro-cid-adcepm7b> ${renderSlot($$result, $$slots["default"])} </div> `;
}, "D:/Projects/MyBlog-Astro/src/components/ui/GlassContainer.astro", void 0);

export { $$GlassContainer as $ };
