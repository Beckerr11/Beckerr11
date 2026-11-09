import { mkdir, writeFile } from 'node:fs/promises';
const user = 'Beckerr11';
const headers = { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, 'User-Agent': 'Becker-metrics', Accept: 'application/vnd.github+json' };
async function api(path) {
  const r = await fetch(`https://api.github.com/${path}`, { headers });
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  return r.json();
}
const [profile, prs, merged, issues, events] = await Promise.all([
  api(`users/${user}`), api(`search/issues?q=author:${user}+type:pr&per_page=1`),
  api(`search/issues?q=author:${user}+type:pr+is:merged&per_page=1`),
  api(`search/issues?q=author:${user}+type:issue&per_page=1`), api(`users/${user}/events/public?per_page=30`),
]);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const stamp = new Date().toISOString().replace('T', ' ').slice(0,19) + ' UTC';
const shell = (title, height, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="${height}" viewBox="0 0 960 ${height}" role="img"><title>${esc(title)}</title><rect x="1" y="1" width="958" height="${height-2}" rx="18" fill="#0d1117" stroke="#25332d"/><style>text{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}.muted{fill:#9da9a1;font-size:13px}.label{fill:#79e6b3;font-size:12px;letter-spacing:2px}</style>${body}<text x="30" y="${height-22}" class="muted">Atualizado: ${stamp} · dados públicos</text></svg>`;
const stats = [['PULL REQUESTS',prs.total_count],['PRS MERGEADOS',merged.total_count],['ISSUES CRIADAS',issues.total_count],['REPOS PÚBLICOS',profile.public_repos]];
const overview = shell('Becker / GitHub em números',230,`<text x="30" y="38" class="label">BECKER / GITHUB EM NÚMEROS</text>` + stats.map(([label,n],i)=>`<text x="${30+i*235}" y="111" fill="#edf5ef" font-size="44" font-weight="700">${n}</text><text x="${30+i*235}" y="145" class="label">${label}</text>`).join(''));
const labels={PushEvent:'Push',PullRequestEvent:'Pull request',IssuesEvent:'Issue',IssueCommentEvent:'Comentário',PullRequestReviewEvent:'Revisão',CreateEvent:'Criação',ReleaseEvent:'Release',WatchEvent:'Star',ForkEvent:'Fork'};
const recent=events.filter(e=>e.public && !/metrics|profile-summary/i.test(e.payload?.commits?.[0]?.message||'')).slice(0,7);
const activity=shell('Becker / atividade pública recente',380,`<text x="30" y="38" class="label">ATIVIDADE PÚBLICA RECENTE</text>`+recent.map((e,i)=>`<circle cx="34" cy="${77+i*37}" r="4" fill="#79e6b3"/><text x="52" y="${82+i*37}" fill="#edf5ef" font-size="14">${esc((labels[e.type]||e.type)+' · '+e.repo.name).slice(0,105)}</text><text x="920" y="${82+i*37}" text-anchor="end" class="muted">${esc(e.created_at.slice(0,10))}</text>`).join(''));
await mkdir('assets',{recursive:true});
await writeFile('assets/github-overview.svg',overview);
await writeFile('assets/github-activity.svg',activity);
console.log(JSON.stringify({prs:prs.total_count,merged:merged.total_count,issues:issues.total_count,repos:profile.public_repos,updated:stamp}));
