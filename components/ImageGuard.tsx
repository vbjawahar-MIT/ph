"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * Site-wide photo protection (best-effort — no website can fully stop a
 * determined visitor: screenshots, the browser's own menu and developer
 * tools always remain). This closes the common, casual routes:
 *
 *   ▪ Right-click / long-press menu blocked everywhere except inside form
 *     fields (so the contact form still allows paste). Removes "Save
 *     as…", "Save image as…", "Open image in new tab", Google Lens, and
 *     the mobile "Download image" sheet.
 *   ▪ Ctrl/⌘+S (save page) and Ctrl/⌘+U (view source) are swallowed.
 *   ▪ Images and videos can't be dragged out of the page.
 *   ▪ Printing / "Save as PDF" hides every photograph (see globals.css).
 *
 * A small notice appears when something is blocked so visitors know why.
 */
export default function ImageGuard() {
  const [notice, setNotice] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const flash = () => {
      setNotice(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setNotice(false), 2200);
    };

    const isEditable = (target: EventTarget | null) =>
      target instanceof Element &&
      !!target.closest('input, textarea, select, [contenteditable="true"]');

    const onContextMenu = (e: MouseEvent) => {
      if (isEditable(e.target)) return;
      e.preventDefault();
      flash();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();
      if (key === "s" || key === "u") {
        e.preventDefault();
        flash();
      }
    };

    const onDragStart = (e: DragEvent) => {
      if (
        e.target instanceof Element &&
        e.target.closest("img, picture, video, svg image")
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", onContextMenu, { capture: true });
    document.addEventListener("keydown", onKeyDown, { capture: true });
    document.addEventListener("dragstart", onDragStart, { capture: true });
    return () => {
      window.clearTimeout(timer.current);
      document.removeEventListener("contextmenu", onContextMenu, { capture: true });
      document.removeEventListener("keydown", onKeyDown, { capture: true });
      document.removeEventListener("dragstart", onDragStart, { capture: true });
    };
  }, []);

  return (
    <AnimatePresence>
      {notice && (
        <motion.div
          role="status"
          className="pointer-events-none fixed inset-x-0 bottom-6 z-[300] flex justify-center px-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
        >
          <p className="ui-label rounded-full border border-gold/40 bg-noir/90 px-5 py-3 text-[0.68rem] text-gold-light shadow-lift backdrop-blur-md">
            © VB Photographe — photographs are protected
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
