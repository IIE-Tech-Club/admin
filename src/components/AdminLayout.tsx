import {
  Link,
  Outlet,
  useRouterState,
  useParams,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  auth,
  onAuthStateChanged,
  signInWithPopup,
  googleProvider,
} from "../lib/firebase";
import type { User } from "../lib/firebase";
import Loader from "./ui/Loader";
import CircuitBackground from "./ui/CircuitBackground";

interface Hackathon {
  id: string;
  title: string;
  creatorId?: string;
  phases?: { id: string }[];
}

interface RegistrationResponse {
  _id: string;
  responses: Record<string, { teamName?: string; [key: string]: unknown } | undefined>;
}

// ── Nav Icon Components ─────────────────────────────────────────────
function DashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="icon icon-tabler icons-tabler-filled icon-tabler-layout-dashboard"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M9 3a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-6a2 2 0 0 1 2 -2zm0 12a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-2a2 2 0 0 1 2 -2zm10 -4a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-6a2 2 0 0 1 2 -2zm0 -8a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-2a2 2 0 0 1 2 -2z" />
    </svg>
  );
}
function RegIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="icon icon-tabler icons-tabler-filled icon-tabler-affiliate"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18.5 3a2.5 2.5 0 1 1 -.912 4.828l-4.556 4.555a5.475 5.475 0 0 1 .936 3.714l2.624 .787a2.5 2.5 0 1 1 -.575 1.916l-2.623 -.788a5.5 5.5 0 0 1 -10.39 -2.29l-.004 -.222l.004 -.221a5.5 5.5 0 0 1 2.984 -4.673l-.788 -2.624a2.498 2.498 0 0 1 -2.194 -2.304l-.006 -.178l.005 -.164a2.5 2.5 0 1 1 4.111 2.071l.787 2.625a5.475 5.475 0 0 1 3.714 .936l4.555 -4.556a2.487 2.487 0 0 1 -.167 -.748l-.005 -.164l.005 -.164a2.5 2.5 0 0 1 2.495 -2.336z" />
    </svg>
  );
}
function TeamIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="icon icon-tabler icons-tabler-filled icon-tabler-sitemap"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M2 16.667a2.667 2.667 0 0 1 2.667 -2.667h2.666a2.667 2.667 0 0 1 2.667 2.667v2.666a2.667 2.667 0 0 1 -2.667 2.667h-2.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
      <path d="M14 16.667a2.667 2.667 0 0 1 2.667 -2.667h2.666a2.667 2.667 0 0 1 2.667 2.667v2.666a2.667 2.667 0 0 1 -2.667 2.667h-2.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
      <path d="M8 4.667a2.667 2.667 0 0 1 2.667 -2.667h2.666a2.667 2.667 0 0 1 2.667 2.667v2.666a2.667 2.667 0 0 1 -2.667 2.667h-2.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
      <path d="M12 8a1 1 0 0 0 -1 1v2h-3c-1.645 0 -3 1.355 -3 3v1a1 1 0 0 0 1 1a1 1 0 0 0 1 -1v-1c0 -.564 .436 -1 1 -1h8c.564 0 1 .436 1 1v1a1 1 0 0 0 1 1a1 1 0 0 0 1 -1v-1c0 -1.645 -1.355 -3 -3 -3h-3v-2a1 1 0 0 0 -1 -1z" />
    </svg>
  );
}
function SubIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="icon icon-tabler icons-tabler-filled icon-tabler-folder-open"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M2 6c0 -.796 .316 -1.558 .879 -2.121c.563 -.563 1.325 -.879 2.121 -.879h4l.099 .005c.229 .023 .444 .124 .608 .288l2.707 2.707h6.586c.796 0 1.558 .316 2.121 .879c.319 .319 .559 .703 .707 1.121l-14.523 0c-.407 0 -.805 .125 -1.14 .356c-.292 .203 -.525 .48 -.674 .801l-.058 .141l-1.379 3.676c-.194 .517 .068 1.093 .585 1.287c.517 .194 1.094 -.068 1.288 -.585l1.134 -3.027c.146 -.39 .519 -.649 .937 -.649h13.002l.217 .012c.216 .024 .426 .082 .624 .173c.054 .025 .107 .053 .159 .083c.199 .115 .377 .263 .525 .439c.188 .222 .325 .482 .403 .762c.077 .28 .092 .573 .045 .859c-.001 .008 -.003 .016 -.005 .024l-.995 5.21c-.131 .686 -.497 1.304 -1.036 1.749c-.47 .389 -1.046 .624 -1.65 .677l-.261 .012h-14.026c-.796 0 -1.558 -.316 -2.121 -.879c-.563 -.563 -.879 -1.325 -.879 -2.121v-11z" />
    </svg>
  );
}
function PhaseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="icon icon-tabler icons-tabler-filled icon-tabler-ease-in-out-control-points"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M19 17a3 3 0 1 1 -2.829 4h-1.171a1 1 0 0 1 0 -2h1.17a3 3 0 0 1 2.83 -2m-14 -16c1.306 0 2.418 .835 2.83 2h1.17a1 1 0 1 1 0 2h-1.171a3.001 3.001 0 1 1 -2.829 -4m9 2a1 1 0 0 1 0 2h-2a1 1 0 0 1 0 -2zm-2 16a1 1 0 0 1 0 2h-2a1 1 0 0 1 0 -2z" />
      <path d="M21 3a1 1 0 0 1 0 2c-2.83 0 -4.6 1.845 -8.152 7.53c-3.947 6.315 -6.012 8.47 -9.848 8.47a1 1 0 0 1 0 -2c2.83 0 4.6 -1.845 8.152 -7.53c3.947 -6.315 6.012 -8.47 9.848 -8.47" />
    </svg>
  );
}
function OrgIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="icon icon-tabler icons-tabler-filled icon-tabler-laurel-wreath-3"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M16.956 2.057c.355 .124 .829 .375 1.303 .796a3.77 3.77 0 0 1 1.246 2.204c.173 .989 -.047 1.894 -.519 2.683l-.123 .194q -.097 .147 -.196 .272q .066 .234 .117 .471q .26 -.178 .545 -.307c.851 -.389 1.727 -.442 2.527 -.306q .226 .04 .346 .076a1 1 0 0 1 .689 .712l.029 .13q .015 .08 .03 .18a4.45 4.45 0 0 1 -.324 2.496a3.94 3.94 0 0 1 -1.71 1.85l-.242 .12a4.23 4.23 0 0 1 -2.234 .349a9 9 0 0 1 -.443 1.023c.37 .016 .748 .093 1.128 .24c.732 .28 1.299 .758 1.711 1.367a3.95 3.95 0 0 1 .654 1.613a1 1 0 0 1 -.356 .917a3.8 3.8 0 0 1 -.716 .443c-.933 .455 -1.978 .588 -3.043 .179l-.032 -.015l-.205 -.086a3.6 3.6 0 0 1 -1.33 -1.069l-.143 -.197a4 4 0 0 1 -.26 -.433a6 6 0 0 1 -.927 .511q .18 .262 .337 .56a7.4 7.4 0 0 1 .66 1.747a1 1 0 0 1 -1.95 .444l-.028 -.11a6 6 0 0 0 -.449 -1.143c-.342 -.645 -.71 -.968 -1.048 -.968s-.706 .323 -1.048 .969a5.6 5.6 0 0 0 -.367 .874l-.082 .269l-.028 .11a1 1 0 0 1 -1.95 -.444a7.3 7.3 0 0 1 .66 -1.747q .158 -.298 .337 -.561a6.4 6.4 0 0 1 -.93 -.508a4 4 0 0 1 -.256 .43c-.366 .541 -.855 .98 -1.473 1.267l-.238 .1c-.994 .382 -1.97 .292 -2.855 -.091l-.188 -.087a3.8 3.8 0 0 1 -.716 -.443a1 1 0 0 1 -.356 -.917a3.95 3.95 0 0 1 .654 -1.613a3.6 3.6 0 0 1 1.71 -1.368c.38 -.146 .758 -.223 1.13 -.24a9 9 0 0 1 -.445 -1.023a4.23 4.23 0 0 1 -2.233 -.348a4 4 0 0 1 -.916 -.587l-.207 -.191a4 4 0 0 1 -.724 -.977l-.105 -.216a4.45 4.45 0 0 1 -.265 -2.806a1 1 0 0 1 .69 -.712q .119 -.036 .345 -.076c.801 -.135 1.678 -.082 2.53 .308q .283 .129 .545 .304q .048 -.235 .112 -.47a5 5 0 0 1 -.194 -.272c-.556 -.832 -.83 -1.806 -.642 -2.877l.05 -.242a3.75 3.75 0 0 1 1.027 -1.803l.169 -.159a4 4 0 0 1 1.303 -.796a1 1 0 0 1 .975 .178c.2 .168 .462 .446 .719 .83c.556 .833 .83 1.807 .642 2.878a3.77 3.77 0 0 1 -1.246 2.204c-.303 .27 -.607 .47 -.879 .61a7.5 7.5 0 0 0 -.255 1.971c0 3.502 2.285 6.272 5 6.272s5 -2.77 5 -6.276a7.6 7.6 0 0 0 -.253 -1.967a4.3 4.3 0 0 1 -.881 -.61a3.77 3.77 0 0 1 -1.246 -2.204c-.188 -1.07 .086 -2.045 .642 -2.877c.257 -.385 .52 -.663 .72 -.831a1 1 0 0 1 .974 -.178m-4.956 4.943a2.5 2.5 0 0 1 2.125 3.817l-.125 .183l.019 .024c.273 .372 .445 .823 .477 1.312l.005 .164a2.5 2.5 0 0 1 -2.501 2.5h-1.5a1 1 0 0 1 0 -2h1.5a.5 .5 0 1 0 0 -1h-1l-.133 -.007c-1.199 -.129 -1.154 -1.993 .133 -1.993h1l.09 -.008a.5 .5 0 0 0 -.09 -.992h-1.5a1 1 0 1 1 0 -2z" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="icon icon-tabler icons-tabler-filled icon-tabler-settings"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M14.647 4.081a.724 .724 0 0 0 1.08 .448c2.439 -1.485 5.23 1.305 3.745 3.744a.724 .724 0 0 0 .447 1.08c2.775 .673 2.775 4.62 0 5.294a.724 .724 0 0 0 -.448 1.08c1.485 2.439 -1.305 5.23 -3.744 3.745a.724 .724 0 0 0 -1.08 .447c-.673 2.775 -4.62 2.775 -5.294 0a.724 .724 0 0 0 -1.08 -.448c-2.439 1.485 -5.23 -1.305 -3.745 -3.744a.724 .724 0 0 0 -.447 -1.08c-2.775 -.673 -2.775 -4.62 0 -5.294a.724 .724 0 0 0 .448 -1.08c-1.485 -2.439 1.305 -5.23 3.744 -3.745a.722 .722 0 0 0 1.08 -.447c.673 -2.775 4.62 -2.775 5.294 0zm-2.647 4.919a3 3 0 1 0 0 6a3 3 0 0 0 0 -6" />
    </svg>
  );
}
function JudgeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="icon icon-tabler icons-tabler-filled icon-tabler-fidget-spinner"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 0a5 5 0 0 1 3.584 8.488l-.012 .012a5 5 0 0 1 1.33 2.517l.018 .101l.251 -.048q .15 -.025 .3 -.041l.304 -.024l.225 -.005a5 5 0 1 1 -4.89 6.046l-.032 -.164l-.24 .048a5 5 0 0 1 -.556 .062l-.282 .008q -.427 0 -.84 -.07l-.239 -.048l-.004 .025a5 5 0 0 1 -3.331 3.834l-.22 .068a5 5 0 1 1 -.461 -9.728l.173 .036l.019 -.102c.19 -.95 .653 -1.824 1.331 -2.516l-.05 -.052a5.02 5.02 0 0 1 -1.355 -2.978l-.018 -.244l-.005 -.225a5 5 0 0 1 5 -5m6 15a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1m-12 0a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1m6 -4.995c-1.1 0 -1.99 .891 -1.99 1.99v.02a1.99 1.99 0 0 0 3.98 0v-.02a1.99 1.99 0 0 0 -1.99 -1.99m0 -6.005a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1" />
    </svg>
  );
}
function ExitIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="icon icon-tabler icons-tabler-filled icon-tabler-layout-sidebar-right-expand"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 3a3 3 0 0 1 2.995 2.824l.005 .176v12a3 3 0 0 1 -2.824 2.995l-.176 .005h-12a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-12a3 3 0 0 1 2.824 -2.995l.176 -.005h12zm-3 2h-9a1 1 0 0 0 -.993 .883l-.007 .117v12a1 1 0 0 0 .883 .993l.117 .007h9v-14zm-3.293 4.293a1 1 0 0 1 .083 1.32l-.083 .094l-1.292 1.293l1.292 1.293a1 1 0 0 1 .083 1.32l-.083 .094a1 1 0 0 1 -1.32 .083l-.094 -.083l-2 -2a1 1 0 0 1 -.083 -1.32l.083 -.094l2 -2a1 1 0 0 1 1.414 0z" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="icon icon-tabler icons-tabler-filled icon-tabler-layout-sidebar-left-expand"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 3a3 3 0 0 1 2.995 2.824l.005 .176v12a3 3 0 0 1 -2.824 2.995l-.176 .005h-12a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-12a3 3 0 0 1 2.824 -2.995l.176 -.005h12zm0 2h-9v14h9a1 1 0 0 0 .993 -.883l.007 -.117v-12a1 1 0 0 0 -.883 -.993l-.117 -.007zm-4.387 4.21l.094 .083l2 2a1 1 0 0 1 .083 1.32l-.083 .094l-2 2a1 1 0 0 1 -1.497 -1.32l.083 -.094l1.292 -1.293l-1.292 -1.293a1 1 0 0 1 -.083 -1.32l.083 -.094a1 1 0 0 1 1.32 -.083z" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="icon icon-tabler icons-tabler-filled icon-tabler-layout-sidebar-left-collapse"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 3a3 3 0 0 1 2.995 2.824l.005 .176v12a3 3 0 0 1 -2.824 2.995l-.176 .005h-12a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-12a3 3 0 0 1 2.824 -2.995l.176 -.005h12zm0 2h-9v14h9a1 1 0 0 0 .993 -.883l.007 -.117v-12a1 1 0 0 0 -.883 -.993l-.117 -.007zm-2.293 4.293a1 1 0 0 1 .083 1.32l-.083 .094l-1.292 1.293l1.292 1.293a1 1 0 0 1 .083 1.32l-.083 .094a1 1 0 0 1 -1.32 .083l-.094 -.083l-2 -2a1 1 0 0 1 -.083 -1.32l.083 -.094l2 -2a1 1 0 0 1 1.414 0z" />
    </svg>
  );
}

