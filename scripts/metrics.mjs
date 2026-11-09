import { mkdir, writeFile } from 'node:fs/promises';
const user = 'Beckerr11';
const token = process.env.METRICS_TOKEN || process.env.GITHUB_TOKEN;
if (!token) throw new Error('A GitHub read credential is required.');
const headers = { Authorization: `Bearer ${token}`, 'User-Agent': 'Becker-profile-metrics', Accept: 'application/vnd.github+json' };
async function graphql(query, variables = {}) {
  const res = await fetch('https://api.github.com/graphql', { method: 'POST', headers, body: JSON.stringify({ query, variables }) });
  const body = await res.json();
  if (!res.ok || body.errors?.length) throw new Error(JSON.stringify(body.errors || {status:res.status}));
  return body.data;
}
const { user: account, viewer } = await graphql(`query($login:String!){viewer{login} user(login:$login){createdAt followers{totalCount} following{totalCount} repositories(first:100,ownerAffiliations:OWNER){totalCount nodes{isPrivate stargazerCount}} pullRequests{totalCount} opened:pullRequests(states:OPEN){totalCount} merged:pullRequests(states:MERGED){totalCount} closed:pullRequests(states:CLOSED){totalCount} issues{totalCount} recent:pullRequests(first:30,orderBy:{field:UPDATED_AT,direction:DESC}){nodes{title url updatedAt state repository{nameWithOwner isPrivate}}}}}`, {login:user});
const authenticatedOwner = viewer.login.toLowerCase() === user.toLowerCase();
if (process.env.REQUIRE_OWNER === 'true' && !authenticatedOwner) throw new Error('Owner-scoped data is required; refusing to overwrite complete metrics with public-only totals.');
if (account.repositories.totalCount > account.repositories.nodes.length) throw new Error('Repository pagination required before computing totals.');
const now = new Date();
const years = Array.from({length:now.getUTCFullYear()-new Date(account.createdAt).getUTCFullYear()+1},(_,i)=>new Date(account.createdAt).getUTCFullYear()+i);
const yearly = await Promise.all(years.map(async year => {
  const from = `${year}-01-01T00:00:00Z`;
  const to = year===now.getUTCFullYear()?now.toISOString():`${year}-12-31T23:59:59Z`;
  const data = await graphql(`query($login:String!,$from:DateTime!,$to:DateTime!){user(login:$login){contributionsCollection(from:$from,to:$to){totalCommitContributions totalPullRequestReviewContributions restrictedContributionsCount contributionCalendar{totalContributions}}}}`,{login:user,from,to});
  return data.user.contributionsCollection;
}));
const sum = key => yearly.reduce((n,y)=>n+y[key],0);
const metrics = {
  scope:authenticatedOwner?'account':'public', since:account.createdAt.slice(0,10),
  prs:account.pullRequests.totalCount, prsOpen:account.opened.totalCount, prsMerged:account.merged.totalCount, prsClosed:account.closed.totalCount,
  issues:account.issues.totalCount, repositories:account.repositories.totalCount,
  publicRepositories:account.repositories.nodes.filter(r=>!r.isPrivate).length,
  privateRepositories:account.repositories.nodes.filter(r=>r.isPrivate).length,
  stars:account.repositories.nodes.reduce((n,r)=>n+r.stargazerCount,0), followers:account.followers.totalCount, following:account.following.totalCount,
  commits:sum('totalCommitContributions'), reviews:sum('totalPullRequestReviewContributions'), contributions:yearly.reduce((n,y)=>n+y.contributionCalendar.totalContributions,0), restrictedContributions:sum('restrictedContributionsCount'),
};
if (metrics.prs !== metrics.prsOpen+metrics.prsMerged+metrics.prsClosed) throw new Error('PR state totals disagree.');
if (metrics.repositories !== metrics.publicRepositories+metrics.privateRepositories) throw new Error('Repository totals disagree.');
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const stamp = now.toISOString().slice(0,19).replace('T',' ')+' UTC';
const scope = authenticatedOwner?'público + privado (somente totais)':'somente dados públicos';
const shell = (title,height,body) => `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="${height}" viewBox="0 0 960 ${height}" role="img"><title>${esc(title)}</title><rect x="1" y="1" width="958" height="${height-2}" rx="18" fill="#0d1117" stroke="#25332d"/><style>text{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}.muted{fill:#a6b7ad;font-size:12px}.label{fill:#79e6b3;font-size:12px;letter-spacing:1px}</style>${body}<text x="30" y="${height-42}" class="muted">${esc(scope)} · desde ${metrics.since}</text><text x="30" y="${height-21}" class="muted">Última coleta: ${stamp}</text></svg>`;
const stats=[['PULL REQUESTS',metrics.prs],['PRS MERGEADOS',metrics.prsMerged],['PRS ABERTOS',metrics.prsOpen],['PRS FECHADOS',metrics.prsClosed],['COMMITS NO PERFIL',metrics.commits],['CONTRIBUIÇÕES¹',metrics.contributions],['ISSUES CRIADAS',metrics.issues],['REVIEWS NO PERFIL',metrics.reviews],['REPOS PÚBLICOS',metrics.publicRepositories],['REPOS PRIVADOS',metrics.privateRepositories],['ESTRELAS RECEBIDAS',metrics.stars],['SEGUIDORES',metrics.followers]];
const overview=shell('Becker / estatísticas da conta',490,`<text x="30" y="38" class="label">BECKER / GITHUB EM NÚMEROS</text>`+stats.map(([label,n],i)=>{const x=30+(i%4)*235,y=102+Math.floor(i/4)*121;return `<text x="${x}" y="${y}" fill="#edf5ef" font-size="38" font-weight="700">${n}</text><text x="${x}" y="${y+28}" class="label">${esc(label)}</text>`;}).join('')+`<text x="30" y="410" class="muted">¹ Calendário do GitHub; commits e reviews seguem as regras de atribuição do perfil.</text>`);
const recent=account.recent.nodes.filter(p=>!p.repository.isPrivate).slice(0,6);
const state={OPEN:'aberto',MERGED:'mergeado',CLOSED:'fechado'};
const activity=shell('Becker / pull requests públicos recentes',365,`<text x="30" y="38" class="label">PULL REQUESTS PÚBLICOS / ATUALIZAÇÕES RECENTES</text>`+recent.map((p,i)=>{const y=79+i*38;return `<circle cx="34" cy="${y-4}" r="4" fill="#79e6b3"/><text x="50" y="${y}" fill="#edf5ef" font-size="13">${esc(p.repository.nameWithOwner.slice(0,51))} · ${state[p.state]}</text><text x="920" y="${y}" text-anchor="end" class="muted">${p.updatedAt.slice(0,10)}</text>`;}).join(''));
await mkdir('assets',{recursive:true});
await writeFile('assets/github-overview.svg',overview);
await writeFile('assets/github-activity.svg',activity);
await writeFile('assets/metrics.json',JSON.stringify({...metrics,updatedAt:now.toISOString()},null,2)+'\n');
console.log(JSON.stringify(metrics));
