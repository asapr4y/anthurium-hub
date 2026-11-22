// The opening artwork uses native SVG: no video, runtime library, or stored state.
function flower(className, pose, white = false) {
  return `<g class="botanical-flower ${className}" transform="${pose}"><g class="flower-open">
    <path d="M-3-22C-32-79-102-81-105-29C-108 19-48 44-2 105C42 67 98 25 95-24C90-75 30-75-3-22Z" fill="url(#${white ? 'ivory-spathe' : 'crimson-spathe'})" stroke="${white ? '#d9d0b9' : '#8c1831'}" stroke-width="1.2"/>
    <path d="M-8-18C-34-62-84-63-89-30C-95-1-45 12-8 70C-29 22-22 1-8-18Z" fill="url(#${white ? 'ivory-light' : 'petal-light'})"/>
    <path d="M-3-20C12 7 6 49-2 102C25 62 70 24 83-12C53 10 20 12-3-20Z" fill="${white ? '#cdc6a5' : '#8d1635'}" opacity="${white ? '.13' : '.21'}"/>
    <g fill="none" stroke="${white ? '#acac86' : '#ffb5ad'}" stroke-width="1" opacity="${white ? '.42' : '.35'}" stroke-linecap="round">
      <path d="M-4-14C-13 25-9 67-2 100"/>
      <path d="M-7 4C-26-14-49-27-76-30M-9 25C-33 2-60-5-85-6M-8 46C-28 28-48 19-64 17M-5 69C-18 52-34 45-43 40"/>
      <path d="M-5 6C17-14 44-28 70-29M-6 28C19 6 48-5 78-7M-7 49C13 30 38 16 57 13M-5 70C8 54 24 43 37 35"/>
    </g>
    <g class="flower-spadix"><path d="M-1 24C-4-9 3-54 13-85C18-101 31-96 27-81C17-43 13-7 12 25C9 34 1 33-1 24Z" fill="url(#gold-spadix)"/><path d="M-1 24C-4-9 3-54 13-85C18-101 31-96 27-81C17-43 13-7 12 25C9 34 1 33-1 24Z" fill="url(#spadix-grain)" opacity=".35"/><path d="M5 22C3-14 10-58 19-86" fill="none" stroke="#fff8ce" stroke-width="2" opacity=".6" stroke-linecap="round"/></g>
  </g></g>`;
}

export function heroBotanicals() {
  return `<svg class="hero-botanicals" viewBox="0 0 500 460" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="crimson-spathe" x1="-84" y1="-52" x2="68" y2="95" gradientUnits="userSpaceOnUse"><stop stop-color="#ffb7a8"/><stop offset=".25" stop-color="#f27774"/><stop offset=".53" stop-color="#db324d"/><stop offset=".8" stop-color="#b81d40"/><stop offset="1" stop-color="#790f2d"/></linearGradient>
      <linearGradient id="petal-light" x1="-65" y1="-55" x2="-13" y2="72" gradientUnits="userSpaceOnUse"><stop stop-color="#ffe1c6" stop-opacity=".65"/><stop offset="1" stop-color="#f77477" stop-opacity="0"/></linearGradient>
      <linearGradient id="ivory-spathe" x1="-88" y1="-45" x2="72" y2="86" gradientUnits="userSpaceOnUse"><stop stop-color="#fffdf0"/><stop offset=".4" stop-color="#fff9e6"/><stop offset=".75" stop-color="#e5e2c6"/><stop offset="1" stop-color="#b3b797"/></linearGradient>
      <linearGradient id="ivory-light" x1="-70" y1="-48" x2="-2" y2="83" gradientUnits="userSpaceOnUse"><stop stop-color="#ffffff" stop-opacity=".8"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
      <linearGradient id="gold-spadix" x1="0" y1="-30" x2="25" y2="-25" gradientUnits="userSpaceOnUse"><stop stop-color="#bd8d39"/><stop offset=".4" stop-color="#f8de8e"/><stop offset=".68" stop-color="#fff2b4"/><stop offset="1" stop-color="#d4aa55"/></linearGradient>
      <pattern id="spadix-grain" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".85" fill="#886923"/><circle cx="5" cy="5" r=".6" fill="#fff6bf"/></pattern>
      <linearGradient id="botanical-leaf" x1="0" y1="0" x2="140" y2="160" gradientUnits="userSpaceOnUse"><stop stop-color="#739079"/><stop offset=".45" stop-color="#386653"/><stop offset="1" stop-color="#183e36"/></linearGradient>
    </defs>
    <g stroke="#6e8b66" stroke-width="3" stroke-linecap="round">
      <path class="botanical-stem stem-left" pathLength="1" d="M70 510C17 443 4 398 76 345"/>
      <path class="botanical-stem stem-ivory" pathLength="1" d="M463 498C496 376 371 241 420 139"/>
      <path class="botanical-stem stem-right" pathLength="1" d="M458 510C425 465 449 433 455 388"/>
    </g>
    <g class="botanical-leaf leaf-left"><path d="M48 446C7 405-33 342 7 325C43 311 73 381 48 446Z" fill="url(#botanical-leaf)"/><path d="M48 446C31 396 15 354 7 331M30 395 5 370M22 374 30 350" stroke="#99b08a" stroke-width="1" opacity=".5"/></g>
    <g class="botanical-leaf leaf-right"><path d="M432 468C438 409 504 352 536 379C548 418 484 464 432 468Z" fill="url(#botanical-leaf)"/><path d="M434 466C468 439 500 407 527 383M467 438 471 410M488 419 510 422" stroke="#99b08a" stroke-width="1" opacity=".5"/></g>
    ${flower('bloom-left', 'translate(70 341) rotate(-28) scale(.92)')}
    ${flower('bloom-ivory', 'translate(435 139) rotate(28) scale(.67)', true)}
    ${flower('bloom-right', 'translate(455 382) rotate(24) scale(.84)')}
  </svg>`;
}
