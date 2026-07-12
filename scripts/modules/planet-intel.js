(() => {
    "use strict";

    const modules = globalThis.GalacticOperationsConsoleModules ??= {};

    modules.planetIntel = {
        closePopup(dashboard) {
            dashboard.querySelector("#isl-planet-popup")?.classList.add("hidden");
        },

        openPopup(dashboard) {
            dashboard.querySelector("#isl-planet-popup")?.classList.remove("hidden");
            requestAnimationFrame(() => this.layoutPopup(dashboard));
        },

        beginPopupDrag(dashboard, event) {
            if (event.button !== 0 || event.target.closest("button, input, output")) return;
            const popup = dashboard.querySelector("#isl-planet-popup");
            if (!popup || popup.classList.contains("hidden")) return;

            event.preventDefault();
            popup.dataset.moved = "true";
            const dashboardRect = dashboard.getBoundingClientRect();
            const popupRect = popup.getBoundingClientRect();
            const pointerOffsetX = event.clientX - popupRect.left;
            const pointerOffsetY = event.clientY - popupRect.top;
            this.setPopupPosition(dashboard, popupRect.left - dashboardRect.left, popupRect.top - dashboardRect.top);

            const movePopup = (moveEvent) => this.setPopupPosition(
                dashboard,
                moveEvent.clientX - dashboardRect.left - pointerOffsetX,
                moveEvent.clientY - dashboardRect.top - pointerOffsetY
            );
            const stopDragging = () => {
                window.removeEventListener("pointermove", movePopup);
                window.removeEventListener("pointerup", stopDragging);
                window.removeEventListener("pointercancel", stopDragging);
            };
            window.addEventListener("pointermove", movePopup);
            window.addEventListener("pointerup", stopDragging);
            window.addEventListener("pointercancel", stopDragging);
        },

        layoutPopup(dashboard) {
            const popup = dashboard.querySelector("#isl-planet-popup");
            if (!popup || popup.classList.contains("hidden")) return;
            if (popup.dataset.moved === "true") {
                this.setPopupPosition(dashboard, Number.parseFloat(popup.style.left) || 0, Number.parseFloat(popup.style.top) || 0);
                return;
            }

            const panel = dashboard.querySelector(".isl-panel");
            const dashboardRect = dashboard.getBoundingClientRect();
            const panelRect = panel?.getBoundingClientRect();
            const panelWidth = panelRect ? Math.max(0, panelRect.right - dashboardRect.left) : 0;
            const mapWidth = Math.max(0, dashboardRect.width - panelWidth);
            this.setPopupPosition(
                dashboard,
                panelWidth + ((mapWidth - popup.offsetWidth) / 2),
                (dashboardRect.height - popup.offsetHeight) / 2
            );
        },

        setPopupPosition(dashboard, left, top) {
            const popup = dashboard.querySelector("#isl-planet-popup");
            if (!popup) return;
            const dashboardRect = dashboard.getBoundingClientRect();
            const nextLeft = Math.min(Math.max(0, dashboardRect.width - popup.offsetWidth), Math.max(0, left));
            const nextTop = Math.min(Math.max(0, dashboardRect.height - popup.offsetHeight), Math.max(0, top));
            popup.style.left = `${nextLeft}px`;
            popup.style.top = `${nextTop}px`;
        },

        zoomAtCursor(dashboard, event, config) {
            const image = dashboard.querySelector("#isl-planet-image");
            if (!image || image.classList.contains("hidden")) return;
            event.preventDefault();
            const currentZoom = Number(image.dataset.zoom || config.zoomMin);
            this.setZoom(dashboard, currentZoom + (event.deltaY < 0 ? config.zoomStep : -config.zoomStep), event, config);
        },

        setZoom(dashboard, value, anchorEvent = null, config) {
            const zoom = Math.min(config.zoomMax, Math.max(config.zoomMin, Number(value) || config.zoomMin));
            const image = dashboard.querySelector("#isl-planet-image");
            const popupBody = dashboard.querySelector(".isl-planet-popup-body");
            const readout = dashboard.querySelector("#isl-planet-zoom-value");
            const viewportRect = popupBody?.getBoundingClientRect();
            const pointerX = anchorEvent && viewportRect ? anchorEvent.clientX - viewportRect.left : 0;
            const pointerY = anchorEvent && viewportRect ? anchorEvent.clientY - viewportRect.top : 0;
            const relativeX = anchorEvent && image ? (popupBody.scrollLeft + pointerX) / Math.max(image.offsetWidth, 1) : 0;
            const relativeY = anchorEvent && image ? (popupBody.scrollTop + pointerY) / Math.max(image.offsetHeight, 1) : 0;
            if (image) {
                image.dataset.zoom = String(zoom);
                image.style.width = `${zoom}%`;
                image.style.height = `${zoom}%`;
            }
            if (readout) readout.textContent = `${zoom}%`;
            if (anchorEvent && popupBody && image) {
                popupBody.scrollLeft = (relativeX * image.offsetWidth) - pointerX;
                popupBody.scrollTop = (relativeY * image.offsetHeight) - pointerY;
            } else if (popupBody) {
                popupBody.scrollLeft = 0;
                popupBody.scrollTop = 0;
            }
        }
    };
})();