interface NavItem {
  to: string;
  params: { hackathonId: string };
  label: string;
  badge: string;
  icon: React.ReactNode;
}

const SidebarContent = ({
  hackathon,
  navItems,
}: {
  hackathon: Hackathon | null;
  navItems: NavItem[];
}) => (
  <>
    {/* Logo */}
    <div className="border-b border-cyan-500/20 px-5 py-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded bg-cyan-400/20 text-sm font-bold tracking-widest text-cyan-400 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,255,255,0.2)] font-orbitron shrink-0">
          CP
        </span>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-cyan-400/80 font-orbitron">
            CodeCraft
          </p>
          <p className="text-base font-bold text-white font-orbitron">OS v3.0</p>
        </div>
      </div>
    </div>

    {/* Hackathon label */}
    {hackathon && (
      <div className="px-5 pt-4 pb-2">
        <p className="text-[9px] font-bold tracking-[0.2em] text-slate-600 font-orbitron uppercase">
          Active Node
        </p>
        <p className="text-xs font-bold text-cyan-400/80 font-orbitron uppercase truncate mt-0.5">
          {hackathon.title}
        </p>
      </div>
    )}

    <div className="px-5 pb-2 pt-3 text-[9px] font-bold tracking-[0.3em] text-slate-600 font-orbitron">
      CORE MODULES
    </div>

    <nav className="space-y-1 px-3 flex-1">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to as string}
          params={item.params as Record<string, string>}
          activeOptions={{ exact: true }}
          className="group flex items-center justify-between px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-400 transition-all border border-transparent font-orbitron rounded-sm"
          activeProps={{
            className:
              "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.08)] rounded-sm",
          }}
        >
          <span className="flex items-center gap-3">
            <span className="text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0">
              {item.icon}
            </span>
            {item.label}
          </span>
          <span className="text-[9px] opacity-40 group-hover:opacity-100 font-mono">
            {item.badge}
          </span>
        </Link>
      ))}
    </nav>

    <div className="mt-auto border-t border-cyan-500/20 p-4">
      <Link
        to="/"
        className="w-full neon-btn-outline flex items-center justify-center gap-2 !py-2.5"
      >
        <ExitIcon />
        Exit Node
      </Link>
    </div>
  </>
);

