const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    }
  },
  { threshold: 0.16 }
);

for (const element of document.querySelectorAll(".product-stage, .manifesto, .metrics, .feature-block, .docs-block, .roadmap-block, .sdk-block, .cta")) {
  element.classList.add("reveal");
  observer.observe(element);
}

const productWindow = document.querySelector(".app-window");
const viewButtons = document.querySelectorAll("[data-view-target]");
const viewPanels = document.querySelectorAll(".view-panel");

function setProductView(view) {
  if (!productWindow) return;
  productWindow.dataset.view = view;

  for (const panel of viewPanels) {
    panel.classList.toggle("is-active", panel.dataset.view === view);
  }

  for (const button of viewButtons) {
    const isActive = button.dataset.viewTarget === view;
    button.classList.toggle("active", isActive);
    button.classList.toggle("is-selected", isActive);
  }
}

for (const button of viewButtons) {
  button.addEventListener("click", () => setProductView(button.dataset.viewTarget));
}
