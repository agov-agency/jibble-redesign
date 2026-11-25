/* Shared top bar, right side: last-out text, time clock (pickers, running timer, resume, clock button),
   members board, notes and account. Renders into <div class="topbar__right" id="topbarRight"> on every page,
   so spacing and behaviour hooks (ids) stay identical. Page scripts load after this one and wire the ids. */
(() => {
  const host = document.getElementById("topbarRight");
  if (!host) return;
  const sprite = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  sprite.setAttribute("width", "0"); sprite.setAttribute("height", "0"); sprite.setAttribute("aria-hidden", "true"); sprite.style.position = "absolute";
  sprite.innerHTML = `<symbol id="i-switch" viewBox="0 0 20 20"><path d="M4 7.5h10.5M11.5 4.5l3 3-3 3M16 12.5H5.5M8.5 9.5l-3 3 3 3"/></symbol>
<symbol id="i-notes" viewBox="0 0 20 20"><path d="M5.5 3.5h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1z"/><path d="M7.5 7.5h5M7.5 10.5h5M7.5 13.5h3"/></symbol>`;
  document.body.prepend(sprite);
  host.innerHTML = `
      <span class="topbar__last" id="topLast">Last out 4 minutes ago</span>
      <div class="clockctl" id="clockCtl">
        <span class="clockctl__state" id="topState" aria-hidden="true"><svg class="i" aria-hidden="true"><use href="#i-play"/></svg></span>
        <div class="pick">
          <button class="chip chip--activity" id="activityBtn" aria-haspopup="listbox" aria-expanded="false"><span id="activityLabel">Meetings</span></button>
          <div class="menu" id="activityMenu" role="listbox" aria-label="Activity" hidden></div>
        </div>
        <div class="pick">
          <button class="chip chip--project" id="projectBtn" aria-haspopup="listbox" aria-expanded="false"><span id="projectLabel">Mobile app</span></button>
          <div class="menu" id="projectMenu" role="listbox" aria-label="Project" hidden></div>
        </div>
      </div>
      <div class="clockrun" id="clockRun" hidden>
        <span class="clockrun__time" id="runTime" role="timer" aria-live="off">0:00:00</span>
        <button class="round-btn round-btn--go" id="runSwitch" aria-label="Switch activity" title="Switch activity"><svg class="i" aria-hidden="true"><use href="#i-switch"/></svg></button>
        <button class="round-btn round-btn--break" id="runBreak" aria-label="Start break" title="Start break"><svg class="i" aria-hidden="true"><use href="#i-coffee"/></svg></button>
        <button class="round-btn round-btn--stop" id="runStop" aria-label="Clock out" title="Clock out"><svg class="i" aria-hidden="true"><use href="#i-stop"/></svg></button>
      </div>
      <button class="resume resume-top" id="topResumeBtn" hidden></button>
      <button class="round-btn round-btn--go" id="topClockBtn" aria-label="Clock in"><svg class="i" aria-hidden="true"><use href="#i-play"/></svg></button>
      <button class="round-btn round-btn--member" id="boardBtn" aria-label="Clock in for other members" title="Clock in for other members"><svg class="i i--16" aria-hidden="true"><use href="#i-member-board"/></svg></button>
  `;
  // Profile lives at the bottom of the sidebar.
  const foot = document.querySelector(".sidebar__foot");
  if (foot) {
    foot.insertAdjacentHTML("beforeend", `<div class="pick pick--profile">
        <button class="profile" id="accountBtn" aria-label="Account menu: Jane Long"><span class="avatar avatar--32 avatar--me" aria-hidden="true">JL</span><span class="profile__txt"><span class="profile__name">Jane Long</span><span class="profile__sub">Owner</span></span></button>
      </div>`);
  }
})();