export function AdminLayout() {
  const { hackathonId } = useParams({ from: "/h/$hackathonId" });
  const [user, setUser] = useState<User | null>(null);
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stats, setStats] = useState({ registrations: 0, teams: 0, submissions: 0 });

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  // ✅ Synchronous state adjustment during render (Recommended by React 18+)
  // This avoids cascading renders and 'useEffect' performance warnings.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (drawerOpen) setDrawerOpen(false);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const idToken = await user?.getIdToken();
        const headers: HeadersInit = idToken ? { 'Authorization': `Bearer ${idToken}` } : {};

        const [hRes, rRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/registrations/${hackathonId}`, { headers }),
        ]);

        if (hRes.ok) {
          const hData = await hRes.json();
          setHackathon(hData);
        }

        if (rRes.ok) {
          const rData = (await rRes.json()) as RegistrationResponse[];
          const teamSet = new Set<string>();
          rData.forEach((reg) => {
            const teamName =
              reg.responses?.phase_2_team_formation?.teamName ||
              reg.responses?.phase_1_registration?.teamName;
            if (teamName) teamSet.add(teamName);
          });
          const submissionCount = rData.filter(
            (reg) =>
              reg.responses &&
              (reg.responses["phase_3_submissions"] ||
                Object.keys(reg.responses).length > 2),
          ).length;
          setStats({
            registrations: rData.length,
            teams: teamSet.size || (rData.length > 0 ? 1 : 0),
            submissions: submissionCount,
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, [hackathonId, setStats, setLoading, user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  const navItems: NavItem[] = [
    {
      to: "/h/$hackathonId",
      params: { hackathonId },
      label: "Dashboard",
      badge: "LIVE",
      icon: <DashIcon />,
    },
    {
      to: "/h/$hackathonId/registrations",
      params: { hackathonId },
      label: "Registrations",
      badge: String(stats.registrations),
      icon: <RegIcon />,
    },
    {
      to: "/h/$hackathonId/teams",
      params: { hackathonId },
      label: "Teams",
      badge: String(stats.teams),
      icon: <TeamIcon />,
    },
    {
      to: "/h/$hackathonId/submission",
      params: { hackathonId },
      label: "Submission",
      badge: String(stats.submissions),
      icon: <SubIcon />,
    },
    {
      to: "/h/$hackathonId/phases",
      params: { hackathonId },
      label: "Phases",
      badge: "PHZ",
      icon: <PhaseIcon />,
    },
    {
      to: "/h/$hackathonId/organizers",
      params: { hackathonId },
      label: "Organizers",
      badge: "ORG",
      icon: <OrgIcon />,
    },
    {
      to: "/h/$hackathonId/judges",
      params: { hackathonId },
      label: "Judges",
      badge: "JDG",
      icon: <JudgeIcon />,
    },
    {
      to: "/h/$hackathonId/settings",
      params: { hackathonId },
      label: "Settings",
      badge: "CFG",
      icon: <SettingsIcon />,
    },
  ];

  const pathParts = pathname.split("/").filter(Boolean);
  const lastPart = pathParts[pathParts.length - 1];
  const sectionTitle =
    !lastPart || lastPart === hackathonId
      ? "Dashboard"
      : lastPart.charAt(0).toUpperCase() + lastPart.slice(1);

  const sectionByPath: Record<string, { title: string; subtitle: string }> = {
    Dashboard: { title: "Dashboard", subtitle: "Live pulse of the hackathon floor" },
    Registrations: { title: "Registrations", subtitle: "Participant onboarding and check-in queue" },
    Teams: { title: "Teams", subtitle: "Squad health, progress, and velocity" },
    Submission: { title: "Submission", subtitle: "Judging pipeline and latest uploads" },
    Phases: { title: "Phase Architect", subtitle: "Design and configure registration phases" },
    Organizers: { title: "Organizers", subtitle: "Manage team profiles, roles, and social presence" },
    Judges: { title: "Judges", subtitle: "Manage hackathon evaluators and scoring parameters" },
    Settings: { title: "Hackathon Settings", subtitle: "Name, contact email, and identity configuration" },
  };

  const currentSection = sectionByPath[sectionTitle] ?? sectionByPath["Dashboard"];

  if (loading || authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-orbitron">
        <Loader text="Verifying Authorization..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-orbitron">
        <div className="glass-card max-w-md w-full p-8 sm:p-12 text-center border-red-500/20">
          <div className="h-16 w-16 sm:h-20 sm:w-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m0 0v2m0-2h2m-2 0H10m11-3V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 00-2-2H3" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mb-3 tracking-tighter uppercase">
            Restricted <span className="text-red-500">Access</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mb-8 leading-relaxed uppercase tracking-widest font-bold">
            Identity verification required. Execute authentication to proceed.
          </p>
          <button onClick={handleLogin} className="w-full neon-btn-cyan">
            INITIALIZE AUTHENTICATION
          </button>
          <Link to="/" className="block mt-6 text-[10px] text-slate-600 hover:text-white transition-colors uppercase tracking-[0.3em] font-black">
            Return to Node Selection
          </Link>
        </div>
      </div>
    );
  }

  if (hackathon && hackathon.creatorId && user.uid !== hackathon.creatorId) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-orbitron">
        <div className="glass-card max-w-md w-full p-8 sm:p-12 text-center border-red-500/20">
          <div className="h-16 w-16 sm:h-20 sm:w-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mb-3 tracking-tighter uppercase">
            Access <span className="text-red-500">Denied</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed uppercase tracking-widest font-bold">
            This node is protected. Only the designated creator may modify parameters for{" "}
            <span className="text-white">"{hackathon.title}"</span>.
          </p>
          
          <div className="grid gap-4 mb-8">
            <div className="p-4 bg-slate-900/50 border border-white/5 text-left">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Your Identity (UID)</p>
              <p className="text-xs text-cyan-400 font-mono font-bold break-all">{user.uid}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2">Email</p>
              <p className="text-xs text-white/70 truncate">{user.email}</p>
            </div>
            
            <div className="p-4 bg-red-500/5 border border-red-500/20 text-left">
              <p className="text-[10px] text-red-400/60 uppercase tracking-widest mb-1">Required Creator ID</p>
              <p className="text-xs text-red-400 font-mono font-bold break-all">{hackathon.creatorId}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => auth.signOut()}
              className="w-full neon-btn-outline block text-center"
            >
              SWITCH IDENTITY
            </button>
            <Link to="/" className="w-full text-[10px] text-slate-500 hover:text-white transition-colors uppercase tracking-[0.3em] font-black py-2">
              Return to Node Selection
            </Link>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-transparent text-[#e0f7ff] font-grotesk">
      {/* Unified Circuit Background */}
      <CircuitBackground opacity={0.8} />

      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 flex flex-col bg-[#040a16]/95 backdrop-blur-xl border-r border-cyan-500/20 transition-transform duration-300 ease-in-out lg:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button */}
        <button
          onClick={() => setDrawerOpen(false)}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors p-1"
          aria-label="Close menu"
        >
          <CloseIcon />
        </button>
        <SidebarContent hackathon={hackathon} navItems={navItems} />
      </aside>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1700px]">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 glass-card m-4 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:flex lg:flex-col z-20">
          <SidebarContent hackathon={hackathon} navItems={navItems} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col relative z-10">
          {/* Header */}
          <header className="glass-card m-3 sm:m-4 mb-0 py-3 sm:py-4 px-4 sm:px-6 border-cyan-500/20 backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden p-2 text-slate-400 hover:text-cyan-400 transition-colors -ml-1 shrink-0"
                aria-label="Open menu"
              >
                <MenuIcon />
              </button>

              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-orbitron text-slate-500 flex-wrap">
                  <span className="font-bold text-cyan-400 shrink-0">ADMIN</span>
                  <span className="text-slate-700 shrink-0">|</span>
                  <span className="text-white truncate">{currentSection.title}</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-500 font-medium tracking-wide hidden sm:block truncate">
                  {currentSection.subtitle}
                </p>
              </div>

              {/* Live indicator */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-cyan-500/20 bg-cyan-500/5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(0,255,255,0.8)]" />
                  <span className="text-[9px] font-bold text-cyan-400 font-orbitron uppercase tracking-widest">Live</span>
                </div>
                {/* Mobile: show hackathon name */}
                <div className="flex lg:hidden items-center">
                  {hackathon && (
                    <span className="text-[9px] text-cyan-400/60 font-orbitron uppercase tracking-widest truncate max-w-[80px]">
                      {hackathon.title}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
